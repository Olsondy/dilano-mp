# DILANO Design Language

> Why DILANO looks and feels this way.
>
> Customer-facing project service design language for WeChat Mini Program.
>
> Version: 2.2
>
> Core design decision weights: Linear 45%, Apple HIG 30%, Stripe 15%, GitHub 5%, Arc 5%.

---

# 1. Document Role

This document defines the design language of DILANO.

It answers:

- Why the interface should feel calm, precise, and information-dense.
- Why color is restrained.
- Why borders, typography, spacing, and motion carry the experience.
- Why WeChat Mini Program constraints shape the visual system.

Read UI/UX rules in this order:

1. `DESIGN_LANGUAGE.md` - Why
2. `UI_DESIGN.md` - What and How
3. `ENGINEERING_RULES.md` - How to Build

---

# 2. Product Vision

DILANO is a customer-facing project service experience built for clarity, trust, and effortless progress tracking.

The interface should communicate:

- Precision
- Trust
- Speed
- Calmness
- Professionalism

Every screen should feel engineered rather than decorated.

Users should understand what is important within seconds without relying on visual effects.

---

# 3. Core Philosophy

## High Signal-to-Noise Ratio

The product should maximize useful signal and minimize visual noise.

Use restraint:

- Minimal color
- No decorative gradients
- No marketing banners
- No cartoon empty states
- No visual elements that do not clarify information

Use precision:

- Consistent spacing
- Hairline borders
- Aligned metadata
- Monospace data
- Stable component dimensions

Use a professional technical aesthetic:

- Clear, reassuring empty-state guidance for customer-facing flows
- Subtle micro-interactions
- Crisp geometric icons
- Dense but readable information panels

---

## Information First

Content is always more important than decoration.

Every visual element must help users understand information faster.

Never add UI purely for aesthetics.

---

## Task-oriented Design

Every page should focus on one primary task.

Avoid presenting multiple competing actions.

Users should immediately understand:

- Where am I?
- What requires attention?
- What can I do next?

---

## Calm Premium

Premium does not mean luxurious.

Premium comes from:

- Typography
- Layout
- Spacing
- Motion
- Consistency

Not from:

- Bright colors
- Large gradients
- Decorative graphics

---

## Engineering Precision

Everything should look measurable.

Use:

- Consistent spacing
- 1px borders
- Monospace data
- Grid alignment
- Mathematical rhythm

Avoid decorative randomness.

---

## Motion Creates Emotion

Emotion should come from interaction.

Not from colors.

Not from gradients.

Animations should explain:

- Navigation
- State changes
- Feedback

Never animate simply for decoration.

---

## Consistency over Creativity

When uncertain:

Reuse existing components.

Do not invent new styles.

Every new page should feel like it has always belonged to the application.

---

# 4. Design DNA and Decision Weights

DDS uses a weighted influence model to keep design decisions consistent.

The percentages express decision priority when design references conflict. They do not mean that a page must allocate the same percentage of pixels, components, or visual details to each source.

| Source | Weight | Responsibility |
| --- | ---: | --- |
| Linear | 45% | Information architecture, grid, cards, hierarchy, borders, information density |
| Apple HIG | 30% | Consumer usability, touch behavior, motion, feedback, accessibility |
| Stripe | 15% | Trust, brand emphasis, CTA, onboarding, service experience |
| GitHub | 5% | Project status, timeline, structured data, monospace data display |
| Arc | 5% | Floating navigation, overlays, spatial relationships |

The user should perceive one unified design language instead of multiple mixed styles.

## Conflict Resolution

Platform requirements, usability, and accessibility take precedence over all design weights.

When references suggest different solutions:

1. Use Linear for page structure, information hierarchy, cards, and density.
2. Use Apple HIG for touch behavior, feedback, motion, readability, and comprehension cost.
3. Use Stripe for CTA, login, service, trust, and brand emphasis.
4. Use GitHub for timelines, status history, and structured project data.
5. Use Arc for floating navigation and overlay spatial relationships.

Customer comprehension always takes precedence over technical aesthetics.

## Supporting References

Vercel and Raycast are supporting references and do not receive independent design weights:

- Vercel may inform restraint, whitespace, monochrome surfaces, and precision.
- Raycast may inform immediate micro-feedback only.
- Neither may override the five weighted sources.
- Do not introduce terminal language, command palettes, blinking cursors, keyboard-first interaction, or developer-tool density into customer-facing flows.

