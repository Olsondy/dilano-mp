## Project Overview
<!-- section:project intro -->

`dln-customer` 是一个基于微信小程序原生框架实现的客户侧项目，主代码位于 `miniprogram/`。当前已落地的核心功能包括：

- 首页项目概览：拉取客户项目列表、展示项目阶段、进度、时间线与空态卡片。
- 我的页面：展示用户资料、报备信息、语言切换、客服/反馈入口、隐私协议、退出登录与注销账号。
- 认证与会话：通过 `wx.login` + `getPhoneNumber` 发起一键登录，使用后端 `access_token` 维持会话。
- 国际化：支持 `en` / `zh` 两套文案，采用本地 `i18n` 工具与页面级字典，不依赖第三方 i18n 框架。
- 运行时能力：应用启动时检查会话，前后台切换时发送心跳，支持 `web-view` 页面承载外部链接。

项目当前不是 React / Vue / Next.js / Nuxt 应用，修改实现或文档时必须以微信小程序目录、生命周期和 API 约束为准。

## Key Technologies & Stack

- Runtime: WeChat Mini Program 原生框架
- Language: TypeScript
- Styling: Less
- UI Library: `tdesign-miniprogram`（当前主要使用 `popup`、`button`、`icon`、`toast`）
- Component Model: Glass-Easel + 自定义组件 + 自定义 `tabBar`
- Rendering: Skyline（`project.config.json` 已开启 `skylineRenderEnable`）
- Tooling: `pnpm`、Biome、TypeScript、Husky
- Testing: Node 内置 `node:test`（当前已有 `tests/i18n.test.mjs`）

关键配置文件：

- `project.config.json`：微信开发者工具工程配置、`miniprogramRoot`、NPM 打包、Skyline 开关
- `miniprogram/app.json`：页面注册、`custom tabBar`、全局窗口配置
- `biome.json`：TS/JS/JSON 格式化与 lint 规则
- `tsconfig.json`：TypeScript 严格模式与类型根目录

## Development Commands

本仓库没有 `dev` / `build` 脚本，日常开发以微信开发者工具为主。

```bash
# 安装依赖（优先使用 pnpm，与 packageManager 保持一致）
pnpm install

# TypeScript 类型检查
pnpm run typecheck

# Biome 检查
pnpm exec biome check .

# 仅检查并格式化已暂存文件（与 pre-commit 一致）
pnpm run lint:staged

# 微信开发者工具兼容性检查
pnpm run test:compat

# Biome 自动修复
pnpm exec biome check --write .

# 当前已有的 i18n 测试
pnpm run test:i18n
```

微信开发者工具流程：

1. 打开项目根目录。
2. 确认 `miniprogramRoot` 指向 `miniprogram/`。
3. 安装依赖后执行 `Tools -> Build npm`，生成/更新 `miniprogram/miniprogram_npm/`。
4. 使用开发者工具进行编译、预览与真机调试。

提交前钩子：

- `typescript` 作为本地 `devDependency` 提供 `tsc`，不要依赖全局安装
- `.husky/pre-commit` 会先执行 `pnpm run lint:staged`
- 随后执行 `pnpm run typecheck`

## Code Standards

通用基线：

- 业务代码统一放在 `miniprogram/`，不要引入与当前工程模型不一致的 `src/`、`app/`、`pages/api/` 等目录习惯。
- 新增页面或组件时优先复用现有 `navigation-bar`、`custom-tab-bar`、`theme.less`、`utils/i18n.ts`、`utils/request.ts`。
- API 访问默认走 `miniprogram/utils/request.ts`，不要在业务页面里直接散落 `wx.request`。
- 文案必须进入页面级 `i18n.ts` 或 `miniprogram/locales/common.ts`，不要把中英文硬编码进 WXML / TS。
- `miniprogram/miniprogram_npm/` 是构建产物，禁止手动编辑。

### Current Repo Baseline (Overrides)

If any example in this file conflicts with the current repository implementation, this section takes precedence.

当前仓库的真实基线如下：

- 这是微信小程序项目，不是 Next.js / Nuxt / React Web 项目。
- 认证方案是自研 token 流程：`wx.login` + 手机号授权 + 后端 `access_token`
- 国际化采用 `miniprogram/utils/i18n.ts` + 页面级 `i18n.ts` 字典
- 可复用组件目录是 `miniprogram/components/`，不存在 `src/components/ui` 这一套生成式组件目录。
- 页面路由注册在 `miniprogram/app.json`，自定义底部导航在 `miniprogram/custom-tab-bar/`。

### Agent Interaction Protocol

Use these rules across IDE agents when executing tasks in this repository:

