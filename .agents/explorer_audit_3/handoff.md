# Handoff Report: UI/UX, Senior Developer, and Mobile Audit

## 1. Observation

This audit examines the main brand website (`index.html`, `main.js`, `style.css`) and the `Mobile-App-PoC` directory. Below are the specific technical findings:

### 1.1 UI/UX & Preloader Timing Discrepancy
- **CSS Progress Bar Duration**: `style.css` lines 1142-1147:
  ```css
  .loader-progress {
    width: 0%;
    height: 100%;
    background: var(--accent-gradient);
    animation: progress 2.5s ease-out forwards;
  }
  @keyframes progress {
    0% { width: 0%; }
    100% { width: 100%; }
  }
  ```
- **JS Load Event Timeout**: `main.js` lines 468-481:
  ```javascript
  window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if(preloader) {
      const minDelay = prefersReducedMotion ? 0 : 700;
      setTimeout(() => {
        preloader.style.opacity = '0';
        setTimeout(() => {
          preloader.style.display = 'none';
        }, prefersReducedMotion ? 0 : 400);
      }, minDelay);
    }
  });
  ```
- **Animation vs Transition Collision**: In `style.css` line 1099, the preloader has:
  `transition: opacity 0.8s ease-in-out, visibility 0.8s;`
  However, in `main.js` line 478, the inner `setTimeout` sets `display: none` after only `400ms` (which is half the `800ms` transition time).

### 1.2 Custom Cursor CSS Selector Error & Center Shift
- **Broken CSS Selector**: `style.css` lines 1079-1080:
  ```css
  a:hover ~ .cursor-outline, button:hover ~ .cursor-outline {
    width: 60px;
  }
  ```
  In `index.html` lines 104-106, the cursor elements are placed at the top of `<body>`:
  ```html
  <div class="cursor-dot"></div>
  <div class="cursor-outline"></div>
  ```
- **Cursor Shift Bug**: In `style.css` lines 1060-1070:
  ```css
  .cursor-outline {
    ...
    transform: translate(-50%, -50%);
    transition: transform 0.15s ease-out, ...;
  }
  ```
  But when `.cursor-hover` is active, it defines (line 1985):
  ```css
  .cursor-hover {
    transform: scale(1.5);
    background-color: rgba(30, 132, 73, 0.2);
    border-color: var(--accent-primary);
  }
  ```

### 1.3 Dark/Light Mode Gaps
- **Static Background Canvas Color**: In `main.js` lines 570-584, the Three.js particle color and line basic materials are hardcoded:
  ```javascript
  const material = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x1e8449,
    ...
  });
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x1e8449, ... });
  ```
- **No Light Mode in Mobile-App-PoC**: In `Mobile-App-PoC/src/index.css` lines 1-9, colors are hardcoded for dark mode (e.g. `--bg-color: #050505`) with no light mode media queries or theme toggle variables.
- **Glass Tag Contrast**: `style.css` lines 810-819 has `.project-tags span` using `background: rgba(255, 255, 255, 0.05)` which lacks sufficient contrast on the light-mode background `#fafafa`.

### 1.4 Mobile Gesture & Responsiveness (SwipeToDeploy)
- **Lack of Touch Event Cancellation**: In `Mobile-App-PoC/src/components/SwipeToDeploy.jsx` line 23, `handleDragMove` lacks `e.preventDefault()`, which risks letting the browser scroll vertically during a swipe gesture on some mobile platforms.
- **Missing touchcancel Listener**: In `SwipeToDeploy.jsx` lines 54-71, the `useEffect` adds `touchmove` and `touchend` but lacks a listener for `touchcancel`.
- **Render-time Layout Calculation**: In `SwipeToDeploy.jsx` lines 12-14:
  ```javascript
  const maxDrag = containerRef.current && thumbRef.current 
    ? containerRef.current.offsetWidth - thumbRef.current.offsetWidth - 10 
    : 200;
  ```
  This reads layout properties during the React render phase, which causes a reflow/layout thrashing warning, and will fail to update on window resizing/device rotation.

