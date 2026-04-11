# Design System Strategy: High-End Personal Finance

## 1. Overview & Creative North Star
**The Creative North Star: "The Financial Atelier"**

In a world of generic Fintech templates, this design system moves away from "functional utility" toward "editorial prestige." We treat wealth management not as a chore, but as a curated experience. This system leverages **Organic Minimalism**—a philosophy where the interface feels like a custom-tailored suit. 

To break the "template" look, we utilize **Intentional Asymmetry**. Instead of perfectly centered grids, we use generous, sweeping white space (negative space) and overlapping elements to create a sense of movement and sophistication. The interface doesn't just show data; it presents a narrative of security and growth through high-contrast typography scales and deep, tonal layering.

---

## 2. Colors & Tonal Logic
Our palette is rooted in deep obsidians and nocturnal blues, providing a stable foundation for high-contrast financial data.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section off content. Traditional borders create visual noise and "trap" data. Instead, define boundaries through:
*   **Background Shifts:** Placing a `surface-container-low` component against a `surface` background.
*   **Tonal Transitions:** Using subtle shifts in saturation to guide the eye.

### Surface Hierarchy & Nesting
Think of the UI as physical layers of smoked glass and matte paper.
*   **The Foundation:** `surface` (#0e131d) is the base.
*   **The Lift:** Use `surface-container` tiers (Lowest to Highest) to "nest" importance. An inner card (`surface-container-highest`) should sit inside a section (`surface-container-low`) to create natural depth without structural lines.

### The "Glass & Gradient" Rule
To elevate the "Modern" aesthetic, floating elements (modals, tooltips, navigation bars) must use **Glassmorphism**. Combine `surface-variant` with a `backdrop-filter: blur(20px)` and 60% opacity. 

### Signature Textures
Main CTAs and Hero Charts should utilize a subtle linear gradient from `primary` (#b1c6ff) to `primary-container` (#578cff). This adds a "soul" to the blue accent that a flat hex code cannot achieve, conveying a premium, liquid-metal feel.

---

## 3. Typography: The Editorial Voice
We use a dual-font approach to balance authority with readability.

*   **Display & Headlines (Manrope):** This is our "Editorial" voice. Manrope provides a geometric, modern authority. Use `display-lg` (3.5rem) for balance totals to make wealth feel substantial.
*   **Body & Labels (Inter):** The "Workhorse." Inter is used for all transactional data and descriptions. Its high x-height ensures legibility at small sizes (`body-sm`) against dark backgrounds.
*   **Hierarchy Note:** Headlines must remain pure white (#FFFFFF) to pop against the dark surfaces, while body text uses `on-surface-variant` (#c2c6d7) to reduce eye strain and establish a clear information hierarchy.

---

## 4. Elevation & Depth
In this design system, shadows are a last resort, not a default.

*   **The Layering Principle:** Depth is achieved by stacking. A `surface-container-lowest` card placed on a `surface-container-low` section creates a "recessed" look, perfect for input areas or secondary data.
*   **Ambient Shadows:** For high-floating elements (Modals/Action Sheets), use extra-diffused shadows: `box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4)`. The shadow should feel like ambient light blockage, not a harsh drop shadow.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, it must be a **Ghost Border**. Use the `outline-variant` token at 15% opacity. Never use 100% opaque borders.
*   **Glassmorphism Depth:** When using glass effects, apply a 0.5px "inner glow" using a semi-transparent `primary` color to simulate the edge of a glass pane.

---

## 5. Components

### Buttons
*   **Primary:** Uses the signature gradient (`primary` to `primary-container`). Shape: `xl` (3rem). Text: `title-sm` (Inter, Bold).
*   **Secondary:** Ghost style. No fill, `outline` token at 20% opacity. 
*   **States:** On hover, the primary button should "glow" using a soft `primary` drop shadow.

### Input Fields
*   **Surface:** Use `surface-container-highest` (#30353f) to provide a clear interactive target.
*   **Shape:** `md` (1.5rem) to differentiate from the more rounded buttons.
*   **Interaction:** On focus, the field should not gain a heavy border, but rather a soft `primary` outer glow.

### Cards & Lists
*   **The Divider Ban:** Strictly forbid 1px horizontal lines between list items. Use **Vertical White Space** (16px–24px) or a 2% shift in background color to separate transactions.
*   **Financial Cards:** Credit/Debit card representations should use the `lg` (2rem) corner radius and a subtle `primary_fixed_dim` mesh gradient to feel "physical."

### Special Component: The "Wealth Horizon"
A custom chart component for this app. It should use a `primary` stroke with a `primary-container` semi-transparent fill that fades into the `background` color at the bottom, creating a sense of infinite growth.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical margins. If the left margin is 24px, try a right margin of 32px for editorial layouts.
*   **Do** use `display-lg` for single, impactful numbers (e.g., Net Worth).
*   **Do** lean into "Breathing Room." If you think there's enough padding, double it.

### Don't
*   **Don't** use pure black (#000000). Always use the `background` token (#0e131d) to maintain depth.
*   **Don't** use standard Material Design "elevated" shadows. They look "off-the-shelf."
*   **Don't** use high-contrast dividers. They clutter the UI and make the app feel like a spreadsheet.
*   **Don't** use more than one Primary CTA per screen. If everything is important, nothing is.