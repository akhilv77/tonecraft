// Built as IIFE — no top-level imports allowed. All chrome.* APIs are available natively.
// Selected text is stored via chrome.storage.local (set by content script),
// so no message-passing for text capture — eliminates MV3 service-worker-sleep errors.

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'tone-converter',
    title: 'Rewrite with ToneCraft',
    contexts: ['selection'],
  })
})

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === 'tone-converter' && info.selectionText) {
    const text = info.selectionText.length > 20_000
      ? info.selectionText.slice(0, 20_000)
      : info.selectionText
    chrome.storage.local.set({ selectedText: text }, () => {
      chrome.action.openPopup().catch(() => {})
    })
  }
})

chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-popup') {
    chrome.action.openPopup().catch(() => {})
  }
})
