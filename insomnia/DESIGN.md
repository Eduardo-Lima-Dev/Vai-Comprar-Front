---
name: Vai Comprar
colors:
  surface: '#16130e'
  surface-dim: '#16130e'
  surface-bright: '#3c3933'
  surface-container-lowest: '#100e09'
  surface-container-low: '#1e1b16'
  surface-container: '#221f1a'
  surface-container-high: '#2d2a24'
  surface-container-highest: '#38342e'
  on-surface: '#e9e1d9'
  on-surface-variant: '#d0c5b4'
  inverse-surface: '#e9e1d9'
  inverse-on-surface: '#33302a'
  outline: '#999080'
  outline-variant: '#4d4639'
  surface-tint: '#e4c279'
  primary: '#f3d186'
  on-primary: '#3f2e00'
  primary-container: '#d6b56d'
  on-primary-container: '#5d4606'
  inverse-primary: '#745b1c'
  secondary: '#c6c6cd'
  on-secondary: '#2e3036'
  secondary-container: '#47494f'
  on-secondary-container: '#b7b8bf'
  tertiary: '#c9d3ff'
  on-tertiary: '#222e58'
  tertiary-container: '#abb7ea'
  on-tertiary-container: '#3b4773'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdf9c'
  primary-fixed-dim: '#e4c279'
  on-primary-fixed: '#251a00'
  on-primary-fixed-variant: '#5a4304'
  secondary-fixed: '#e2e2e9'
  secondary-fixed-dim: '#c6c6cd'
  on-secondary-fixed: '#1a1b21'
  on-secondary-fixed-variant: '#45474c'
  tertiary-fixed: '#dce1ff'
  tertiary-fixed-dim: '#b8c4f8'
  on-tertiary-fixed: '#0a1842'
  on-tertiary-fixed-variant: '#394570'
  background: '#16130e'
  on-background: '#e9e1d9'
  surface-variant: '#38342e'
typography:
  display-lg:
    fontFamily: Noto Serif
    fontSize: 40px
    fontWeight: '400'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Noto Serif
    fontSize: 28px
    fontWeight: '400'
    lineHeight: '1.3'
  title-sm:
    fontFamily: Noto Serif
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  body-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 0.5rem
  sm: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  gutter: 1.25rem
  margin-edge: 1.5rem
---

## Brand & Style

The design system is anchored in an "Elite Concierge" aesthetic, transforming a utilitarian task—grocery shopping—into a curated, premium experience. It targets a discerning audience that values aesthetics and order, evoking an emotional response of calm, exclusivity, and sophistication.

The visual direction combines **Minimalism** with **Glassmorphism** and **Tactile** accents. It utilizes deep, immersive gradients to create a sense of infinite space, while golden accents and elegant serifs provide a high-fashion, editorial feel. The interface stays "quiet," using generous whitespace (negative space) to ensure that the user's list items remain the focal point of the experience.

## Colors

The palette is defined by depth and luminosity. The primary background is not a flat color but a linear gradient flowing from the deep obsidian of `#07080C` to a slightly softer `#121212`. 

**Deep Gold (#D6B56D)** is used sparingly for high-intent actions, active states, and iconography, functioning as a "jewelry" element against the dark canvas. **Dark Gray (#111318)** provides the container surface for cards and interactive modules, creating a subtle lift from the background. Text relies on pure **White** for headers to ensure maximum legibility and a **Light/Medium Gray** for secondary metadata to maintain a soft visual hierarchy.

## Typography

This design system employs a classic editorial pairing. **Noto Serif** (as a proxy for high-contrast serifs) is used for all primary headings to inject a sense of timeless elegance and authority. For body copy and functional UI labels, **Manrope** is used for its modern, clean, and highly legible geometric structure.

Headlines should utilize slightly tighter letter-spacing to feel more cohesive, while labels and small caps text should have increased letter-spacing to enhance the premium, airy feel of the brand.

## Layout & Spacing

The layout follows a **Fixed-Width Fluid** model designed for mobile-first luxury. It uses a 4-column grid for mobile with wide margins (`1.5rem`) to prevent the content from feeling cramped. 

The rhythm is intentionally "loose." Padding within cards and between list sections is generous, prioritizing breathing room over information density. Vertical rhythm should follow a 4px baseline, but section spacing should favor the `lg` and `xl` tokens to maintain the minimalist aesthetic.

## Elevation & Depth

Depth is achieved through **Tonal Layering** and **Glassmorphism** rather than traditional heavy shadows. 

1.  **Base:** The gradient background.
2.  **Surface:** Cards use `#111318` with a very subtle, 1px solid border in a low-opacity Gold or White (`rgba(214, 181, 109, 0.1)`) to define edges.
3.  **Floating Elements:** Modals and high-level prompts use a backdrop-blur effect (20px) with a semi-transparent dark fill to maintain a sense of the environment behind the interaction.
4.  **Shadows:** When used, shadows are "Ambient"—extremely diffused, large radius (30px+), with a dark tint, serving to lift the card slightly rather than create a harsh silhouette.

## Shapes

The shape language is "Softly Architectural." Standard UI elements like cards and input fields utilize a `0.5rem` radius to feel approachable. Larger containers or hero cards use `1rem` (rounded-lg) to emphasize their importance. Buttons should remain consistent with the `0.5rem` radius to maintain a sophisticated, tailored look—avoiding the playfulness of full pills while eschewing the severity of sharp corners.

## Components

*   **Buttons:** Primary buttons use a solid Gold (`#D6B56D`) background with dark text. Secondary buttons use a "ghost" style with a gold 1px outline and golden line icons.
*   **Cards:** Items are grouped in cards using the `#111318` surface color. Cards should feature generous internal padding (`1.5rem`).
*   **Lists:** List items are separated by subtle, low-contrast dividers or simply by whitespace. The "Checked" state should not just cross out text, but dim it to 40% opacity while the gold icon transitions to a filled state or a subtle checkmark.
*   **Icons:** Use 2pt weight golden line icons. Icons should be minimalist and avoid complex fills.
*   **Inputs:** Search bars and text entries use a subtle bottom-border only or a very dark inset field to maintain the minimalist profile.
*   **Chips:** Used for categories (e.g., "Dairy", "Produce"), these should be small-caps text with a subtle background tint or a thin gold border.
*   **Feedback:** Success states and "Add" actions utilize the Gold palette; avoid standard "system green" to maintain the bespoke color story.