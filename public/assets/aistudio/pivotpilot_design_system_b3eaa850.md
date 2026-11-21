---
name: "PivotPilot — Ash & Blush"
description: "Clean, modern light-theme design system in cool ash grey and soft baby pink for PivotPilot, an AI career pivot coach."
---

## Overview

PivotPilot is an AI career pivot coach designed to bring calm clarity to high-stakes career transitions. The interface pairs cool, architectural ash-grey surfaces with a single, intentional baby-pink and deep-rose accent family so progress rings, skill-gap heatmaps, and coaching feedback feel encouraging rather than overwhelming.

The visual language is **Minimalist Modern**: generous breathing room, crisp white cards resting on soft ash-grey canvases, rounded corners, and restrained typographic hierarchy. Every screen prioritizes scannability, clear next actions, and responsive adaptation from desktop sidebars down to mobile viewports.

## Colors

The palette pairs cool ash-grey neutrals (`surface`, `surface-container-*`, `ash-*`) with a single rose-pink accent family (`primary` for high-contrast interactive actions and text, `pink-soft` and `pink-tint` for baby-pink badges, highlights, and active navigation states). Semantic status colors (`error`) are reserved strictly for error states; progress and readiness indicators stay within the ash-and-pink monochrome-plus-one-accent system.

```yaml
colors:
  pink-tint: "#FFECF0"
  pink-soft: "#FFD9E3"
  pink-mid: "#FFB0CA"
  ash-50: "#F0F0F5"
  ash-100: "#E1E2E7"
  ash-200: "#C5C6CB"
  ash-400: "#8F9195"
  ash-500: "#75777B"
  ash-600: "#5C5E62"
  ash-900: "#191C1F"
  light:
    primary: "#80264D"
    on-primary: "#FFFFFF"
    primary-container: "#FFD9E3"
    on-primary-container: "#610A35"
    secondary: "#805160"
    on-secondary: "#FFFFFF"
    secondary-container: "#FEC1D4"
    on-secondary-container: "#4B2432"
    error: "#BA1A1A"
    on-error: "#FFFFFF"
    error-container: "#FFDAD6"
    on-error-container: "#93000A"
    background: "#F3F3F8"
    on-background: "#191C1F"
    surface: "#F3F3F8"
    surface-dim: "#E1E2E7"
    surface-bright: "#FFFFFF"
    surface-container-lowest: "#FFFFFF"
    surface-container-low: "#F8F8FB"
    surface-container: "#EDEEF2"
    surface-container-high: "#E7E8EC"
    surface-container-highest: "#E1E2E7"
    on-surface: "#191C1F"
    surface-variant: "#E7E8EC"
    on-surface-variant: "#5C5E62"
    outline: "#8F9195"
    outline-variant: "#E1E2E7"
    inverse-surface: "#2E3134"
    inverse-on-surface: "#F0F0F5"
    inverse-primary: "#FFB0CA"
    shadow: "#191C1F"
    scrim: "#000000"
  dark:
    primary: "#FFB0CA"
    on-primary: "#610A35"
    primary-container: "#9E3E65"
    on-primary-container: "#FFCEDC"
    secondary: "#F2B6C8"
    on-secondary: "#4B2432"
    secondary-container: "#683C4B"
    on-secondary-container: "#E3A8BA"
    error: "#FFB4AB"
    on-error: "#690005"
    error-container: "#93000A"
    on-error-container: "#FFDAD6"
    background: "#111417"
    on-background: "#E1E2E7"
    surface: "#111417"
    surface-dim: "#111417"
    surface-bright: "#37393D"
    surface-container-lowest: "#0C0E11"
    surface-container-low: "#191C1F"
    surface-container: "#1D2023"
    surface-container-high: "#282A2E"
    surface-container-highest: "#323538"
    on-surface: "#E1E2E7"
    surface-variant: "#2E3134"
    on-surface-variant: "#AAABAF"
    outline: "#8F9195"
    outline-variant: "#44474B"
    inverse-surface: "#E1E2E7"
    inverse-on-surface: "#2E3134"
    inverse-primary: "#9C3C63"
    shadow: "#000000"
    scrim: "#000000"
```

## Typography

PivotPilot pairs **Wix Madefor Display** for geometric, approachable headings with **Instrument Sans** for crisp, high-legibility UI and body copy, and **Source Code Pro** for tabular metrics, readiness percentages, and rubric scores.

