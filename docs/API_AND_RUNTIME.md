# API and Runtime

本文档记录当前仓库的请求封装、环境配置、应用生命周期与运行时约束。

## Related Files

- `miniprogram/utils/config.ts`
- `miniprogram/utils/request.ts`
- `miniprogram/utils/heartbeat.ts`
- `miniprogram/utils/auth.ts`
- `miniprogram/app.ts`
- `miniprogram/pages/index/index.ts`
- `miniprogram/pages/my/mine.ts`
- `miniprogram/pages/webview/index.ts`

## Environment Configuration

环境配置位于 `miniprogram/utils/config.ts`，通过：

```ts
wx.getAccountInfoSync().miniProgram.envVersion
```

判断当前运行环境。

当前内置环境：

- `develop`
- `trial`
- `release`

每个环境至少维护：

- `baseUrl`
- `clientId`

对外暴露的配置对象为：

```ts
export const config = {
  baseUrl: activeConfig.baseUrl,
  clientId: activeConfig.clientId,
  grantType: 'phone'
};
```

修改约束：

- 新增环境或调整域名时，统一修改 `config.ts`
- 不要在业务页面里硬编码完整 API 域名

## Request Wrapper

统一请求入口是 `miniprogram/utils/request.ts`。

### Default Behavior

请求层默认：

- 拼接 `config.baseUrl + options.url`
- 默认 `Content-Type: application/json`
- 读取本地 `access_token`
- 若 token 存在则注入 `Authorization: Bearer <token>`

当前 token 生命周期由后端控制：

- `timeout = 30天`：token 签发后开始计算的绝对寿命，不因前端请求而重置
- `active-timeout = 7天`：活跃寿命，后端会在有效请求时刷新这个窗口

这意味着前端请求层只负责“持续带 token 发请求”，不负责在本地续签或重算过期时间。

### Success and Error Rules

HTTP `2xx` 下仍会检查业务码：

- `data.code === 200` 或无业务码，视为成功
- 其他业务码视为失败，并弹出 `wx.showToast`

非 `2xx` 或请求失败时：

- `reject(res.data || { message: 'Network Error' })`

## Known Auth-Related Error Handling

请求层当前内建了认证错误分支：

- `401`
- `90400`
- `90500`
- `90600`

含义可参考 [AUTHENTICATION.md](./AUTHENTICATION.md)，这里重点说明运行时行为：

- 401/90400/90500：清 token、标记 `auth_redirect`、跳到 mine 页
- 90600：弹出账号禁用/注销提示，不走普通重新登录流程

新增接口时不要在页面里手工复制这段逻辑，直接复用 `request()`。

补充说明：

- 如果 token 因 30 天绝对寿命到期失效，前端表现与普通未登录一致，仍通过统一 401 分支处理。
- 如果 token 因 7 天未活跃而失效，前端同样不会提前感知，而是在下一次请求失败后走统一登录失效流程。

## Current API Usage

从当前代码可见的接口包括：

- `POST /app/v1/auth/one-click-login`
- `POST /app/v1/auth/logout`
- `POST /app/v1/user`
- `POST /app/v1/user/cancellation`
- `GET /app/parties/referral-info`
- `GET /app/parties/customer-projects`
- `GET /app/v1/heartbeat`

当前页面职责：

- 首页拉取 `customer-projects`
- 我的页拉取 `user` 与 `referral-info`
- App 前后台切换发送 `heartbeat`

## App Lifecycle

`miniprogram/app.ts` 当前主要负责三件事：

### 1. Update Check

`checkUpdate()` 会：

- 使用 `wx.getUpdateManager()`
- 检测新版本
- 在版本准备完成后弹窗提示重启

### 2. Session Bootstrap

`onLaunch()` 中调用：

```ts
AuthService.getUserInfo().catch(...)
```

用于在应用启动时尽早探测登录态。

### 3. Heartbeat

- `onShow()` -> `HeartbeatService.start()`
- `onHide()` -> `HeartbeatService.stop()`

不要在页面层重复注册长轮询或定时心跳而忽略全局生命周期。

## Heartbeat Service

`miniprogram/utils/heartbeat.ts` 的行为：

- 心跳周期为 5 分钟
- 仅在本地存在 token 时发送
- 接口为 `GET /app/v1/heartbeat`
- 会把当前时间戳作为 `data.timestamp` 发给后端

`start()` 逻辑：

1. 先 `stop()`，避免重复定时器
2. 如果距离上一次发送超过周期，立即补发一次
3. 再建立新的定时器

修改时请保留“去重 + 前后台恢复后补发”的特性。

## Page Runtime Notes

### `pages/index/index.ts`

- `onShow()` 时应用当前语言、同步 tabBar，并重新拉取首页数据
- 支持下拉刷新
- 骨架屏数量会按设备窗口高度动态计算
- 后端数据通过 `mapBackendToUI()` 转成页面展示结构

### `pages/my/mine.ts`

- `onShow()` 时应用当前语言、同步 tabBar
- 读取 `auth_redirect` 决定是否直接弹出登录框
- 登录成功、退出登录、注销账号后都直接刷新本页状态

### `pages/webview/index.ts`

- 接收 `options.url`
- 使用 `decodeURIComponent` 还原
- 最终传给 `<web-view src="{{url}}" />`

如果新增从业务页跳到 webview 的入口，请确保传入的是编码后的 URL。

## Guardrails

- 新增普通 JSON 接口时，默认只扩展 `request()` 调用点，不新增第二套网络封装。
- 新增环境变量时，优先放到 `config.ts`，不要分散到页面常量。
- 修改心跳频率或路径时，务必同步检查 `App.onShow` / `onHide` 调用关系。
- 不要在前端硬编码 token 到期倒计时或本地续期逻辑，除非后端协议已经明确变化并同步更新认证文档。
- 修改 `app.json` 页面注册、tabBar 或窗口配置后，应同步更新 `AGENTS.md` 的项目结构与相关说明。
- 如果未来需要上传文件、下载文件或 SSE/WebSocket，请在保留现有 request 语义的前提下新增专用封装，不要破坏当前登录重定向链路。
