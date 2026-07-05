# UI Engineering Rules

本文档回答“代码应该怎么组织”。设计原因以 [DESIGN_LANGUAGE.md](DESIGN_LANGUAGE.md) 为准，页面和组件呈现以 [UI_DESIGN.md](UI_DESIGN.md) 为准。

UI/UX 规范阅读顺序：

1. [DESIGN_LANGUAGE.md](DESIGN_LANGUAGE.md)：为什么这样设计
2. [UI_DESIGN.md](UI_DESIGN.md)：页面和组件应该怎么呈现
3. [ENGINEERING_RULES.md](ENGINEERING_RULES.md)：代码应该怎么组织与验证

## Scope

本文件只约束 UI/UX 相关实现：

- 页面文件组织
- 组件 API
- Less 和 token 使用
- TDesign 使用边界
- 资源与 icon 组织
- UI 变更后的验证与文档同步

通用小程序工程规范仍参考 [MINIPROGRAM_STANDARDS.md](MINIPROGRAM_STANDARDS.md)。

## Source of Truth

UI 工程实现优先复用当前仓库已有基础设施：

- `miniprogram/styles/theme.less`
- `miniprogram/app.less`
- `miniprogram/components/navigation-bar/`
- `miniprogram/custom-tab-bar/`
- `miniprogram/utils/i18n.ts`
- 页面级 `i18n.ts`

不要引入与当前工程模型不一致的 `src/`、`app/`、`pages/api/`、`src/components/ui` 等目录习惯。

## Page Implementation

新增页面必须包含四件套：

- `.wxml`
- `.ts`
- `.less`
- `.json`

新增页面还必须：

- 在 `miniprogram/app.json` 注册路径
- 复用现有 `navigation-bar`，除非页面确实需要不同结构
- 将页面文案放入页面级 `i18n.ts` 或 `miniprogram/locales/common.ts`
- 页面状态覆盖 loading、empty、error、authenticated / unauthenticated 等真实分支

页面文案不要硬编码在 WXML / TS 中。

## Component Implementation

通用小程序组件放在 `miniprogram/components/<component-name>/`。

组件至少维护：

- `<component-name>.wxml`
- `<component-name>.ts`
- `<component-name>.less`
- `<component-name>.json`

组件规则：

- 名称使用语义化命名，不使用 `test-foo`、`new-card-2` 这类临时名称
- `properties`、`events` 保持单一职责
- 组件样式默认局部收敛
- 确需共享视觉变量时引入 `theme.less`
- 通过页面或组件自身的 `usingComponents` 注册依赖
- 不复制第三方组件源码进业务目录

## Styling Implementation

页面样式文件统一引入公共 token：

```less
@import "../../styles/theme.less";
```

路径可根据目录层级调整，但 token 来源保持一致。

样式规则：

- 使用 `rpx` 为主
- 必要时配合 `vh`、`calc()`、`env(safe-area-inset-*)`
- 保持 Less 嵌套层级可读，避免过深选择器
- 可交互元素必须有明确反馈，如 `:active`、透明度变化、轻微缩放
- 动画以轻量 transition 为主，避免高成本复杂动画
- 固定高度容器如包含文本，预留额外垂直缓冲
- 页面底部内容必须避开浮动 tabBar 和安全区

如果多个页面重复定义近似颜色、尺寸或阴影，优先判断是否应该提炼回 `theme.less`。

## Navigation and Tab Bar

顶部导航：

- 常规页面优先复用 `miniprogram/components/navigation-bar/`
- 不要在页面里重复计算顶部安全区
- `homeButton` 的 WXML 入口已存在，但组件 TS 未实现 `home()`，当前不要依赖该能力设计新流程

底部导航：

新增 tab 时必须同步更新：

1. `miniprogram/app.json`
2. `miniprogram/custom-tab-bar/index.ts`
3. `miniprogram/custom-tab-bar/i18n.ts`
4. 胶囊宽度、间距与安全区验证

页面在 `onShow()` 中负责同步 tabBar 的 `selected` 状态和语言文案。

## TDesign Boundary

当前 TDesign 只作为补充型交互组件使用：

- `t-popup`
- `t-button`
- `t-icon`
- `t-toast`

工程约束：

- 业务页面主体结构优先使用原生 WXML + Less
- 新增 TDesign 组件前先确认是否真的优于现有原生实现
- 依赖通过 npm + 微信开发者工具 `Build npm` 使用
- 禁止手动修改 `miniprogram/miniprogram_npm/`

## Assets and Icons

静态资源统一放在 `miniprogram/assets/`。

当前默认头像：

- `miniprogram/assets/default_avatar.png`

规则：

- 不要把图片散落到页面目录
- 小尺寸导航 icon 优先使用 CSS 几何图形
- 确需新增图片时，命名要表达业务含义，不使用临时文件名

## Verification

UI/UX 相关改动完成后，按影响范围验证：

- TypeScript 变更：执行 `pnpm run typecheck`
- TS / JS / JSON 变更：执行 `pnpm exec biome check <paths>`
- 微信开发者工具兼容性：执行 `pnpm run test:compat`
- 页面布局变更：在开发者工具或真机检查安全区、底部浮岛遮挡、字体高度
- loading / skeleton 变更：检查是否填满剩余视口高度
- i18n 文案变更：检查 `en` / `zh` 两套文案
- 新增 TDesign 依赖：执行微信开发者工具 `Tools -> Build npm`

WXML / Less 当前未接入统一格式化器，编辑时保持与周边文件风格一致，避免无意义的大面积重排。

## Documentation Updates

文档必须反映当前实现，而不是未来计划。

- 视觉原则变化：更新 [DESIGN_LANGUAGE.md](DESIGN_LANGUAGE.md)
- 页面或组件模式变化：更新 [UI_DESIGN.md](UI_DESIGN.md)
- UI 工程组织、验证流程或组件 API 变化：更新本文档
- 新增或删除页面路由：同步更新 [../AGENTS.md](../AGENTS.md) 的 `Project Structure`
