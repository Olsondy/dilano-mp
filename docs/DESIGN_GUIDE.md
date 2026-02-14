# Linear/Vercel Design System Guide (V1.0)

This document establishes the visual language and implementation standards for the application, inspired by Linear, Vercel, and Raycast. All UI/UX decisions must strictly adhere to these principles.

## 1. Core Philosophy
**"High Signal-to-Noise Ratio"**
- **Restraint**: Minimal use of color; focus on content and data.
- **Precision**: Pixel-perfect alignment; use of monospace fonts for data.
- **Geek Aesthetic**: Terminal vibes, subtle animations, refined micro-interactions.

---

## 2. Color Palette

### Base
- **Background**: `#FFFFFF` (Pure White)
- **Surface/Hover**: `#FAFAFA` (Ultra Light Grey)
- **Borders**: `#EAEAEA` or `rgba(0,0,0,0.06)` (1px Hairlines - **Crucial**)

### Typography Colors
- **Primary**: `#171717` (Almost Black, High Contrast)
- **Secondary**: `#666666` (Subtle Info)
- **Tertiary**: `#A1A1AA` (Meta/Labels)

### Functional Accents (Status Only)
- **Purple** (`#5E6AD2`): Processing, Active, Quoted
- **Blue** (`#0070F3`): Information, Signed, Highlight
- **Green** (`#10B981`): Success, Completed
- **Red** (`#E5484D`): Error, Timeout, destructive actions

---

## 3. Typography

- **Headings**: System Sans-serif (San Francisco/Inter). Weight: 700/800. Letter-spacing: `-1rpx`.
- **Data/Metrics**: **MANDATORY Monospace** (`'Courier New', monospace`).
  - Used for: IDs (`#p1`), Prices (`¥12,000`), Dates (`2025-10-05`), Counters.
  - Why: Conveys precision and engineering quality.
- **Sizing**: Prefer smaller, denser text (`20rpx` - `24rpx`) with ample whitespace over large text.

---

## 4. Component Standards

### Cards (Project/Item)
- **Structure**: 
  - **Header**: Status Indicator (Dot + Pill Badge).
  - **Body**: Bold Title + Monospace Metadata Grid.
  - **Footer**: Progress Bar (Thin, 6rpx height).
- **Hero Mode**: If the list contains only 1 item, the card expands to fill width (`100%`) and increases height (`~340rpx`) to become a "Hero" banner.
- **List Mode**: Horizontal scroll, fixed width (`~520rpx`), compact height (`~280rpx`).

### Visual Elements
- **Borders over Shadows**: Use `1rpx solid #EAEAEA` to define edges. Shadows should be extremely subtle (`box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05)`) and only used for lift/active states.
- **Status Indicators**: A colored dot (`10rpx`) paired with a text badge inside a pill container (`bg-gray-100`).

### Icons
- **Implementation**: Prefer **Pure CSS geometric shapes** over images/SVGs for stability and sharpness.
  - *Dashboard*: 2x2 Grid of squares.
  - *User*: Concentric circles (Ring + Dot).
- **States**: Outline (Inactive) -> Filled/Dark (Active).

### Navigation (Tab Bar)
- **Style**: Floating glass bar or fixed bottom bar.
- **Effect**: `background: rgba(255,255,255,0.85)` + `backdrop-filter: blur(20px)`.
- **Border**: Top border `1rpx solid rgba(0,0,0,0.1)`.

### Empty States
- **The "Ghost" Card**:
  - `border: 2rpx dashed #EAEAEA`.
  - Content: Minimal geometric pulse animation + Terminal-style text ("Status: Idle_").
  - Cursor blinking animation is mandatory.

---

## 5. Interaction & Animation
- **Feedback**: `active` state should scale down (`0.98`) and darken background slightly.
- **Transitions**: All state changes (hover, switch, sort) must have smooth CSS transitions (`0.2s cubic-bezier`).
- **Loading**:
  - **Skeleton Screens**: Must be dynamically calculated to fill the **entire** viewport height. No white gaps at the bottom.

---

## 6. Real-Device Considerations (WeChat Mini Program)
- **SafeArea**: Always handle `env(safe-area-inset-bottom)`.
- **Layout**: 
  - Avoid relying solely on `padding-bottom` for card spacing; use `margin-bottom` to force physical separation from container edges.
  - Font rendering on devices is taller than in DevTools; always add vertical buffer (`+20rpx`) to fixed-height containers.
