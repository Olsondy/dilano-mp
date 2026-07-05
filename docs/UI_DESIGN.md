# UI Design

本文档回答“页面应该怎么实现”。设计原因以 [DESIGN_LANGUAGE.md](DESIGN_LANGUAGE.md) 为准，代码组织与验证规则以 [ENGINEERING_RULES.md](ENGINEERING_RULES.md) 为准。

UI/UX 规范阅读顺序：

1. [DESIGN_LANGUAGE.md](DESIGN_LANGUAGE.md)：为什么这样设计
2. [UI_DESIGN.md](UI_DESIGN.md)：页面和组件应该怎么呈现
3. [ENGINEERING_RULES.md](ENGINEERING_RULES.md)：代码应该怎么组织与验证

## Design Direction

当前界面按以下设计决策权重实现，并针对微信小程序做了实际落地：

- Linear 45%：信息架构、卡片、网格、层级和信息密度
- Apple HIG 30%：C 端易用性、触控、动效、反馈和无障碍
- Stripe 15%：信任感、品牌强调、CTA 和服务体验
- GitHub 5%：项目状态、时间线和结构化数据
- Arc 5%：浮动导航、浮层和空间关系

比例用于设计方案冲突时的决策优先级，不代表页面像素或组件数量的机械占比。Vercel / Raycast 只作为克制视觉与即时微反馈的辅助参考，不纳入核心占比，也不主导客户侧交互。

当前视觉实现原则：

- 白底、高对比、弱阴影
- 以边框、圆角、留白和密度控制层次
- 数据、日期、金额、计数器使用 monospace 强化精确感
- 重点信息使用加粗标题与克制的功能色
- 自定义底部浮岛 tabBar + 顶部自定义 navigation bar

不要把 Web App 样式系统直接平移到小程序端。设计时需优先考虑：

- `safe-area-inset-bottom`
- Skyline 表现
- 真机字体渲染差异
- WXML / Less 的可维护性

发生设计冲突时：

1. 微信平台要求、可用性和无障碍优先于设计权重。
2. 页面结构和信息层级以 Linear 为准。
3. 触控、反馈、动效和理解成本以 Apple HIG 为准。
4. CTA、登录、服务和信任表达以 Stripe 为准。
5. 时间线、状态和数据表达参考 GitHub。
6. 浮动导航和弹层空间关系参考 Arc。

以上规则用于新增或正在修改的 UI，不要求按比例批量重构现有页面。

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

使用规则：

- 页面优先复用 `theme.less` 里的公共 token
- 页面局部变量只用于当前页面的视觉语义补充
- 不要在多个页面重复定义近似颜色变量
- 状态色只表达业务状态，不作为装饰色使用

## Global Layout

### App Shell

`miniprogram/app.less` 定义全局字体、文字颜色和基础容器风格：

- 全局字体优先系统字体栈
- 全局文本色来自 `@text-main`
- 页面级背景与结构通常在各页面 `.less` 中覆盖

### Navigation Bar

顶部导航统一基于 `miniprogram/components/navigation-bar/`：

- 适合常规页面标题栏
- 支持返回入口与自定义背景色
- 已处理胶囊按钮、安全区和左右布局

常规页面优先复用该组件，不要重新实现顶部安全区。

### Custom Tab Bar

底部主导航统一走 `miniprogram/custom-tab-bar/`：

- 胶囊浮岛样式
- 半透明白底 + 模糊背景
- 纯 CSS 几何图形 icon
- 页面进入时同步选中状态和语言文案

底部导航必须给内容区留下足够空间，避免遮挡最后一屏内容。

## Component Patterns

### Cards

卡片是主要内容容器。

推荐结构：

1. Header：状态点 + pill badge
2. Content：主标题或关键内容
3. Metadata：日期、编号、金额、统计值等 monospace 数据
4. Progress：细进度条
5. Action：轻量操作入口

使用规则：

- 浮层卡片使用真实的中性 `1rpx` border 作为 hairline，配合低透明度阴影，让边缘清楚但不产生黑色描边
- 激活卡片可以略微提高阴影深度，不使用黑色边框表达选中状态
- `swiper` 内的卡片阴影必须小于容器预留空间，避免大范围 blur 被原生滑动容器裁切成矩形灰块
- 单个项目可使用 Hero Card，强化当前主任务
- 多项目列表使用稳定宽度和高度，方便横向扫描
- 避免在卡片内添加装饰图形或过强背景

### Status Indicators

状态展示使用：

- 彩色 dot
- 灰底 pill
- 简短状态文案

不要只用彩色文字表示状态。

### Progress

进度条保持克制：

- 推荐高度 `6rpx`
- 圆角
- 通常放在卡片底部
- 使用品牌色或状态色表达进展，不做强装饰

### Icons

主导航 icon 优先使用纯 CSS 几何图形：

- Dashboard：2x2 方块
- User：圆环 + 点

状态从浅色/描边过渡到深色/填充。不要为了小图标引入零散图片资源。

### Empty States

面向客户的空态使用说明型卡片：

- 简洁的几何图形
- 直接说明当前没有什么内容
- 用一句辅助文案说明后续会发生什么
- 存在恢复能力时提供明确的刷新或重试入口

不要使用 `Idle`、闪烁光标、终端式状态词、装饰性 pulse、卡通插画或大面积装饰图。

### Loading and Skeleton

加载态优先使用骨架屏。

首页这类信息流页面需要按视口高度动态补齐骨架屏数量，避免底部出现大块空白。

### Motion and Feedback

动效只用于解释状态变化：

- 点击反馈：轻微缩放到 `0.98`
- 状态切换：约 `200ms`
- 页面或导航过渡：约 `250ms`
- 加载状态：约 `300ms`

避免 bounce、flash、rotation、elastic 等娱乐化动效。

## Current Page Patterns

### Home / Overview Page

首页 `pages/index/index` 的 UI 特征：

- 顶部标题区
- Hero 风格项目卡片 `swiper`
- 项目空态说明卡片 + 明确刷新入口
- 时间线区块 + 排序按钮
- 按屏幕高度动态计算骨架屏数量

适合复用的模式：

- “概览 + 主卡片 + 详情时间线” 的双层信息结构
- 骨架屏数量按视口高度动态补齐
- 空态卡片使用用户可理解的标题、后续说明和恢复操作

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
- 不要把整个页面改造成高度依赖 TDesign 的实现
- 如引入新的 TDesign 组件，先确认它是否真的优于现有原生实现

## UI Update Rules

- 改动视觉原则或新增组件风格时，先更新 [DESIGN_LANGUAGE.md](DESIGN_LANGUAGE.md)。
- 改动页面布局、组件模式、加载态、空态或状态展示时，更新本文档。
- 改动目录、样式组织、组件 API、验证流程时，更新 [ENGINEERING_RULES.md](ENGINEERING_RULES.md)。