```yaml
typography:
  display-lg:
    fontFamily: "Wix Madefor Display"
    fontSize: 40px
    fontWeight: 700
    lineHeight: 48px
    letterSpacing: -0.5px
  display-lg-mobile:
    fontFamily: "Wix Madefor Display"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 34px
    letterSpacing: -0.3px
  headline-lg:
    fontFamily: "Wix Madefor Display"
    fontSize: 28px
    fontWeight: 600
    lineHeight: 36px
    letterSpacing: -0.3px
  headline-md:
    fontFamily: "Wix Madefor Display"
    fontSize: 22px
    fontWeight: 600
    lineHeight: 28px
    letterSpacing: -0.2px
  title-lg:
    fontFamily: "Instrument Sans"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 26px
    letterSpacing: -0.1px
  title-md:
    fontFamily: "Instrument Sans"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 24px
    letterSpacing: 0px
  body-lg:
    fontFamily: "Instrument Sans"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0px
  body-md:
    fontFamily: "Instrument Sans"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0px
  body-sm:
    fontFamily: "Instrument Sans"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 18px
    letterSpacing: 0px
  label-lg:
    fontFamily: "Instrument Sans"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
    letterSpacing: 0px
  label-md:
    fontFamily: "Instrument Sans"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: 0.1px
  label-sm:
    fontFamily: "Instrument Sans"
    fontSize: 11px
    fontWeight: 500
    lineHeight: 14px
    letterSpacing: 0.2px
  mono-md:
    fontFamily: "Source Code Pro"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
    letterSpacing: 0px
  mono-sm:
    fontFamily: "Source Code Pro"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: 0px
```

## Layout & Spacing

The app uses a persistent `256px` left sidebar on desktop (`lg:` and above) paired with a fluid main content area (`max-w-6xl`) over the `#F3F3F8` ash-grey canvas. On mobile viewports (`< 1024px`), the sidebar collapses behind a clean top header toggle and multi-column grids stack cleanly into single-column cards. Spacing follows a strict `4px` / `8px` grid.

```yaml
spacing:
  gutter-xs: 4px
  gutter-sm: 8px
  gutter-md: 16px
  gutter-lg: 24px
  gutter-xl: 32px
  section: 40px
  page-margin: 24px
```

## Elevation & Depth

Depth is conveyed through **tonal layering** and **hairline ash-grey borders** rather than heavy drop shadows. White cards (`surface-container-lowest`) sit cleanly on the `#F3F3F8` ash-grey canvas (`surface`), bordered by `1px` `outline-variant` (`#E1E2E7`). Interactive cards use subtle hover border transitions and soft ambient elevation (`shadow-sm` tinted with `shadow` at low opacity) only when elevated.

## Shapes

Rounded cards and soft pill controls define PivotPilot's approachable personality. Primary cards use `rounded-lg` (`20px`) or `rounded-md` (`16px`), nested inner containers step down to `rounded` (`12px`), and chips, pills, and primary CTA buttons use `rounded-full` or `rounded` (`12px`).

```yaml
rounded:
  sm: 8px
  DEFAULT: 12px
  md: 16px
  lg: 20px
  xl: 24px
  full: 9999px
```

## Motion & Micro-interaction

Motion is calm, responsive, and understated. Button hovers, tab switches, and card border highlights land within `120ms`, while drawer or modal transitions decelerate over `240ms`. Only `transform`, `opacity`, and color properties are animated.

```yaml
motion:
  state-change:
    duration: 120ms
    delay: 0ms
    timingFunction: ease-out
  surface-enter:
    duration: 240ms
    delay: 0ms
    timingFunction: cubic-bezier(0.2, 0, 0, 1)
  surface-exit:
    duration: 160ms
    delay: 0ms
    timingFunction: cubic-bezier(0.3, 0, 1, 1)
```

## Voice & Content Strategy

- **Tone of voice:** Encouraging, pragmatic, and specific. Speak like a sharp career strategist—clear and grounded, never robotic or overly hyped.
- **Capitalisation:** Sentence case across all headings, navigation items, buttons, and table headers.
- **Terminology:** Use "Target Role", "Readiness Score", "Skill-Gap Map", "Roadmap", "Portfolio Projects", "Mock Interview", and "Applications" consistently across every screen.
- **Action labels:** Verb-first, outcome-oriented labels (`Generate Roadmap`, `Start Mock Session`, `Log Application`, `Upload Resume`), never generic `Submit` or `OK`.
- **Numbers & dates:** Tabular numerals (`tabular-nums`) for all percentages, scores, hours/week, and dates (`Nov 24, 2026`).

## Components

Component implementations live as individual HTML sticker sheet files in
`components/`. Each file contains the canonical, styled HTML components with
`<!-- COMPONENT: name -->` comment markers. Read each file before use.

- **Badge** → `@components/badge.html`: `badge-numeric`, `badge-dot`
- **Button** → `@components/button.html`: `button-primary`, `button-icon`, `button-with-icon`
- **Card** → `@components/card.html`: `card-elevated`, `card-action`, `card-interactive`, `card-interactive-2`
- **Input Field** → `@components/input-field.html`: `input-field-text`, `input-field-icon`
- **Table** → `@components/table.html`: `table-standard`, `table-interactive`, `table-selectable`
