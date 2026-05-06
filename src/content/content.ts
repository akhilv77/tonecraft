// Content script: plain TypeScript only — no React, no npm imports.
// Built as IIFE and injected into every page.
//
// Uses chrome.storage.local instead of chrome.runtime.sendMessage so it works
// even when the MV3 service worker is sleeping (which is most of the time).

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function handleMouseUp(): void {
  if (debounceTimer) clearTimeout(debounceTimer)

  debounceTimer = setTimeout(() => {
    const selection = window.getSelection()
    if (!selection) return

    const text = selection.toString().trim()
    if (!text || text.length < 3) return

    // Cap at 20,000 chars — prevents storing entire documents and avoids
    // hitting chrome.storage quota or sending enormous prompts to the API.
    const capped = text.length > 20_000 ? text.slice(0, 20_000) : text
    chrome.storage.local.set({ selectedText: capped })
  }, 250)
}

document.addEventListener('mouseup', handleMouseUp)
