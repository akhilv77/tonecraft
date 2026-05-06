# ToneCraft – Chrome Web Store Listing Copy

---

## Extension name
ToneCraft – AI Text Rewriter

---

## Short description (132 chars max — currently 109)
Instantly rewrite selected text or emails in Polite, Formal, or Elaborate tone using AI. Works on any webpage.

---

## Detailed description

**Rewrite anything. Sound exactly right.**

ToneCraft is a professional AI writing assistant that lives in your browser toolbar. Select any text on any webpage — emails, Slack messages, reports, LinkedIn posts, support tickets — and instantly rewrite it in the tone that fits the moment.

---

**Three professional tones:**

• **Polite** — Warm, considerate, and friendly. Perfect for customer replies, requests, or any message where tone matters.

• **Formal** — Precise, professional, and authoritative. Ideal for business correspondence, proposals, and official documents.

• **Elaborate** — Detailed, expressive, and thorough. Great for reports, pitches, or whenever you need to say more with impact.

---

**Smart about structure:**

ToneCraft preserves multi-paragraph text, bullet points, numbered lists, and email formatting (salutation + body + signature). Your structure stays intact — only the tone changes.

---

**How it works:**

1. Select any text on a webpage
2. Click the ToneCraft icon (or right-click → "Rewrite with ToneCraft")
3. Choose a tone — Polite, Formal, or Elaborate
4. Copy the result and paste it anywhere

---

**Private by design:**

• Your text is sent directly from your browser to the OpenRouter API using your own API key — no middleman server
• No analytics, no tracking, no data collection
• API key stored securely in Chrome's built-in sync storage
• Works with any OpenRouter-compatible model

---

**Setup:**

1. Install ToneCraft
2. Get a free API key at openrouter.ai/keys
3. Paste it on first launch — done

---

**Keyboard shortcut:** Ctrl+Shift+Y (Mac: Cmd+Shift+Y)

---

## Category
Productivity

## Language
English

## Tags / keywords
AI writing, tone rewriter, email rewriter, text rewriter, formal writing, professional writing, OpenRouter, GPT, writing assistant, productivity

---

## Permission justifications (for the review form)

**activeTab**
Used to access the active tab when the user opens the popup via the keyboard shortcut (Ctrl+Shift+Y) or via the context menu entry. Without this, the extension cannot respond to those two triggers.

**storage**
Used to store the user's OpenRouter API key, preferred AI model, and dark mode setting in Chrome's built-in sync storage. Without this, the user would need to re-enter their API key every time.

**contextMenus**
Used to add a "Rewrite with ToneCraft" item to the right-click context menu when the user has text selected. This is the primary discovery path for new users.

**host_permissions: https://openrouter.ai/***
The popup makes a direct fetch() call to https://openrouter.ai/api/v1/chat/completions to perform tone conversion. This permission is the minimum scope needed for that single API endpoint.

---

## Store assets checklist

### Icons (already done)
- [x] 16×16 PNG  — icons/icon16.png
- [x] 48×48 PNG  — icons/icon48.png
- [x] 128×128 PNG — icons/icon128.png

### Required screenshots (need 1–5)
- Minimum size: 640×400 px
- Recommended: 1280×800 px
- PNG or JPEG
- Suggested shots:
  1. Popup open over a webpage with selected text visible and a tone result shown
  2. Onboarding screen (first-launch API key entry)
  3. Options/Settings page
  4. Right-click context menu showing "Rewrite with ToneCraft"

### Promotional images (optional but recommended)
- Small tile: 440×280 PNG (shown in search results)
- Large tile: 920×680 PNG
- Marquee: 1400×560 PNG

### Privacy policy
- File: store-assets/privacy-policy.html
- Must be hosted at a public URL before submission
- Recommended: deploy to GitHub Pages (see DEPLOYMENT.md)

---

## Pricing
Free (users bring their own OpenRouter API key)

## Regions
All regions
