# Authentication

本文档说明当前仓库的登录、会话、退出与账号注销实现。以代码现状为准，不预设服务端行为。

## Scope

当前认证是“启动静默登录 + mine 页一键登录”方案：

- 应用启动后由 `App.onLaunch` 统一调用 `silent-login`
- 若静默登录返回 `NEED_ONE_CLICK_LOGIN`，用户在 mine 页触发手机号一键登录
- token 持久化到本地存储，后续请求通过 `Authorization: Bearer <token>` 发送

不包含：

- Supabase / Better Auth
- Cookie Session
- OAuth 多跳回调

## Related Files

- `miniprogram/utils/auth.ts`
- `miniprogram/utils/request.ts`
- `miniprogram/utils/config.ts`
- `miniprogram/app.ts`
- `miniprogram/pages/my/mine.ts`
- `miniprogram/pages/my/mine.wxml`

## Storage Keys

- `access_token`: 当前登录态 token
- `auth_redirect`: 请求层判断用户未登录或 token 失效后写入，用于 mine 页首次展示登录弹层

## Silent Login Flow

应用启动统一走 `AuthService.bootstrapSession()`，内部调用 `AuthService.silentLogin()`：

- 通过 `wx.login()` 获取 `loginCode`
- 请求 `POST /app/v1/auth/silent-login`
- 请求参数：

```ts
{
  loginCode,
  clientId: config.clientId,
  grantType: config.grantType
}
```

- 根据后端 `status` 处理：
  - `SUCCESS`：写入 `access_token`
  - `NEED_ONE_CLICK_LOGIN`：清理旧 token，等待用户在 mine 页手动授权登录
  - `CONTACT_SERVICE`：清理旧 token，保持未登录态（由后续业务页面决定提示方式）

## One-Click Login Flow

### 1. 用户触发登录

入口在 `miniprogram/pages/my/mine.wxml`：

- 当 `privacyAgreed` 为 `false` 时，点击按钮只做协议校验
- 当 `privacyAgreed` 为 `true` 时，按钮启用 `open-type="getPhoneNumber"`
- 授权回调进入 `handleLogin`

### 2. 获取微信登录凭证

`AuthService.getLoginCode()` 内部调用 `wx.login()`：

- 成功拿到 `res.code` 后返回
- 无 `code` 时抛错

### 3. 向后端换取 token

`AuthService.login(phoneCode)` 会请求：

- `POST /app/v1/auth/one-click-login`

请求参数：

```ts
{
  loginCode,
  phoneCode,
  clientId: config.clientId,
  grantType: config.grantType
}
```

当前实现要求后端响应包含：

```ts
{
  data: {
    access_token: string
  }
}
```

拿到 token 后通过 `setToken()` 存入本地。

## Token Lifetime Model

当前小程序 `access_token` 的有效期采用“双时钟”模型：

- `timeout (30天)`：绝对寿命。token 一旦签发，30 天倒计时立即开始。
- `active-timeout (7天)`：活跃寿命。以最近一次有效请求为基准滚动计算。

具体规则：

- 用户持续使用小程序并发起请求时，后端会刷新 `active-timeout` 的 7 天窗口。
- 用户的任何操作都不会重置 `timeout` 的 30 天绝对寿命。
- 即使用户一直活跃，只要 token 自签发起已经超过 30 天，也应视为过期。
- 即使距离签发还没满 30 天，只要连续 7 天没有有效请求，也会因为 `active-timeout` 到期而失效。

前端当前实现不会在本地计算“剩余多少天”或主动刷新 token，而是继续携带现有 `access_token` 发起请求，并依赖后端在鉴权时判断 token 是否仍然有效。

## Session Bootstrap

应用启动时，`miniprogram/app.ts` 会执行：

```ts
AuthService.bootstrapSession().then(...)
```

目标是在统一入口做静默登录，不再在 `onLaunch` 里直接请求用户信息。

## Authenticated Requests

所有业务接口默认应通过 `miniprogram/utils/request.ts` 发起。

请求层会自动：

- 读取 `access_token`
- 注入 `Authorization` 请求头
- 统一处理认证失败、业务错误与 toast

