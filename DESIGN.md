---
title: EchoBox Glassmorphism Design System
version: 1.1.0
description: Anonymous-first conversation platform design tokens, glassmorphism hierarchy, and responsive layout specifications
---

```yaml
colors:
  primary: "#00D99A"
  surface:
    canvas: "#050807"
    panel: "rgba(18, 22, 20, 0.75)"
    elevated: "rgba(15, 18, 17, 0.94)"
    input: "rgba(10, 14, 12, 0.75)"
    pill: "rgba(255, 255, 255, 0.05)"
    hover: "rgba(255, 255, 255, 0.08)"
  border:
    subtle: "rgba(255, 255, 255, 0.09)"
    strong: "rgba(255, 255, 255, 0.16)"
    accent: "rgba(0, 217, 154, 0.35)"
  text:
    primary: "#ffffff"
    secondary: "#a1a1aa"
    muted: "#71717a"
  brand:
    primary: "#00D99A"
    hover: "#00c58b"
    glow: "rgba(0, 217, 154, 0.25)"
    surface: "rgba(0, 217, 154, 0.08)"
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

EchoBox is an anonymous-first conversation platform. The visual aesthetic fuses dark-mode minimalism with a disciplined glassmorphism hierarchy, refined 3D atmospheric depth, and vibrant mint-emerald highlights (`#00D99A`).

---

## 1. Glassmorphism System Hierarchy

| Component Tier | Surface Background | Blur (`backdrop-filter`) | Border | Inset / Glow Highlight |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Actions** | Solid `#00D99A` | None | `1px solid rgba(255,255,255,0.4)` top | `shadow-[0_4px_20px_rgba(0,217,154,0.35)]` |
| **Secondary Pills** | `rgba(255, 255, 255, 0.05)` | `16px` | `1px solid rgba(255,255,255,0.1)` | `inset 0 1px 0 rgba(255,255,255,0.12)` |
| **Navigation Bar** | `rgba(9, 11, 10, 0.8)` | `18px` | `1px solid rgba(255,255,255,0.1)` bottom | `0 4px 24px rgba(0,0,0,0.5)` |
| **Cards & Panels** | `rgba(18, 22, 20, 0.8)` | `16px` | `1px solid rgba(255,255,255,0.09)` | `inset 0 1px 0 rgba(255,255,255,0.08)` |
| **Recessed Inputs** | `rgba(10, 14, 12, 0.75)` | `14px` | `1px solid rgba(255,255,255,0.1)` | `inset 0 2px 4px rgba(0,0,0,0.4)` |
| **Modals & Dialogs** | `rgba(15, 18, 17, 0.94)` | `24px` | `1px solid rgba(255,255,255,0.12)` | `0 25px 60px -15px rgba(0,0,0,0.8)` |

---

## 2. Desktop Three-Region Layout Composition

To prevent collision between decorative conversation cards and primary hero content:
1. **Region 1 (Left Column)**: Dedicated decorative container (`280px` to `340px`) holding floating cards `Curious Lynx` and `Silent Panda`.
2. **Region 2 (Center Column)**: Primary headline, subtitle, room input, and action triggers (`1fr`, max-width `672px`).
3. **Region 3 (Right Column)**: 3D glass bubble sculpture, `"Real people / Real opinions / No profiles"` floating badge, and `Cosmic Owl` card (`280px` to `340px`).

---

## 3. Organic Floating Motion System

* **Card 1 (`.animate-float-1`)**: Vertical sway `translateY(-9px) rotate(-4.2deg)` over a `6.5s` easing curve.
* **Card 2 (`.animate-float-2`)**: Vertical sway `translateY(8px) rotate(-0.5deg)` over an `8.0s` easing curve.
* **Card 3 (`.animate-float-3`)**: Vertical sway `translateY(-10px) rotate(2.8deg)` over a `7.2s` easing curve.
* **Sculpture (`.animate-float-sculpture`)**: Vertical float `translateY(-7px) scale(1.018)` over a `9.0s` easing curve.
* **Hover Interaction**: Hovering pauses the animation (`.hover-pause:hover`) and smoothly elevates the card (`scale(1.02)`, border glow `rgba(0,217,154,0.4)`).
* **Accessibility**: Fully disabled when `@media (prefers-reduced-motion: reduce)` is active.

---

## 4. Responsive Adaptation

* **Mobile (320px–440px)**: 
  * Room ID input gracefully switches to an unconstrained stacked layout so the full placeholder (`Enter 8-digit Room ID (e.g. b07f3a9c)`) is never truncated.
  * Join Room button spans full width with a `44px+` touch target.
  * Desktop side columns are hidden; mobile 3D centerpiece renders seamlessly between subtitle and input.
* **Tablet (768px–1024px)**: Single horizontal pill input, spacious hero margins, and clean popular discussion grid.
* **Desktop (1280px–1920px)**: Full three-region layout with independent floating cards and rich glassmorphism depth.
