# UI Design

本文档沉淀当前仓库已经落地的界面模式、样式 token 和组件复用规则。视觉灵感可以参考 `docs/DESIGN_GUIDE.md`，但实现规范以本文档为准。

## Design Direction

当前界面风格是偏 Linear / Vercel 的轻量信息面板，但已经针对微信小程序做了实际落地：

- 白底、高对比、弱阴影
- 以边框、圆角、留白和密度控制层次
- 重点信息使用加粗标题与较克制的辅助色
- 自定义底部浮岛 tabBar + 顶部自定义 navigation bar

不要把设计稿理解成 Web App 样式系统直接平移。小程序端需优先考虑：

- `safe-area-inset-bottom`
- Skyline 表现
- 真机字体渲染差异
- WXML / Less 的可维护性

## Design Tokens

全局 token 位于 `miniprogram/styles/theme.less`。

当前主要变量：

```less
@brand-color: #0070f3;
@brand-dark: #0059c1;
@brand-light: #cfe3ff;

@bg-color: #f6f7f9;
@bg-color-2: #ffffff;
@bg-color-3: #f1f3f5;

@text-main: #0b0f14;
@text-sub: #3f4a5a;
@text-grey: #6b7785;
@text-placeholder: #a7b0bd;

@border-color: #e5e7eb;
```

约束：

- 优先复用 `theme.less` 里的公共 token
- 页面局部变量只用于当前页面的视觉语义补充
- 不要在多个页面重复定义一套几乎相同的颜色变量

## Global Layout

### App Shell

`miniprogram/app.less` 定义了全局字体、文字颜色和基础容器风格：

- 全局字体优先系统字体栈
- 全局文本色来自 `@text-main`
- 页面级背景与结构通常在各页面 `.less` 中再覆盖

### Navigation Bar

当前顶部导航统一基于 `miniprogram/components/navigation-bar/`：

- 组件 `styleIsolation` 为 `apply-shared`
- 支持 `title`、`background`、`color`、`back` 等属性
- 通过 `wx.getMenuButtonBoundingClientRect()` 和 `wx.getSystemInfo()` 计算安全区与左右布局

使用建议：

- 常规页面优先复用该组件，而不是重新实现顶部安全区
- 若只是需要纯标题栏，沿用现有组件属性即可
- `homeButton` 的 WXML 入口已存在，但组件 TS 未实现 `home()`，当前不要依赖该能力设计新流程

### Custom Tab Bar

底部主导航统一走 `miniprogram/custom-tab-bar/`：

- 胶囊浮岛样式
- 半透明白底 + 模糊背景
- 使用纯 CSS 几何图形绘制 icon
- 页面在 `onShow()` 中负责同步 `selected` 状态和语言文案

如果新增 tab：

1. 更新 `miniprogram/app.json`
2. 更新 `custom-tab-bar/index.ts`
3. 更新 `custom-tab-bar/i18n.ts`
4. 检查胶囊宽度、间距与安全区

## Current Page Patterns

### Home / Overview Page

首页 `pages/index/index` 的 UI 特征：

- 顶部标题区
- Hero 风格项目卡片 `swiper`
- 项目空态 Ghost Card
- 时间线区块 + 排序按钮
- 按屏幕高度动态计算骨架屏数量

适合复用的模式：

- “概览 + 主卡片 + 详情时间线” 的双层信息结构
- 骨架屏数量按视口高度动态补齐
- 空态卡片使用轻动画和终端式文案

### Mine / Account Page

我的页 `pages/my/mine` 的 UI 特征：

- 头像 + 昵称 + 角色徽标
- 统计卡片
- 菜单分组列表
- 底部登录/注销操作
- TDesign 弹层承载登录与报备列表

适合复用的模式：

- “资料头部 + 统计卡 + 分组菜单 + 底部动作” 的个人中心布局
- `t-popup` 承载操作型弹层
- `Toast` 用于较轻的即时反馈

## TDesign Usage Boundary

当前仓库只把 TDesign 作为补充型交互组件：

- `t-popup`
- `t-button`
- `t-icon`
- `t-toast`

约束：

- 业务页面主体结构优先使用原生 WXML + Less
- 不要为了“省事”把整个页面大面积改造成纯 TDesign 页面
- 如引入新的 TDesign 组件，先确认是否真的优于现有原生实现

## Styling Conventions

- 页面样式文件统一 `@import "../../styles/theme.less";`
- 使用 `rpx` 为主，必要时配合 `vh` / `calc()` / `env(safe-area-inset-*)`
- 保持嵌套层级可读，避免过深选择器
- 动画以轻量过渡为主，避免高成本复杂动画
- 可交互元素提供明显反馈，如 `:active`、透明度变化、轻微缩放

## Shared Component Rules

新增可复用小程序组件时：

- 目录放在 `miniprogram/components/`
- 组件名称使用语义化命名，不要出现 `test-foo`、`new-card-2` 之类临时命名
- 组件样式默认局部收敛；确需共享样式时再引入公共 token
- 对外暴露的 `properties`、`events` 保持单一职责

## Asset Rules

- 静态资源统一放在 `miniprogram/assets/`
- 当前默认头像为 `miniprogram/assets/default_avatar.png`
- 不要把图片散落到页面目录

## Guardrails

- 视觉改动若影响首页卡片、mine 菜单、navigation-bar、tabBar 的交互方式，必须同步更新本文档。
- 改动页面布局时，优先在真机或开发者工具中检查安全区与底部浮岛遮挡。
- 不要手动修改 `miniprogram/miniprogram_npm/` 中的 TDesign 产物。
- 若页面样式已经在局部重新定义大量颜色或尺寸，先判断是否应该提炼回 `theme.less`。
