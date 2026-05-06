# Chrome Web Store — Deployment Guide

## Pre-flight checklist

### 1. Build the extension
```bash
npm run build
# Output: dist/
```
Verify `dist/` contains:
- `manifest.json`
- `popup.html`, `options.html`
- `background.js`, `content.js`
- `assets/popup.js`, `assets/options.js`, `assets/styles.css`
- `icons/icon16.png`, `icons/icon48.png`, `icons/icon128.png`

### 2. Test locally
1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** → select the `dist/` folder
4. Test the full flow:
   - First-launch onboarding (paste a real OpenRouter key)
   - Select text on a page → popup shows it
   - Run all three tones (Polite, Formal, Elaborate)
   - Multi-paragraph text preserves structure in output
   - Right-click context menu works
   - Keyboard shortcut Ctrl+Shift+Y opens popup
   - Settings page saves model + API key
   - Dark mode toggle persists

### 3. Host the privacy policy
The Chrome Web Store requires a public URL for the privacy policy.

**Option A — GitHub Pages (recommended, free)**
```bash
# In your repo, create a gh-pages branch or use /docs folder
cp store-assets/privacy-policy.html docs/privacy-policy.html
git add docs/privacy-policy.html
git commit -m "Add privacy policy for Chrome Web Store"
git push
# Enable GitHub Pages in repo Settings → Pages → Branch: main /docs
# URL will be: https://<username>.github.io/<repo>/privacy-policy
```

**Option B — Any static host**
Upload `store-assets/privacy-policy.html` to Vercel, Netlify, or any host.

After hosting, update the privacy policy URL in `src/options/Options.tsx`:
```tsx
href="https://YOUR_ACTUAL_URL/privacy-policy"
```
Then rebuild: `npm run build`

### 4. Create the ZIP for submission
```bash
cd dist && zip -r ../tonecraft-v1.0.0.zip . && cd ..
```
The ZIP must contain `manifest.json` at its root (not inside a subfolder).

### 5. Prepare screenshots
Take 1–5 screenshots at **1280×800 px** showing:
1. Popup open with selected text + a tone result
2. Onboarding screen
3. Settings/Options page
4. (optional) Right-click context menu

---

## Chrome Web Store submission steps

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay the one-time **$5 developer registration fee** (if not already paid)
3. Click **New item** → upload `tonecraft-v1.0.0.zip`
4. Fill in the store listing using `store-assets/store-listing.md`:
   - **Name**: ToneCraft – AI Text Rewriter
   - **Short description**: copy from store-listing.md (109 chars)
   - **Detailed description**: copy from store-listing.md
   - **Category**: Productivity
   - **Language**: English
5. Upload screenshots and promotional images
6. Set **Privacy practices**:
   - Does your extension collect user data? → **Yes**
   - Data type: **Personally identifiable information** (API key)
   - Usage: **The API key is stored locally and used only to authenticate requests to OpenRouter on the user's behalf**
   - Privacy policy URL: your hosted URL from Step 3
7. Under **Permissions justification**, paste each justification from store-listing.md
8. Submit for review

### Typical review time
- New extensions: 1–3 business days
- Updates: a few hours to 1 business day

---

## After approval

Update the privacy policy link in `src/options/Options.tsx` to the final store URL if it differs, rebuild, and submit as version 1.0.1.

---

## Version update workflow
1. Bump `version` in `public/manifest.json` (e.g. `"1.0.1"`)
2. Update version string in `src/options/Options.tsx` footer
3. `npm run build`
4. `cd dist && zip -r ../tonecraft-v1.0.1.zip . && cd ..`
5. Upload new ZIP to the Developer Dashboard → **Package** tab
