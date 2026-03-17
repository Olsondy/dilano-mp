# Internationalization

本文档描述当前仓库的国际化结构、页面接入方式和维护约束。

## Scope

当前项目只支持两种语言：

- `en`
- `zh`

国际化实现完全基于本地工具函数与字典文件，不依赖第三方框架。不存在路由级语言前缀，也不存在服务端翻译加载。

## Related Files

- `miniprogram/utils/i18n.ts`
- `miniprogram/locales/common.ts`
- `miniprogram/custom-tab-bar/i18n.ts`
- `miniprogram/pages/index/i18n.ts`
- `miniprogram/pages/my/i18n.ts`
- `tests/i18n.test.mjs`

## Core Concepts

### Language Type

语言类型定义在 `miniprogram/utils/i18n.ts`：

```ts
export type LangType = 'en' | 'zh';
```

### Storage Key

当前语言通过本地存储 `user_lang` 持久化。

### Common Dictionary

`miniprogram/locales/common.ts` 提供跨页面复用的基础文案，例如：

- `confirmTitle`
- `processing`
- `fallbackError`
- `guestName`
- `guestPhone`
- `memberName`
- `idPrefix`

页面级文案会和这份公共文案合并。

## Utility API

### `normalizeLang(lang)`

- 任意包含 `zh` 的字符串都会归一化为 `zh`
- 其他语言默认归一化为 `en`

适用于：

- `zh`
- `zh-CN`
- `zh-Hans`
- `en-US`

### `detectSystemLang()`

通过 `wx.getSystemInfoSync().language` 检测系统语言。

失败时默认返回 `en`。

### `getCurrentLang()`

读取流程：

1. 优先读取 `user_lang`
2. 若为空，则检测系统语言
3. 将检测结果写回存储
4. 返回最终语言

### `setCurrentLang(lang)`

- 归一化后写入 `user_lang`
- 返回归一化语言

### `getI18nText(pageI18n, lang)`

将页面字典与公共字典合并，返回页面可直接绑定到 `data.text` 的对象。

### `buildDisplayId(id, lang)`

用于将用户 ID 组装为展示文案：

- 有值时输出 `ID: <value>`
- 空值时输出当前语言下的游客提示

mine 页复制 ID、切换语言时都依赖这个工具。

## Page Integration Pattern

当前页面统一采用以下模式：

1. 页面目录下维护单独的 `i18n.ts`
2. 页面加载或显示时调用 `getCurrentLang()`
3. 通过 `getI18nText(pageI18n, lang)` 生成当前页面文案
4. 把结果写到 `data.text`

示例：

```ts
import { getCurrentLang, getI18nText } from '../../utils/i18n';
import pageI18n from './i18n';

const lang = getCurrentLang();

this.setData({
  currentLang: lang,
  text: getI18nText(pageI18n, lang),
});
```

## Current File Responsibilities

### `pages/index/i18n.ts`

维护首页文案：

- 项目概览标题
- 进度、时间线、空态文案
- 项目来源和阶段状态映射

### `pages/my/i18n.ts`

维护我的页面文案：

- 登录、退出、注销、隐私协议
- 菜单分组标题
- 语言切换提示
- 报备弹层与复制 ID 提示

同时通过 `mineRoleI18n` 维护角色名称映射。

### `custom-tab-bar/i18n.ts`

维护底部 tab 文案：

- `overview`
- `account`

页面切换语言时，需要同步调用 `getTabBar().updateTabList(lang)`。

## Page-Level Language Switching

当前语言切换入口在 `pages/my/mine.ts` 的 `toggleLanguage()`：

1. 在 `en` / `zh` 之间切换
2. 调用 `setCurrentLang(newLang)`
3. 更新自定义 tabBar 文案
4. 调用 `applyLanguage(newLang)`
5. toast 提示当前切换结果

注意：

- 首页在 `onShow()` 中会重新读取当前语言，所以切换后返回首页会自动刷新文案
- 如果新增页面且依赖 tabBar，同样要在 `onShow()` 中更新 tabBar 文案

## Testing

当前已有测试文件 `tests/i18n.test.mjs`，覆盖：

- `normalizeLang`
- `getCurrentLang`
- `setCurrentLang`
- `getI18nText`

当你修改以下内容时，应同步更新或新增测试：

- 语言归一化逻辑
- 存储 key
- 公共字典合并策略
- 默认语言选择策略

## Adding a New Page

新增页面时的推荐步骤：

1. 在页面目录创建 `i18n.ts`
2. 定义 `en` / `zh` 两套文案，保持 key 一致
3. 在页面 TS 中引入 `getCurrentLang` 与 `getI18nText`
4. 在 `onLoad` / `onShow` 时写入 `data.text`
5. 如果页面属于 tabBar 体系，确认语言切换后 tab 文案可同步更新

## Guardrails

- 不要在 WXML 里直接写需要双语切换的业务文案。
- 不要在页面内临时拼接 `lang === 'zh' ? ... : ...` 作为常规方案；优先进入字典。
- 公共文案进入 `miniprogram/locales/common.ts`，只在单页使用的文案留在页面级 `i18n.ts`。
- 新增语言前必须先扩展 `LangType`、公共字典、所有页面字典和 tabBar 字典，否则类型和运行时都会不完整。
- 修改 `buildDisplayId()` 或 `guestPhone` 等展示规则时，要检查 mine 页复制 ID 和游客态表现。
