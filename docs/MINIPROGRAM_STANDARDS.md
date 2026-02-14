# dln-customer 小程序开发规范

本规范仅适用于本项目。

## 技术栈与基础约定
- 小程序：WeChat Mini Program
- 语言：TypeScript
- 样式：Less
- UI：TDesign Miniprogram
- 渲染：Skyline
- 导航：自定义导航 + 自定义 tabBar

## 目录结构
- `miniprogram/`：业务代码主目录
- `miniprogram/pages/`：页面
- `miniprogram/components/`：组件
- `miniprogram/utils/`：工具函数
- `miniprogram/styles/`：全局样式
- `miniprogram/assets/`：静态资源
- `miniprogram/custom-tab-bar/`：自定义 tabBar
- `miniprogram/miniprogram_npm/`：构建产物（勿手动修改）
- `project.config.json`：项目配置

## 依赖与构建
- `packNpmManually: true` 已开启。
- 安装依赖后必须在开发者工具中执行：Tools -> Build npm。
- 仅 `npm install` 不足以在开发者工具中生效。

## 页面规范
- 新页面必须包含 4 个文件：`.wxml`、`.ts`、`.less`、`.json`。
- 新页面必须在 `miniprogram/app.json` 中注册路径。
- 页面结构优先采用可复用组件，避免重复代码。

## 组件规范
- 组件放在 `miniprogram/components/` 下，按业务域或功能分组。
- 组件对外暴露的 `properties`、`events` 需要明确命名与用途。
- 组件样式尽量局部化，必要时使用全局样式变量。

## 样式规范
- 全局样式放在 `miniprogram/styles/`，页面样式放在各自 `.less` 中。
- 使用统一的设计变量（颜色、字号、间距）并避免硬编码。
- 保持层级清晰，避免过深的嵌套选择器。

## 资源与静态文件
- 图片等资源统一放在 `miniprogram/assets/`。
- 大资源避免频繁更新路径，优先走统一引用。

## TypeScript 规范
- 使用明确的类型定义，避免 `any`。
- 公共类型放在 `typings/` 或公共模块中复用。

## 代码提交与变更
- 避免直接修改 `miniprogram/miniprogram_npm/`。
- 变更页面结构或新增页面前先确认 `app.json` 路由配置。