1. Keep responses concise and task-focused.
2. Prefer patch-level or changed-block outputs over full-file rewrites when presenting code.
3. Explain complex reasoning in Chinese when needed, while keeping code identifiers in English.
4. For simple UI/content fixes, skip over-formal reasoning blocks and focus on the edit.
5. 修改页面、路由、国际化、认证、请求层时，先阅读对应领域文档，避免把 Web 项目约定误套到小程序目录。

### Documentation Updates

**CRITICAL**: Always update related documentation files after making code changes:

- After auth changes -> Update [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md)
- After i18n changes -> Update [docs/INTERNATIONALIZATION.md](docs/INTERNATIONALIZATION.md)
- After request/lifecycle/env changes -> Update [docs/API_AND_RUNTIME.md](docs/API_AND_RUNTIME.md)
- After adding or removing pages/routes -> Update the `## Project Structure` outline in [AGENTS.md](AGENTS.md)
- After UI component changes -> Update [docs/UI_DESIGN.md](docs/UI_DESIGN.md)

Documentation should reflect the actual implementation, not intended behavior.

### Formatting & Linting

- TypeScript / JavaScript / JSON 统一使用 Biome；缩进为 2 个空格，TS/JS 默认单引号，行尾为 LF。
- `tsconfig.json` 已启用严格模式：`strict`、`noImplicitAny`、`noUnusedLocals`、`noUnusedParameters` 等规则默认生效。
- 类型检查统一通过本地脚本 `pnpm run typecheck` 触发；不要假定系统里存在全局 `tsc`。
- 小程序源码里不要使用 `import type` 或 `import { ..., type Foo }` 这类写法，微信开发者工具的 TS 编译兼容性不稳定；需要时优先使用普通导入。
- WXML / Less 当前未接入统一格式化器，编辑时保持与周边文件风格一致，避免无意义的大面积重排。
- 提交前至少自行执行一次 `pnpm run typecheck`；涉及 TS/JS/JSON 变更时建议执行 `pnpm exec biome check --write <paths>`。
- `typings/` 已在 Biome override 中排除，不要为了格式化而重写类型声明文件。

### API & Frontend Guardrails

在改动 API 调用、应用生命周期或页面跳转前，先阅读 [docs/API_AND_RUNTIME.md](docs/API_AND_RUNTIME.md)。

- 统一通过 `miniprogram/utils/request.ts` 发起 JSON 请求，以保留 base URL、token 注入、401 处理与业务错误提示。
- 环境切换依赖 `wx.getAccountInfoSync().miniProgram.envVersion`，配置源在 `miniprogram/utils/config.ts`。
- `401`、业务码 `401`、`90400`、`90500` 会清理 token、写入 `auth_redirect` 并跳转到 `/pages/my/mine`。
- 业务码 `90600` 会直接弹出账号状态提示，不走普通登录重试分支。
- `App.onLaunch` 会主动校验会话，`App.onShow` / `App.onHide` 会启动或停止心跳；不要绕开这些入口重复实现同类逻辑。
- `pages/webview/index` 约定接收编码后的 `url` 参数，并在页面内 `decodeURIComponent` 后透传给 `<web-view />`。

### UI Component Pattern

在创建或调整界面前，先阅读 [docs/UI_DESIGN.md](docs/UI_DESIGN.md)。

当前仓库的 UI 实现模式：

- 全局设计 token 放在 `miniprogram/styles/theme.less`，页面样式先复用 token，再决定是否补充局部变量。
- 顶部导航优先复用 `miniprogram/components/navigation-bar/`，底部主导航统一走 `miniprogram/custom-tab-bar/`。
- 页面文案与视觉状态通常按“页面 TS + 页面 WXML + 页面 Less + 页面 i18n.ts”四件套维护。
- TDesign 仅作为局部交互组件补充，不要把整个页面改造成高度依赖第三方组件的实现。
- 首页和我的页面已经形成两套可复用样式范式：卡片/时间线页、资料/菜单/弹层页；新增页面优先参考相近模式。

### Adding New Components
**IMPORTANT**: NEVER manually add components to `src/components/ui`.

当前仓库没有 `src/components/ui`。新增组件时请遵循以下真实基线：

- 通用小程序组件放在 `miniprogram/components/<component-name>/`
- 每个组件至少维护 `.ts`、`.wxml`、`.less`、`.json`
- 通过页面或组件自身的 `usingComponents` 注册依赖
- 如需复用文案，组件级文案优先收敛到调用页面的 `i18n.ts` 或公共 `miniprogram/locales/common.ts`
- 禁止把第三方组件源码复制进业务目录；`tdesign-miniprogram` 统一通过 npm + `Build npm` 使用

## Project Structure

