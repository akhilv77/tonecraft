// Built as IIFE — no top-level imports allowed. All chrome.* APIs are available natively.
// Selected text is stored via chrome.storage.local (set by content script),
// so no message-passing for text capture — eliminates MV3 service-worker-sleep errors.

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'tone-converter',
      title: 'Rewrite with ToneCraft',
      contexts: ['selection'],
    })
    chrome.contextMenus.create({
      id: 'tone-polite',
      parentId: 'tone-converter',
      title: 'Polite — Warm & considerate',
      contexts: ['selection'],
    })
    chrome.contextMenus.create({
      id: 'tone-formal',
      parentId: 'tone-converter',
      title: 'Formal — Professional & precise',
      contexts: ['selection'],
    })
    chrome.contextMenus.create({
      id: 'tone-elaborate',
      parentId: 'tone-converter',
      title: 'Elaborate — Detailed & expressive',
      contexts: ['selection'],
    })
  })
})

const TONE_MENU_IDS: Record<string, string> = {
  'tone-polite':    'polite',
  'tone-formal':    'formal',
  'tone-elaborate': 'elaborate',
}

chrome.contextMenus.onClicked.addListener((info) => {
  const tone = TONE_MENU_IDS[info.menuItemId as string]
  if (!tone || !info.selectionText) return

  const text = info.selectionText.length > 20_000
    ? info.selectionText.slice(0, 20_000)
    : info.selectionText

  chrome.storage.local.set({ selectedText: text, selectedTone: tone }, () => {
    chrome.action.openPopup().catch(() => {})
  })
})

chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-popup') {
    chrome.action.openPopup().catch(() => {})
  }
})
