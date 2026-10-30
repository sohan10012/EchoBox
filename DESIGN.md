---
title: EchoBox Design System
version: 1.0.0
description: Anonymous-first conversation design tokens and components
---

```yaml
colors:
  primary: "#22c55e"
  surface:
    canvas: "#090909"
    panel: "#121212"
    elevated: "#18181b"
    hover: "rgba(255, 255, 255, 0.05)"
  border:
    subtle: "rgba(255, 255, 255, 0.08)"
    strong: "rgba(255, 255, 255, 0.16)"
  text:
    primary: "#ffffff"
    secondary: "#a1a1aa"
    muted: "#71717a"
  brand:
    primary: "#22c55e"
    hover: "#16a34a"
    glow: "rgba(34, 197, 94, 0.2)"
    surface: "rgba(34, 197, 94, 0.08)"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  full: "9999px"
typography:
  sans:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: "16px"
    lineHeight: "1.5"
  mono:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "14px"
    lineHeight: "1.4"
```

# Design System: EchoBox

EchoBox is an anonymous-first conversation platform. The visual aesthetic is dark-first, clean, restrained, and focused on typography and spatial hierarchy with vibrant emerald accents.

## 1. Color Tokens

### 1.1 Neutral Surfaces
- `color.surface.canvas`: `#090909` (Primary background, deep near-black)
- `color.surface.panel`: `#121212` (Card and panel backgrounds)
- `color.surface.elevated`: `#18181b` (Modals, popovers, elevated dialogs)
- `color.surface.hover`: `rgba(255, 255, 255, 0.05)` (Subtle interactive hover)
- `color.border.subtle`: `rgba(255, 255, 255, 0.08)` (Default structural card borders)
- `color.border.strong`: `rgba(255, 255, 255, 0.16)` (Interactive or focused card borders)

### 1.2 Typography Hierarchy
- `color.text.primary`: `#ffffff` (Headlines and primary content, ratio > 12:1)
- `color.text.secondary`: `#a1a1aa` (Supporting captions, metadata, ratio > 7:1)
- `color.text.muted`: `#71717a` (Timestamps, subtle hints, ratio > 4.5:1)

### 1.3 Brand Accent (Emerald)
- `color.brand.primary`: `#22c55e` (Primary action accent, brand badge)
- `color.brand.hover`: `#16a34a` (Primary button hover state)
- `color.brand.glow`: `rgba(34, 197, 94, 0.2)` (Focus ring & active indicator ambient glow)
- `color.brand.surface`: `rgba(34, 197, 94, 0.08)` (Discussion banners & highlights)

## 2. Accessibility & Layout
- Mobile viewport: `min-h-[100dvh]` avoiding 100vh layout shifts.
- Horizontal stability: `overflow-x: clip`.
- Target size: minimum 44×44px for touch targets.
- Focus: `outline: 2px solid #22c55e; outline-offset: 2px` (0ms delay).