```text
dln-customer/
├─ AGENTS.md
├─ README.md
├─ biome.json
├─ package.json
├─ project.config.json
├─ tsconfig.json
├─ docs/
│  ├─ API_AND_RUNTIME.md
│  ├─ AUTHENTICATION.md
│  ├─ DESIGN_GUIDE.md
│  ├─ INTERNATIONALIZATION.md
│  ├─ MINIPROGRAM_STANDARDS.md
│  └─ UI_DESIGN.md
├─ miniprogram/
│  ├─ app.json
│  ├─ app.less
│  ├─ app.ts
│  ├─ sitemap.json
│  ├─ assets/
│  │  └─ default_avatar.png
│  ├─ components/
│  │  └─ navigation-bar/
│  ├─ custom-tab-bar/
│  │  ├─ i18n.ts
│  │  ├─ index.json
│  │  ├─ index.less
│  │  ├─ index.ts
│  │  └─ index.wxml
│  ├─ locales/
│  │  └─ common.ts
│  ├─ miniprogram_npm/
│  │  └─ tdesign-miniprogram/        # 构建产物，勿手改
│  ├─ pages/
│  │  ├─ index/
│  │  │  ├─ i18n.ts
│  │  │  ├─ index.json
│  │  │  ├─ index.less
│  │  │  ├─ index.ts
│  │  │  └─ index.wxml
│  │  ├─ my/
│  │  │  ├─ i18n.ts
│  │  │  ├─ mine.json
│  │  │  ├─ mine.less
│  │  │  ├─ mine.ts
│  │  │  └─ mine.wxml
│  │  └─ webview/
│  │     ├─ index.json
│  │     ├─ index.less
│  │     ├─ index.ts
│  │     └─ index.wxml
│  ├─ styles/
│  │  └─ theme.less
│  └─ utils/
│     ├─ auth.ts
│     ├─ config.ts
│     ├─ heartbeat.ts
│     ├─ i18n.ts
│     ├─ request.ts
│     └─ util.ts
├─ tests/
│  ├─ i18n.test.mjs
│  └─ ts-extension-loader.mjs
└─ typings/
   ├─ index.d.ts
   └─ types/
```

页面职责：

- `pages/index/index`：项目总览、进度卡片、时间线、下拉刷新
- `pages/my/mine`：用户资料、登录弹层、报备列表、语言切换、客服/反馈、隐私与账号操作
- `pages/webview/index`：承载外部网页

## Domain-Specific Documentation

The project has detailed documentation for each domain. **ALWAYS read the relevant documentation files before working on related features.**

### ALWAYS Read These Files Before:

- **[docs/AUTHENTICATION.md](docs/AUTHENTICATION.md)**
  - When working with login flow, token storage, logout, delete account, or auth redirects
  - Covers: `AuthService`, `request.ts` 认证分支、`auth_redirect` 机制、mine 页登录弹层
  - Current repo baseline: `wx.login` + `getPhoneNumber` + backend `access_token`

- **[docs/INTERNATIONALIZATION.md](docs/INTERNATIONALIZATION.md)**
  - When modifying page copy, adding translations, switching language, or updating tab labels
  - Covers: `utils/i18n.ts`、公共文案、页面级 `i18n.ts`、语言存储与测试模式
  - Current repo baseline: 本地 `en` / `zh` 字典 + `setData` 更新，不依赖第三方 i18n 插件

- **[docs/API_AND_RUNTIME.md](docs/API_AND_RUNTIME.md)**
  - When modifying API requests, environment config, app lifecycle, heartbeat, or webview behavior
  - Covers: `config.ts`、`request.ts`、`heartbeat.ts`、`app.ts`、运行时约束
  - Current repo baseline: 环境配置按小程序发布环境切换，请求层统一处理 token 与错误码

### Read When Relevant:

- **[docs/UI_DESIGN.md](docs/UI_DESIGN.md)**
  - When creating/modifying WXML/Less, page layouts, shared components, or popup/card/timeline UI
  - Covers: 视觉 token、页面布局模式、组件复用方式、TDesign 使用边界

- **[docs/MINIPROGRAM_STANDARDS.md](docs/MINIPROGRAM_STANDARDS.md)**
  - When adding pages, components, assets, or checking general mini program engineering conventions
  - Covers: 目录基线、Build npm、页面/组件文件组成、生成物约束

- **[docs/DESIGN_GUIDE.md](docs/DESIGN_GUIDE.md)**
  - When you need the original visual inspiration or legacy design direction
  - Covers: Linear / Vercel 风格来源说明
  - Note: 以 [docs/UI_DESIGN.md](docs/UI_DESIGN.md) 的当前仓库落地规则为准

## Quick Reference

### Translations

```typescript
import { getCurrentLang, getI18nText, setCurrentLang } from '../../utils/i18n';
import pageI18n from './i18n';

const lang = getCurrentLang();

this.setData({
  currentLang: lang,
  text: getI18nText(pageI18n, lang),
});

setCurrentLang(lang === 'en' ? 'zh' : 'en');
```