### 1.5 Interactive Components & AI Assistant Gaps
- **Lack of Keyboard Adaptation in PoC**: Unlike the main website (which uses the `visualViewport` API and CSS variable `--kb-offset` to lift the input field above the virtual keyboard), `Mobile-App-PoC/src/components/FloatingAssistant.css` has no logic to handle virtual keyboard overlays on mobile screens.
- **Auto-open persistence UX issue**: The main website's AI assistant auto-opens after 2500ms on every visit (via `setTimeout` in `main.js`), with no persistent state in `localStorage` or `sessionStorage` to honor user closure.
- **Text Overlap on Swipe**: In `SwipeToDeploy.jsx`, the text `Swipe to Deploy` remains visible at `opacity: 1` as the thumb moves across it, leading to visual overlap when the thumb slides over the center.

---

## 2. Logic Chain

1. **Preloader Animation Mismatch**: Because the progress bar CSS animation is set to run for `2.5s` but `main.js` hides the preloader `700ms` after the document triggers the `load` event, the progress bar will visually "jump" or disappear before completing on fast networks. On slow networks, the bar will stay filled at 100% for seconds before the load event triggers. Additionally, because the `display: none` timeout is set to `400ms` in JS but the CSS transition has a duration of `0.8s` (800ms) for opacity/visibility, the preloader's fade-out animation is cut off in the middle, causing a jarring pop out of existence.
2. **Broken Hover Cursor**: The general sibling selector `~` in CSS requires elements to share the same parent and for the target element to come *after* the hovered element in the DOM. Because `.cursor-outline` is placed at the top of the body before the interactive nodes (and is nested in different containers), the CSS selectors `a:hover ~ .cursor-outline` are entirely non-functional.
3. **Cursor Shift Bug**: Because the `.cursor-hover` class defines `transform: scale(1.5)` but omits the base positioning transform `translate(-50%, -50%)`, applying the hover class overrides the base class transform. This shifts the cursor outline's alignment from its center point (offsetting it by 50% of its width/height) when hovering over links.
4. **Three.js Theme Inconsistency**: Because the Three.js canvas material colors are initialized as a static hex value (`0x1e8449`) and the theme toggle listener in `main.js` only alters the root `data-theme` attribute, the 3D particles fail to adapt to light mode, leading to poor visual contrast of connecting lines on a `#fafafa` background.
5. **SwipeToDeploy Orientation Bug**: Because `maxDrag` is evaluated during render and React does not trigger re-renders on element size changes, rotating the mobile device changes the container's width but keeps the drag range bound to its initial width. In portrait, it works, but switching to landscape leaves the thumb unable to drag past the halfway point of the wider container. Additionally, the lack of `touchcancel` tracking leaves the thumb in a permanent "drag" state if a system gesture interrupts the swipe.

---

## 3. Caveats

- We did not test performance on low-end mobile devices, so the actual framerate impact of the Three.js layout calculations and custom cursor animations has not been quantified.
- The build behavior of the `Mobile-App-PoC` project has been validated: the production build completes successfully via `vite build`, but running `npm run lint` fails because there is no ESLint configuration file (such as `.eslintrc` or `eslint.config.js`) present in the project directory, despite having ESLint dependencies.


---

## 4. Conclusion

The codebase is visually polished and includes advanced considerations (such as `visualViewport` keyboard awareness on the main website and PWA configs). However, there are significant interactive and mobile compatibility issues:
1. **Critical Mobile bugs**: The React `SwipeToDeploy` component fails on device orientation change due to static layout caching, and lacks a `touchcancel` handler. The PoC's AI Assistant lacks keyboard-aware offsets, causing the input field to be covered by the virtual keyboard on mobile screens.
2. **Animation and UX glitches**: The preloader transition is cut off prematurely by JS timeouts, the progress bar does not reflect actual loading milestones, and the custom cursor shifts off-center on hover.
3. **Theme inconsistencies**: The Three.js canvas particles are hardcoded and do not adapt to light mode, and the Mobile PoC lacks light mode styling entirely.

---

## 5. Verification Method

- **Visual / Functional Testing**:
  1. Toggle to Light Mode on a desktop screen and inspect the Three.js canvas. Note that the forest green particles and thin connection lines remain hardcoded and lose legibility.
  2. Inspect the custom cursor when hovering over links; observe that it shifts off-center due to the override of the `translate(-50%, -50%)` transform by `.cursor-hover`.
  3. Load the page and observe the preloader progress bar on a fast local network; it fades out while the bar is only ~30% filled, and snaps away due to the 400ms JS timeout cutting off the 800ms CSS transition.
- **Mobile PoC Build & Lint**:
  - Run the following command in `Mobile-App-PoC` to verify clean compilation:
    `npm run build`
  - Run the following command to check for ESLint warnings:
    `npm run lint`
