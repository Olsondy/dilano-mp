# DILANO Mini Program (`dilano-mp`)

## 1. 项目说明

这是 DILANO 的微信小程序前端工程，基于微信小程序原生框架 + TypeScript。

## 2. 本地开发

```bash
pnpm install
pnpm run typecheck
pnpm exec biome check .
pnpm run test:compat
pnpm run test:i18n
```

在微信开发者工具中导入仓库根目录后，执行：

- `工具 -> 构建 npm`

## 3. 配置说明（开源安全模板）

环境配置位于 `miniprogram/utils/config.ts`，当前仓库使用可公开的占位配置：

- `trial/release` 默认是 `example.com`
- `clientId` 默认是 `REPLACE_WITH_*`

请在你自己的环境中替换成真实值后再发布。
