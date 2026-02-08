# dln-customer agent instructions

Scope: This file applies to the entire repository.

## Project overview
- WeChat Mini Program using TypeScript and Less.
- UI library: TDesign miniprogram.
- Rendering: Skyline.
- Custom navigation and custom tab bar.

## Build and tooling
- `packNpmManually` is enabled. After `npm install`, open WeChat DevTools and run Tools -> Build npm.
- `npm install` alone is not sufficient to make npm packages available in DevTools.

## New pages
- Every new page must include 4 files: `.wxml`, `.ts`, `.less`, `.json`.
- Register the new page path in `miniprogram/app.json`.

## Large files and folders
- Do not read `package-lock.json`.
- Do not read or scan `miniprogram/miniprogram_npm` unless explicitly required.
- Prefer minimal file reads focused on `miniprogram/pages` and `miniprogram/components`.
