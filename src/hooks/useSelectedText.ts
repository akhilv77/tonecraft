import { useState, useEffect } from 'react'

export function useSelectedText(): string {
  const [text, setText] = useState<string>('')

  useEffect(() => {
    // Read directly from storage — no message passing needed
    chrome.storage.local.get(['selectedText'], (result) => {
      if (chrome.runtime.lastError) return
      if (result.selectedText) setText(result.selectedText as string)
    })

    // Watch for new selections while the popup stays open
    const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes.selectedText?.newValue) {
        setText(changes.selectedText.newValue as string)
      }
    }
    chrome.storage.local.onChanged.addListener(listener)
    return () => chrome.storage.local.onChanged.removeListener(listener)
  }, [])

  return text
}
