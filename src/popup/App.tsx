import { useState, useEffect, useRef } from 'react'
import { useSelectedText } from '../hooks/useSelectedText'
import { convertTone } from '../utils/openrouter'
import type { Tone } from '../utils/prompt'
import Onboarding from './Onboarding'

const TONES: { id: Tone; label: string; description: string }[] = [
  { id: 'polite',    label: 'Polite',    description: 'Warm & considerate'  },
  { id: 'formal',    label: 'Formal',    description: 'Professional & precise' },
  { id: 'elaborate', label: 'Elaborate', description: 'Detailed & expressive' },
]

const DEFAULT_MODEL = 'openai/gpt-oss-120b:free'

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function IconCopy() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  )
}

function IconClear() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function IconMoon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  )
}

function IconSun() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function IconSettings() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
      {children}
    </p>
  )
}

export default function App() {
  const selectedText = useSelectedText()
  const [output, setOutput]       = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [dark, setDark]           = useState(false)
  const [copied, setCopied]       = useState(false)
  const [activeTone, setActiveTone] = useState<Tone | null>(null)
  const [onboarding, setOnboarding] = useState<'loading' | 'show' | 'done'>('loading')
  const [pendingTone, setPendingTone] = useState<Tone | null>(null)
  const outputRef  = useRef<HTMLDivElement>(null)
  const abortRef   = useRef<AbortController | null>(null)

  useEffect(() => {
    chrome.storage.local.get(['apiKey', 'selectedTone'], (local) => {
      const hasKey = Boolean(local.apiKey && !chrome.runtime.lastError)
      setOnboarding(hasKey ? 'done' : 'show')
      if (local.selectedTone) {
        setPendingTone(local.selectedTone as Tone)
        chrome.storage.local.remove(['selectedTone'])
      }
    })
    // Load non-sensitive preferences from sync storage
    chrome.storage.sync.get(['darkMode'], (synced) => {
      if (chrome.runtime.lastError) return
      if (synced.darkMode === true) setDark(true)
    })
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  // Persist dark mode only when the user explicitly toggles it, not on every render
  function toggleDark() {
    setDark(d => {
      const next = !d
      chrome.storage.sync.set({ darkMode: next })
      return next
    })
  }

  useEffect(() => {
    if (output && outputRef.current) outputRef.current.focus()
  }, [output])

  useEffect(() => {
    if (selectedText) {
      setOutput('')
      setError(null)
      setActiveTone(null)
    }
  }, [selectedText])

  // Auto-trigger when a tone was chosen from the context menu submenu
  useEffect(() => {
    if (pendingTone && selectedText && onboarding === 'done') {
      handleTone(pendingTone)
      setPendingTone(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingTone, selectedText, onboarding])

  async function handleTone(tone: Tone) {
    if (!selectedText || loading) return

    // Cancel any in-flight request before starting a new one
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setActiveTone(tone)
    setLoading(true)
    setError(null)
    setOutput('')

    try {
      const [local, synced] = await Promise.all([
        new Promise<{ apiKey?: string }>((resolve) =>
          chrome.storage.local.get(['apiKey'], (r) => resolve(r))
        ),
        new Promise<{ model?: string }>((resolve) =>
          chrome.storage.sync.get(['model'], (r) => resolve(r))
        ),
      ])

      const apiKey = local.apiKey
      const model  = synced.model || DEFAULT_MODEL

      if (!apiKey) throw new Error('API key not set. Open Settings to configure it.')

      const result = await convertTone({ apiKey, model, text: selectedText, tone, signal: controller.signal })
      setOutput(result)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
      setActiveTone(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleClear() {
    setOutput('')
    setError(null)
    setActiveTone(null)
  }

  const hasText   = Boolean(selectedText)
  const hasOutput = Boolean(output)

  // ── Loading splash ──────────────────────────────────────────────────────────
  if (onboarding === 'loading') {
    return (
      <div className="w-[400px] bg-white dark:bg-gray-900 flex flex-col">
        <div className="h-[3px] w-full bg-indigo-600" />
        <div className="h-48 flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
    )
  }

  if (onboarding === 'show') {
    return <Onboarding onComplete={() => setOnboarding('done')} />
  }

  // ── Main UI ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-[400px] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans select-none">

      {/* Top accent bar */}
      <div className="h-[3px] w-full bg-indigo-600" />

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold tracking-tight">T</span>
          </div>
          <div className="leading-none">
            <p className="font-semibold text-[13px] text-gray-900 dark:text-gray-100">ToneCraft</p>
            <p className="text-[9px] text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-[3px]">AI Text Rewriter</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={toggleDark}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? <IconSun /> : <IconMoon />}
          </button>
          <button
            onClick={() => chrome.runtime.openOptionsPage()}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Open settings"
            aria-label="Open settings"
          >
            <IconSettings />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-5 space-y-5">

        {/* Selected text */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <SectionLabel>Selected Text</SectionLabel>
            {hasText && (
              <span className="text-[10px] text-gray-400 dark:text-gray-500 tabular-nums">
                {selectedText.length} chars
              </span>
            )}
          </div>
          <div className={`
            scrollable min-h-[100px] max-h-[160px] overflow-y-auto rounded-xl
            px-3.5 py-3 text-[13px] leading-relaxed whitespace-pre-wrap transition-colors
            ${hasText
              ? 'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
              : 'bg-gray-50 dark:bg-gray-800/60 text-gray-400 dark:text-gray-500 border border-dashed border-gray-200 dark:border-gray-700'
            }
          `}>
            {hasText ? selectedText : 'Select any text on the page to get started…'}
          </div>
        </div>

        {/* Tone buttons */}
        <div>
          <SectionLabel>Rewrite As</SectionLabel>
          <div className="grid grid-cols-3 gap-2.5">
            {TONES.map(({ id, label, description }) => {
              const isActive   = activeTone === id
              const isDisabled = !hasText || loading
              return (
                <button
                  key={id}
                  onClick={() => handleTone(id)}
                  disabled={isDisabled}
                  className={`
                    relative flex flex-col items-center justify-center h-[68px] rounded-xl
                    border-2 text-center transition-all duration-150
                    ${isActive
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : isDisabled
                      ? 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/60 dark:hover:bg-indigo-900/20 cursor-pointer'
                    }
                  `}
                >
                  {isActive && loading
                    ? <Spinner />
                    : <span className="font-semibold text-[13px]">{label}</span>
                  }
                  <span className="text-[10px] mt-1 leading-tight opacity-60">{description}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="animate-fade-in flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">{error}</p>
          </div>
        )}

        {/* Output */}
        {hasOutput && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <SectionLabel>
                Result
                {activeTone && (
                  <span className="ml-1.5 text-indigo-500 dark:text-indigo-400 normal-case font-normal tracking-normal">
                    — {TONES.find(t => t.id === activeTone)?.label}
                  </span>
                )}
              </SectionLabel>
              <div className="flex items-center gap-1.5 mb-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  <IconCopy />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <IconClear />
                  Clear
                </button>
              </div>
            </div>
            <div
              ref={outputRef}
              tabIndex={0}
              className="scrollable min-h-[110px] max-h-[200px] overflow-y-auto rounded-xl px-3.5 py-3 text-[13px] leading-relaxed whitespace-pre-wrap bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-700 transition-colors"
            >
              {output}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <span className="text-[10px] text-gray-300 dark:text-gray-600">Powered by OpenRouter</span>
        {!hasText && (
          <span className="text-[10px] text-gray-300 dark:text-gray-600">Right-click text to convert</span>
        )}
      </div>

    </div>
  )
}