## Existing UI Compatibility

These weights apply to new UI and UI being actively modified. They do not require a bulk redesign of existing pages.

The current application remains the compatibility baseline. Any intentional redesign must be requested and reviewed separately.

---

# 5. Information Architecture

DDS is task-oriented instead of page-oriented.

Each screen should contain five information levels.

## Level 1 - Current Context

The user's current working context.

Examples:

- Current Project
- Current User
- Current Workspace

---

## Level 2 - Primary Content

The most important information required to complete the current task.

Examples:

- Project Card
- Timeline
- Project Details
- Statistics

---

## Level 3 - Supporting Information

Additional information that helps understanding.

Examples:

- Metadata
- Progress
- Tags
- Members
- Notes

---

## Level 4 - Actions

Interactive elements.

Examples:

- Buttons
- Filters
- Sorting
- Navigation
- Quick Actions

---

## Level 5 - System Information

Low-priority information.

Examples:

- Settings
- Privacy
- About
- Version
- Logout

---

# 6. Visual Identity

## Color Philosophy

The interface is primarily monochrome.

Color communicates status.

Never decoration.

Status colors should never dominate the page.

---

## Base Color Anchors

These values define the visual language. Implementation tokens live in `miniprogram/styles/theme.less`.

| Role | Color |
| --- | --- |
| Background | `#FFFFFF` |
| Surface / Hover | `#FAFAFA` |
| Border | `#EAEAEA` or `rgba(0, 0, 0, 0.06)` |
| Primary Text | `#171717` |
| Secondary Text | `#666666` |
| Meta Text | `#A1A1AA` |

Borders should be hairline-level and visible only enough to define structure.

---

## Functional Colors

Functional colors are reserved for meaning.

| Color | Suggested Value | Meaning |
| --- | --- | --- |
| Purple | `#5E6AD2` | Processing, active, quoted |
| Blue | `#0070F3` | Information, signed, highlight |
| Green | `#10B981` | Success, completed |
| Red | `#E5484D` | Error, timeout, destructive actions |

Brand color exists only for emphasis.

Allowed:

- CTA buttons
- Charts
- Active progress
- Focus states

Never use gradients as page backgrounds.

---

# 7. Typography

Typography communicates hierarchy.

Not decoration.

## Font Families

Use system sans-serif for UI.

Use `Courier New, monospace` for data.

Monospace is mandatory for:

- IDs
- Dates
- Prices
- Percentages
- Statistics
- Counters

Reason:

Monospace data communicates precision and engineering quality. It also improves scanning when values are aligned in cards, lists, timelines, and metadata grids.

---

## Font Scale

| Role | Size |
| --- | --- |
| Display | `48rpx` - `60rpx` |
| Heading | `36rpx` - `42rpx` |
| Section | `30rpx` - `32rpx` |
| Body | `24rpx` - `28rpx` |
| Meta | `20rpx` - `22rpx` |

Prefer smaller, denser text with enough whitespace over oversized display text.

---

## Font Weight

Use only:

- `400`
- `500`
- `700`

Avoid additional weights.

---

# 8. Layout System

DDS emphasizes rhythm over symmetry.

Spacing should create scanning flow instead of making every margin identical.

Use:

Large

↓

Medium

↓

Small

↓

Medium

↓

Large

to create reading rhythm.

---

## Grid

Use an `8rpx` spacing system.

All spacing should be multiples of:

- `8rpx`
- `16rpx`
- `24rpx`
- `32rpx`
- `48rpx`

---

## Borders and Shadows

Borders define structure.

Shadows define interaction.

Floating cards should combine a neutral hairline edge with a low-opacity shadow so the surface remains clear without a dark outline.

Active cards may increase shadow depth slightly, but should not use black borders to communicate selection.

---

# 9. Component Principles

Components should remain calm.

Hierarchy should come from information.

Not decoration.

---

## Cards

Cards are the primary content container.

Standard structure:

Header

↓

Content

↓

Metadata

↓

Progress

↓

Action

Cards should never contain excessive decoration.

For project or item cards, the preferred semantic structure is:

- Header: status indicator with dot and pill badge
- Body: strong title and aligned metadata
- Footer: subtle progress or action area

When one item is more important than a list, a card may become a hero-style content block.

When multiple items compete for scanning, cards should use stable dimensions and dense metadata.

---

## Status

Status indicators always consist of:

