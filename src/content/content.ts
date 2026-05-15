// Content script: plain TypeScript only — no React, no npm imports.
// Built as IIFE and injected into every page.
//
// Uses chrome.storage.local instead of chrome.runtime.sendMessage so it works
// even when the MV3 service worker is sleeping (which is most of the time).

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function handleMouseUp(): void {
  if (debounceTimer) clearTimeout(debounceTimer)

  debounceTimer = setTimeout(() => {
    try {
      // Both checks guard against an invalidated extension context:
      // chrome.runtime.id → undefined when context is dead
      // chrome.storage    → undefined when context is partially torn down
      if (!chrome.runtime?.id || !chrome.storage) return

      const selection = window.getSelection()
      if (!selection) return

      const text = selection.toString().trim()
      if (!text || text.length < 3) return

      const capped = text.length > 20_000 ? text.slice(0, 20_000) : text
      chrome.storage.local.set({ selectedText: capped }).catch(() => {})
    } catch {
      // Swallow any synchronous throws from a dead extension context
    }
  }, 250)
}

document.addEventListener('mouseup', handleMouseUp)
