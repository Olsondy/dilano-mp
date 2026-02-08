# WeChat Mini Program - dln-customer

**Context:** TypeScript | Less | TDesign UI | Skyline Rendering | Custom Navigation

## Critical Development Rules

1.  **Build Process**:
    - `packNpmManually: true` is set.
    - Run `npm install` -> Open DevTools -> **Tools** -> **Build npm**.
    - merely `npm install` is INSUFFICIENT.

2.  **New Pages**:
    - MUST create 4 files: `.wxml`, `.ts`, `.less`, `.json`.
    - MUST register new page path in `miniprogram/app.json`.

## AI Token Optimization Rules

1.  **Efficient Reading**:
    - Do NOT read `package-lock.json` or large `miniprogram_npm` directories.
    - Use `view_file_outline` FIRST to understand file structure before reading full content.
    - Read only relevant line ranges when debugging or modifying.

2.  **Concise Context**:
    - Avoid listing all files in directory unless searching for something specific.
    - Focus on `miniprogram/pages` and `miniprogram/components` for feature work.