Colored Dot

+

Gray Pill

Never use standalone colored text.

---

## Progress

Progress bars should remain subtle.

Preferred height:

`6rpx`

Progress should be rounded and located near the bottom of the card.

---

## Icons

Prefer pure CSS geometric shapes for primary navigation icons when the design can remain clear.

Reason:

- Sharp rendering
- Stable loading
- No asset drift
- Better consistency across small program devices

Examples:

- Dashboard: 2x2 grid of squares
- User: concentric circles or ring plus dot

Icon states should move from outline or light state to filled or darker active state.

---

## Navigation

Bottom navigation should float above the page.

Preferred feel:

- Semi-transparent white surface
- Subtle blur
- Hairline border
- Safe Area aware

The navigation should feel present but not heavy.

---

## Empty State

Empty pages should feel clear and reassuring.

Use a quiet content card with:

- A simple geometric visual
- A direct title describing what is absent
- A short explanation of what happens next
- An explicit refresh or recovery action when one is available

Avoid console language such as `Idle`, blinking cursors, decorative pulse effects, or cartoon illustrations in customer-facing flows.

---

# 10. Motion Language

Motion exists to explain changes.

Not entertain.

Allowed:

- Fade
- Scale
- Translate
- Blur
- Opacity

Forbidden:

- Bounce
- Rotation
- Flash
- Elastic
- Confetti

---

## Timing

| Use | Duration |
| --- | --- |
| Normal state change | `200ms` |
| Navigation | `250ms` |
| Loading | `300ms` |

Always use ease-out style timing.

---

## Press Feedback

Preferred feedback:

- Scale to `0.98`
- Slightly darken the background

Never overshoot.

---

# 11. Page Specifications

## Home

Purpose:

Help users understand current work within three seconds.

Structure:

Current Context

↓

Current Project

↓

Recent Activity

↓

Statistics

↓

Quick Actions

Avoid:

- Marketing banners
- Large illustrations
- Competing primary actions

---

## Project

Purpose:

Focus entirely on project progress.

Structure:

Project Summary

↓

Timeline

↓

Project Data

↓

Operations

Timeline should resemble GitHub Issues rather than chat messages.

---

## Profile

Purpose:

- Identity
- Settings
- Workspace

Structure:

Identity

↓

Usage Statistics

↓

General Settings

↓

Support

↓

About

↓

Danger Zone

Identity area may use softer spacing and subtle blur.

The remaining content should return to the standard DDS style.

---

# 12. WeChat Mini Program Rules

DDS is designed specifically for WeChat Mini Programs.

Always respect:

- Safe Area
- Dynamic Island
- Gesture Area
- Touch Targets
- Skyline behavior
- Real-device font rendering

---

## Platform Buffer

Fixed-height containers require extra vertical buffer to compensate for device font rendering.

Use `+20rpx` as the default safety margin when a fixed-height container contains text.

---

## Bottom Area

Always reserve `env(safe-area-inset-bottom)`.

Avoid relying only on `padding-bottom` for final card separation.

Use physical spacing that keeps content clear of floating navigation.

---

## Skeleton Screen

Skeleton height must dynamically fill the remaining viewport.

White gaps are not allowed.

---

## Performance

Prefer:

- CSS
- Less
- Native components

Avoid:

- Heavy blur stacking
- Large shadows
- Complex animations

---

# 13. AI Generation Rules

When generating UI:

- Maintain existing visual language.
- Reuse existing components.
- Reuse typography.
- Reuse spacing.
- Reuse motion.
- Never redesign existing pages unless requested.
- Never introduce a new component style without updating DDS.
- Never create decorative UI.
- Never use gradients as decoration.
- Never make components visually compete with each other.

Always prioritize:

Context

↓

Content

↓

Action

↓

System

When uncertain:

Prefer consistency over creativity.

The user should never notice that different pages were generated by AI.

---

# 14. Design Checklist

Before completing any UI implementation, verify:

- Information hierarchy is clear.
- One primary task exists per page.
- Floating cards use a neutral hairline edge and restrained shadow without black outlines.
- Monospace is used for numerical and structured data.
- Status follows DDS dot plus pill specification.
- Motion follows DDS timing and purpose.
- Safe Area is respected.
- Spacing follows the `8rpx` rhythm.
- Empty states use direct, reassuring language with a clear next action.
- No unnecessary decoration was added.
- New page feels consistent with existing pages.
