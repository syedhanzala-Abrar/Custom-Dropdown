# Interactive Stories Component

An interactive, responsive, and mobile-ready **Stories Feature** built with pure **HTML5**, **CSS3**, and **Vanilla JavaScript** (zero external dependencies).

This project implements the wireframe specification:
1. **When there are no stories**: Displays the container with only the `[+]` (add story) button.
2. **When there is one story**: Displays the container with the `[+]` button and 1 story avatar bubble.
3. **When there are multiple stories**: Displays the container with the `[+]` button and multiple story bubbles.
4. **Story Viewer Modal**:
   - Each story has a separate, segmented progress bar at the top.
   - The active story's progress bar fills up smoothly over **3 seconds** (`3000ms`).
   - Automatically advances to the next story after 3 seconds.
   - Users can switch stories by **swiping** left / right on touch screens or dragging on desktop.
   - Tap left zone (35%) to go to the previous story; tap right zone (65%) to go to the next story.
   - Press and hold (mouse down / touch start) to pause the 3-second timer and progress bar.
   - Keyboard support: <kbd>→</kbd> / <kbd>←</kbd> (next/previous), <kbd>Space</kbd> (pause/resume), <kbd>Escape</kbd> (close).

---

## 🚀 How to Run

Run the local dev server:

```bash
npm run dev
```

This will automatically launch the server at `http://localhost:3000` and open your browser.

Alternatively, open [`index.html`](file:///c:/Users/syedh/OneDrive/Documents/Custom%20Dropdown/index.html) directly in any modern web browser.
