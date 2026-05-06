# ToneCraft – AI Text Rewriter

A production-ready Chrome Extension that rewrites selected text into **Polite**, **Formal**, or **Elaborate** tone using AI — built with Vite, React, TypeScript, and Tailwind CSS.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Quick Start](#quick-start)
6. [Development Workflow](#development-workflow)
7. [Build System](#build-system)
8. [Architecture](#architecture)
9. [Configuration](#configuration)
10. [Security Model](#security-model)
11. [API Integration](#api-integration)
12. [Deployment](#deployment)

---

## Overview

ToneCraft lives in your browser toolbar. Select any text on any webpage — an email draft, a Slack message, a report — click a tone button, and get a professionally rewritten version in under a second.

It uses the [OpenRouter](https://openrouter.ai) API with **your own API key**, meaning no middleman server, no usage fees beyond what you pay OpenRouter directly, and no data stored outside your browser.

---

## Features

| Feature | Detail |
|---|---|
| **3 tone modes** | Polite, Formal, Elaborate |
| **Email-aware** | Detects salutation/signature structure, rewrites only the body |
| **Structured text** | Preserves paragraphs, bullet points, numbered lists, indentation |
| **Context menu** | Right-click selected text → "Rewrite with ToneCraft" |
| **Keyboard shortcut** | `Ctrl+Shift+Y` / `Cmd+Shift+Y` |
| **Dark mode** | Toggleable, persisted across sessions |
| **Onboarding** | First-launch API key setup screen |
| **Settings page** | Change model and API key at any time |
| **Copy to clipboard** | One-click copy of the rewritten result |
| **Input cap** | Selections capped at 20,000 characters |
| **Abort on switch** | Clicking a second tone cancels the in-flight request |

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Build tool | Vite 5 | Fast HMR-free watch builds; multi-entry rollup control |
| UI | React 18 + TypeScript | Component model, strict types, minimal runtime |
| Styling | Tailwind CSS v3 | Utility-first, purged CSS, predictable dark mode via class strategy |
| Extension | Chrome MV3 | Required for all new Chrome extensions since Jan 2023 |
| AI | OpenRouter API | Single endpoint for 100+ models; user brings own key |
| Background | Vanilla TS (IIFE) | No framework in service worker; avoids MV3 module restrictions |

---

## Project Structure

```
tonecraft/
├── src/
│   ├── background/
│   │   └── background.ts        # MV3 service worker — context menu, keyboard shortcut
│   ├── content/
│   │   └── content.ts           # Injected into every page — captures selected text
│   ├── hooks/
│   │   └── useSelectedText.ts   # React hook — reads from chrome.storage.local
│   ├── options/
│   │   ├── Options.tsx          # Settings page — API key + model selector
│   │   └── main.tsx             # Options entry point
│   ├── popup/
│   │   ├── App.tsx              # Main popup UI
│   │   ├── Onboarding.tsx       # First-launch API key screen
│   │   ├── main.tsx             # Popup entry point
│   │   └── styles.css           # Tailwind directives + custom scrollbar
│   ├── utils/
│   │   ├── normalize.ts         # normalizeText() + cleanResponse()
│   │   ├── openrouter.ts        # fetch wrapper for OpenRouter API
│   │   └── prompt.ts            # buildPrompt() with tone personas + structural rules
│   └── types/
│       └── chrome.d.ts          # Vite env type declarations
├── public/
│   ├── manifest.json            # Chrome Extension MV3 manifest
│   └── icons/                   # icon16.png, icon48.png, icon128.png
├── store-assets/
│   ├── privacy-policy.html      # Hosted privacy policy (deploy to GitHub Pages)
│   └── store-listing.md         # Chrome Web Store copy + permission justifications
├── popup.html                   # HTML shell for popup
├── options.html                 # HTML shell for options page
├── vite.config.ts               # Primary build — popup + options (React + Tailwind)
├── vite.background.config.ts    # Secondary build — background.js as IIFE
├── vite.content.config.ts       # Secondary build — content.js as IIFE
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── DEPLOYMENT.md                # Step-by-step Chrome Web Store submission guide
└── .env.example                 # Environment variable template
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- A free [OpenRouter API key](https://openrouter.ai/keys)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment (optional for development)

```bash
cp .env.example .env
```

> ⚠️ **Do not put a real key in `.env` for production builds.** Vite bakes env variables into `dist/assets/popup.js` as plain text. For production, leave `VITE_OPENROUTER_API_KEY` empty — users enter their own key via the onboarding screen.

### 3. Build the extension

```bash
npm run build
```

Output is written to `dist/`.

### 4. Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `dist/` folder
5. The ToneCraft icon appears in your toolbar

### 5. First use

Click the toolbar icon → paste your OpenRouter API key → click **Get Started**.

---

## Development Workflow

### Watch mode

```bash
npm run dev
```

Runs three Vite watchers in parallel (via `concurrently`):

| Watcher | Input | Output |
|---|---|---|
| Primary | `popup.html`, `options.html` | `dist/assets/popup.js`, `dist/assets/options.js`, `dist/assets/styles.css` |
| Background | `src/background/background.ts` | `dist/background.js` |
| Content | `src/content/content.ts` | `dist/content.js` |

Each watcher rebuilds its bundle in ~150–500 ms on save.

### Reloading after changes

Chrome extensions don't hot-reload automatically. After each build:

1. Go to `chrome://extensions`
2. Click the **↺ refresh** icon on the ToneCraft card
3. For popup-only changes, just close and reopen the popup — it always loads fresh

Tip: install the [Extensions Reloader](https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid) extension for one-click reloads.

### Type checking

```bash
npm run type-check
```

Runs `tsc --noEmit` with strict mode across all source files. No output means no errors.

---

## Build System

### Why three separate Vite configs?

Chrome MV3 has strict constraints on each entry point:

| Entry | Format required | Reason |
|---|---|---|
| `popup.html` | ES module | Loaded by Chrome as a regular HTML page; Vite processes imports |
| `options.html` | ES module | Same as popup |
| `background.js` | **IIFE** | MV3 service workers reject `import`/`export` at the top level unless `"type": "module"` is set in manifest |
| `content.js` | **IIFE** | Content scripts run in isolated worlds; IIFE is safest for broad compatibility |

Rollup (Vite's bundler) cannot apply different output formats to different entries in a single build. So the build is split:

```
vite build                              # popup + options → ES modules
vite build --config vite.background.config.ts   # background → IIFE
vite build --config vite.content.config.ts      # content → IIFE
```

`emptyOutDir: false` on the secondary builds prevents them from wiping `dist/` after the primary build fills it.

### Output structure

```
dist/
├── manifest.json           ← copied from public/
├── background.js           ← IIFE bundle (~0.5 KB)
├── content.js              ← IIFE bundle (~0.3 KB)
├── popup.html              ← processed HTML with relative asset paths
├── options.html
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── assets/
    ├── popup.js            ← React + App (~18 KB gzipped: ~6 KB)
    ├── options.js          ← React + Options (~6 KB)
    ├── styles.css          ← Tailwind purged CSS (~20 KB)
    └── styles-[hash].js    ← React shared chunk
```

> **Critical:** `vite.config.ts` sets `base: ''` so all asset paths in the built HTML are relative (`./assets/popup.js`). Without this, paths are absolute (`/assets/popup.js`) and fail in a Chrome extension context.

---

## Architecture

### Data flow

```
User selects text on webpage
        │
        ▼
content.ts (mouseup, 250ms debounce)
  └─ chrome.storage.local.set({ selectedText })
              │
              ▼
        [storage]
              │
              ▼
useSelectedText hook (popup opens)
  ├─ chrome.storage.local.get (initial load)
  └─ chrome.storage.local.onChanged (live updates)
              │
              ▼
        App.tsx
  └─ User clicks tone button
              │
              ▼
  normalizeText(selectedText)        ← cleans line endings, strips artifacts
              │
              ▼
  buildPrompt(text, tone)            ← constructs system prompt + user message
              │
              ▼
  fetch → OpenRouter API             ← with AbortController signal
              │
              ▼
  cleanResponse(raw)                 ← strips code fences, preambles
              │
              ▼
        Output div (whitespace-pre-wrap)
```

### Why `chrome.storage.local` instead of `chrome.runtime.sendMessage`?

MV3 service workers go to sleep after ~30 seconds of inactivity. When the content script calls `sendMessage` to a sleeping worker, Chrome throws `"Receiving end does not exist"`. Using `storage.local` as the communication channel sidesteps this entirely — storage operations don't require the worker to be awake.

### Storage layout

| Key | Storage area | Value | Notes |
|---|---|---|---|
| `selectedText` | `local` | `string` | Overwritten on each selection; capped at 20,000 chars |
| `apiKey` | `local` | `string` | Never synced to Google; stays on-device only |
| `model` | `sync` | `string` | Non-sensitive; syncs across devices |
| `darkMode` | `sync` | `boolean` | Non-sensitive; syncs across devices |

### Prompt system

`src/utils/prompt.ts` builds a two-part prompt:

1. **Tone persona** — describes the writing assistant's role and goal for the chosen tone
2. **Structural rules** — 9 numbered constraints the model must follow verbatim:
   - Preserve `\n\n` paragraph breaks in exact positions
   - Preserve single `\n` line breaks within paragraphs
   - Keep bullet/numbered list format
   - No new markdown if not present in input
   - No preamble or explanation in output

If the text matches the email pattern (`/^(dear\s|hi\s|hello\s|...)/im`), three additional email-specific rules are appended: preserve salutation structure, preserve signature block position, rewrite only the body.

### Text normalization

`src/utils/normalize.ts` runs in two places:

**`normalizeText()`** — before the API call:
- Normalises all line endings to `\n`
- Replaces non-breaking spaces (` `, ` `, `⁠`) and zero-width chars
- Removes soft hyphens (`­`) that can confuse tokenisers
- Collapses 3+ consecutive blank lines to 2
- Trims trailing whitespace per line

**`cleanResponse()`** — after the API response:
- Strips wrapping code fences (` ```text ... ``` `)
- Strips 6 common preamble patterns ("Here is the rewritten text:", "Certainly!", etc.)
- Collapses extra blank lines the model introduces

---

## Configuration

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `VITE_OPENROUTER_API_KEY` | Dev only | Baked into popup bundle at build time. Leave empty for production builds. |

### `manifest.json` key fields

| Field | Value | Notes |
|---|---|---|
| `manifest_version` | `3` | Required for all new extensions |
| `minimum_chrome_version` | `116` | First stable MV3 with reliable service workers |
| `permissions` | `activeTab, storage, contextMenus` | `storage` for chrome.storage API; `activeTab` for `openPopup()` |
| `host_permissions` | `https://openrouter.ai/*` | Allows `fetch()` to OpenRouter from the popup |
| `content_security_policy` | `script-src 'self'; object-src 'none'; connect-src https://openrouter.ai` | Explicit; no `unsafe-eval` or `unsafe-inline` |

### Changing the default model

`src/popup/App.tsx`, line 14:

```ts
const DEFAULT_MODEL = 'openai/gpt-oss-120b:free'
```

Any [OpenRouter model ID](https://openrouter.ai/models) works here.

### Adding a new tone

1. Add to `Tone` union in `src/utils/prompt.ts`:
   ```ts
   export type Tone = 'polite' | 'formal' | 'elaborate' | 'concise'
   ```
2. Add a persona string to `TONE_PERSONA` in the same file
3. Add to the `TONES` array in `src/popup/App.tsx`

---

## Security Model

### API key

- Stored in `chrome.storage.local` — never written to `chrome.storage.sync`, so it never leaves the device or syncs to Google's servers
- Sent only in the `Authorization: Bearer` header over HTTPS to `https://openrouter.ai`
- Never logged, never appears in error messages surfaced to the user

### Request safety

- All fetch calls include an `AbortController` signal — switching tones cancels the previous request immediately
- Response body is rejected if `content-length` header exceeds 512 KB
- Raw response text is also checked against 512 KB before parsing
- API error messages are sanitised — only status-code-specific strings are shown to users (401, 402, 429, 5xx), not raw API error bodies

### Content script

- Only writes to `chrome.storage.local` — reads nothing, touches no DOM
- Text is capped at 20,000 characters before storage
- No external fetches; no `eval`; no `innerHTML`

### Content Security Policy

```json
"script-src 'self'; object-src 'none'; connect-src https://openrouter.ai;"
```

- `'self'` — only scripts from the extension package can execute
- `object-src 'none'` — no Flash, no plugins
- `connect-src` — only OpenRouter is an allowed fetch target

---

## API Integration

### Endpoint

```
POST https://openrouter.ai/api/v1/chat/completions
```

### Headers

```
Authorization: Bearer <user-api-key>
Content-Type: application/json
HTTP-Referer: https://tonecraft.ext
X-Title: ToneCraft
```

`HTTP-Referer` is required by OpenRouter for usage attribution. A stable fake origin is used since Chrome extensions don't have a real URL.

### Request body

```json
{
  "model": "openai/gpt-oss-120b:free",
  "messages": [
    { "role": "system", "content": "<tone persona + structural rules>" },
    { "role": "user",   "content": "<normalized selected text>" }
  ],
  "temperature": 0.7,
  "max_tokens": 2048
}
```

### Error handling

| HTTP status | Message shown to user |
|---|---|
| 401 | "Invalid API key. Check your key in Settings." |
| 402 | "Insufficient credits on your OpenRouter account." |
| 429 | "Rate limit reached. Please wait a moment and try again." |
| 500–503 | "OpenRouter is temporarily unavailable. Try again shortly." |
| Network failure | "Network error — check your connection and try again." |
| AbortError | Silently ignored (user switched tones) |

---

## Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the full Chrome Web Store submission checklist.

### Quick version bump

1. Update `"version"` in `public/manifest.json`
2. Update version string in `src/options/Options.tsx` footer
3. `npm run build`
4. Create new ZIP:
   ```bash
   cd dist && zip -r ../tonecraft-v<version>.zip . && cd ..
   ```
5. Upload to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)

---

## License

MIT — see LICENSE file.
