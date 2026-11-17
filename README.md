# Keyboard Layout Switcher (Georgian / Armenian)

A single-page web application that converts Latin keystrokes into Georgian or Armenian characters in real time. Built with Vue 3 and Vite, installable as a Progressive Web App (PWA) on desktop and mobile.

## Features

- **Live transliteration** — type Latin letters, get Georgian or Armenian characters
- **Two layouts** — Georgian and Armenian, switchable via dropdown
- **Toggle on/off** — temporarily disable conversion to type plain Latin
- **Clipboard support** — copy the result to the clipboard with one click
- **Persistent settings** — selected layout and toggle state are saved in `localStorage`
- **Installable PWA** — works offline, launches in a standalone window


## Tech Stack

- **Vue 3** with `<script setup>` — single `App.vue` component, no UI libraries
- **Vite** — dev server and production build
- **vite-plugin-pwa** — service worker generation, manifest, offline caching (Workbox under the hood)
- **Plain HTML elements** — `<textarea>`, `<select>`, `<button>`

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Install

```bash
npm install
```

### Development
```bash
npm run dev
```
Opens at `http://localhost:5173`. PWA features (service worker) are typically disabled in dev mode.

### Production build
```bash
npm run build
```
Output goes to dist/. The service worker and manifest.webmanifest are generated automatically.

### Preview the production build locally
```bash
npm run preview
```
Use this to verify PWA installability and offline behaviour before deploying. Service workers require HTTPS or localhost.

## Deployment
The app can be served from the domain root or from a subpath.

### Root deployment (/)
Default configuration — just upload the contents of dist/ to your web server.

### Subpath deployment (e.g. /layouts/)
Set base in vite.config.js:

```js
export default defineConfig({
  base: '/layouts/',
  // ...
});
```

vite-plugin-pwa picks up base automatically for start_url and scope, so no extra manifest changes are needed. Rebuild and upload dist/ into the /layouts/ directory on your server.

### HTTPS requirement
Service workers and PWA installation only work over HTTPS (except on localhost). 
## Installation as an App
### Desktop (Chrome, Edge)
Open the site — an install icon appears in the address bar, or use the browser menu → "Install".

### Desktop (Opera)
Opera desktop does not support native PWA installation. Use a third-party widget, or rely on Opera's "Create shortcut" menu option.

### Mobile (Android — Chrome, Opera)
Open the site — the browser offers to install it, or use the menu → "Add to Home screen" / "Install app".

### Mobile (iOS — Safari)
Open the site — tap Share → "Add to Home Screen". Service worker and offline mode are supported, though some APIs may behave differently than on Android.

### Icons
The manifest references two icon files placed in public/:

icon-192.png (192×192)

icon-512.png (512×512)

Both should be marked purpose: "any maskable" so Android can crop them into any shape without clipping important parts.

## Cache Management
vite-plugin-pwa handles cache versioning automatically:

registerType: 'autoUpdate' — the service worker updates in the background when a new build is deployed

cleanupOutdatedCaches: true — old caches are deleted on activation

skipWaiting + clientsClaim — the new version takes control immediately, without waiting for all tabs to close

To force a clean state during development, open DevTools → Application → Service Workers → Unregister, then clear Cache Storage and Local Storage.

### Project Structure
```text
keyboard-app/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   ├── icon-192.png
│   └── icon-512.png
└── src/
    ├── main.js
    ├── App.vue
    └── style.css
```

## How It Works
The active layout is a plain object mapping Latin keys to target-language characters (e.g. 'a': 'ა' for Georgian, 'a': 'ա' for Armenian).

Two input hooks handle the conversion:

keydown — desktop keyboards

beforeinput — mobile virtual keyboards (where keydown may report "Unidentified" or not fire at all)

Both hooks skip Ctrl/Alt/Meta combinations and IME composition (event.isComposing), so standard shortcuts and input methods are unaffected.

The converted character is inserted at the current cursor position; the cursor position is restored via nextTick after Vue updates the DOM.

Selected layout and toggle state persist in localStorage under the keys keyboard.layoutName and keyboard.layoutEnabled.

## Customization
Adding a new language
Define a layout object in App.vue:

```js
const NEW_LAYOUT = {
  'a': 'α', 'b': 'β', // ...
};
```

Register it in LAYOUTS:

```js
const LAYOUTS = { georgian: GEORGIAN_LAYOUT, armenian: ARMENIAN_LAYOUT, new: NEW_LAYOUT };
```

Add an `<option>` to the `<select>`:

```html
<option value="new">Новый язык</option>
```

### Changing the default layout
Set the initial value of layoutName:

```js
const layoutName = ref('armenian');
```
Note: if a value is already saved in localStorage, it takes precedence on load.

### Known Limitations
Desktop Opera does not support native PWA installation (see above).

iOS Safari has partial PWA support — some APIs (e.g. beforeinput edge cases) may behave differently.

localStorage may be unavailable in Safari private mode or when the user blocks storage. The app falls back to defaults; settings just won't persist.

Clipboard API requires HTTPS (or localhost). A fallback via document.execCommand('copy') is used when navigator.clipboard is not available.

### License
MIT

### Acknowledgments

Georgian and Armenian layout tables based on phonetic keyboard conventions

Icons generated with `Favicon.pub`

Code generated with `DeepSeek`
