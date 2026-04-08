# DILANO Mini Program (`dilano-mp`)

## 1. 项目说明

这是 DILANO 的微信小程序前端工程，基于微信小程序原生框架 + TypeScript。

## 2. 本地开发

```bash
pnpm install
Copy-Item miniprogram/utils/config.example.ts miniprogram/utils/config.ts
pnpm run typecheck
pnpm exec biome check .
pnpm run test:compat
pnpm run test:i18n
```

在微信开发者工具中导入仓库根目录后，执行：

- `工具 -> 构建 npm`

## 3. 配置说明（开源安全模板）

仓库只提交 `miniprogram/utils/config.example.ts`。

本地开发和发布时，复制一份为 `miniprogram/utils/config.ts` 并填入真实配置：

```bash
Copy-Item miniprogram/utils/config.example.ts miniprogram/utils/config.ts
```

`config.ts` 已加入 `.gitignore`，不要提交真实地址、clientId 或其他私有配置。
