# WeChat Mini Program Project - dln-customer

This project is a WeChat Mini Program (小程序) developed using TypeScript and Less, utilizing the TDesign UI library.

## Project Overview

*   **Type:** WeChat Mini Program
*   **Language:** TypeScript (`.ts`)
*   **Styling:** Less (`.less`)
*   **UI Framework:** [TDesign Miniprogram](https://tdesign.tencent.com/miniprogram/overview)
*   **Rendering Engine:** Configured for Skyline (see `app.json` and `project.config.json`).
*   **Navigation:** Custom navigation style (`navigationStyle: "custom"` in `app.json`).

## Directory Structure

*   `miniprogram/`: The main source code directory.
    *   `pages/`: Application pages (e.g., `index`, `logs`, `my`).
    *   `components/`: Custom components (e.g., `navigation-bar`).
    *   `utils/`: Utility functions.
    *   `app.ts`, `app.json`, `app.less`: Global app logic, configuration, and styles.
    *   `miniprogram_npm/`: Generated directory for npm packages (TDesign).
*   `typings/`: TypeScript type definitions.
*   `project.config.json`: WeChat Developer Tools project configuration.
*   `package.json`: NPM dependencies and project metadata.

## Development Setup

1.  **Prerequisites:**
    *   Node.js installed.
    *   WeChat Developer Tools (微信开发者工具) installed.

2.  **Installation:**
    ```bash
    npm install
    ```

3.  **Building npm Packages:**
    *   This project is configured to pack npm packages manually (`packNpmManually: true`).
    *   After running `npm install`, open WeChat Developer Tools.
    *   Go to **Tools (工具)** -> **Build npm (构建 npm)**.
    *   This will generate/update the `miniprogram/miniprogram_npm/` directory.

4.  **Running:**
    *   Import the root directory (`dln-customer`) into WeChat Developer Tools.
    *   The project uses compiler plugins for TypeScript and Less, so the DevTools should handle compilation automatically upon save.

## Key Configuration

*   **TypeScript & Less:** Enabled via `useCompilerPlugins` in `project.config.json`.
*   **Skyline Rendering:** Enabled. Ensure your testing device or simulator supports Skyline if you encounter rendering issues, or adjust `app.json` / `project.config.json` to fallback to WebView if necessary.
*   **Custom Navigation:** The top navigation bar is hidden by default (`navigationStyle: "custom"`). Custom navigation logic is likely handled by `miniprogram/components/navigation-bar`.

## Notes for AI Assistant

*   When creating new pages, ensure to create the four required files: `.wxml`, `.ts`, `.less` (or `.wxss`), and `.json`.
*   Remember to register new pages in `miniprogram/app.json`.
*   The project uses `tdesign-miniprogram`. Refer to TDesign documentation for component usage.
*   Since `packNpmManually` is set to true, remember that `npm install` alone is not enough; the "Build npm" step in DevTools is crucial for dependencies to work.