不要在业务页面直接调用裸 `wx.request` 去绕开这些逻辑，除非是上传、下载或流式等 `request()` 无法覆盖的特殊场景。

结合 token 生命周期来看：

- 前端发起请求时，不会自行重算 30 天或 7 天窗口。
- token 是否因 `timeout` 或 `active-timeout` 失效，由后端返回 401 / 业务错误码后再进入前端统一处理。
- 当前前端没有 refresh token 机制，也没有本地“续签”逻辑。

## Unauthorized Handling

`miniprogram/utils/request.ts` 将以下情况视为登录失效或需要重新登录：

- HTTP 状态码 `401`
- 业务码 `401`
- 业务码 `90400`
- 业务码 `90500`

处理顺序：

1. 删除本地 `access_token`
2. 写入 `auth_redirect = true`
3. 如果当前不在 `pages/my/mine`，则 `wx.switchTab({ url: '/pages/my/mine' })`
4. 如果当前已经在 mine 页，则直接触发当前页 `onShow()`

mine 页的 `onShow()` 会读取 `auth_redirect`：

- 若存在，则移除该标记并显示登录弹层
- 若不存在，则走 `checkLogin()` 主动拉取用户信息

## Disabled or Deleted Account

业务码 `90600` 被单独视为账号已注销或禁用：

- 请求层直接弹出 `wx.showModal`
- 不自动跳转登录
- `reject({ code: 90600, message: 'Account Disabled' })`

修改相关逻辑时，不要把 `90600` 合并进普通未登录分支。

## User Data Fetch

当前 mine 页登录态数据由两类接口组成：

- `AuthService.getUserInfo()`
  - `POST /app/v1/user`
  - 用于用户基础信息
- `AuthService.getReferralInfo()`
  - `GET /app/parties/referral-info`
  - 用于总佣金、报备人、下级报备列表

mine 页 `checkLogin()` 中：

- 先取用户信息
- 再尝试取报备信息
- 报备信息失败不会强制退出登录，只记录错误日志

## Logout

`AuthService.logout()` 调用：

- `POST /app/v1/auth/logout`

无论接口是否失败，`finally` 都会执行 `removeToken()`，保证本地退出。

mine 页 `handleLogout()` 会：

- 先弹确认框
- 用户确认后显示 loading
- 调用 `AuthService.logout()`
- 成功 toast 后回到游客态 UI

## Delete Account

`AuthService.deleteAccount()` 调用：

- `POST /app/v1/user/cancellation`

当前行为：

- 请求结束后无论成功失败都会在 `finally` 中清理 token
- mine 页确认成功后 toast，并切回游客态

修改这里时要注意：删除账号和退出登录虽然都清理 token，但 UX 提示、确认文案、后端接口不同。

## Guest State

mine 页通过 `getGuestUserInfo(lang)` 和 `getLoggedOutState(lang)` 维护游客态：

- 默认头像：`/assets/default_avatar.png`
- 名称、角色、提示文案来自 `i18n`
- 登录弹层由 `showLogin` 控制

新增登录前占位态或游客视图时，应复用这两个入口，而不是散落地手动 `setData`。

## Guardrails

- 新增登录相关能力时，优先扩展 `AuthService`，不要把 token 逻辑分散到多个页面。
- `silent-login` 应维持在 `App.onLaunch -> AuthService.bootstrapSession()` 这个单入口，不要在页面层重复调用。
- 新增需要登录的接口时，默认走 `request()`，不要手动拼 `Authorization`。
- 如果调整 token key、重定向 key 或鉴权错误码，必须同步更新本文档与 `docs/API_AND_RUNTIME.md`。
- 如果后端调整 `timeout` / `active-timeout` 策略，必须同步更新本文档中的 token 生命周期描述。
- mine 页的登录按钮依赖“先勾选隐私协议，再触发手机号授权”的顺序，修改弹层时不要破坏这个 gating。
- 当前 `navigation-bar` 的 `homeButton` 在组件 WXML 中有入口，但 TS 未实现 `home()` 方法；认证流程不要依赖它做关键跳转。
