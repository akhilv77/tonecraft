import { useState } from 'react'

interface OnboardingProps {
  onComplete: () => void
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [key, setKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = key.trim()
    if (!trimmed) {
      setError('Please enter your API key.')
      return
    }
    if (!trimmed.startsWith('sk-or-')) {
      setError('Key should start with sk-or-… Check your OpenRouter dashboard.')
      return
    }
    setError('')
    setSaving(true)
    // API key goes into local storage (stays on-device, never synced to Google)
    chrome.storage.local.set({ apiKey: trimmed }, () => {
      setSaving(false)
      onComplete()
    })
  }

  return (
    <div className="w-[400px] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      {/* Top accent bar */}
      <div className="h-[3px] w-full bg-indigo-600" />

      <div className="px-8 pt-8 pb-7 flex flex-col items-center text-center">
        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 mb-5">
          <span className="text-white text-2xl font-bold tracking-tight">T</span>
        </div>

        {/* Name + tagline */}
        <h1 className="text-[17px] font-bold text-gray-900 dark:text-white leading-tight">
          ToneCraft
        </h1>
        <p className="text-[11px] font-medium text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mt-0.5 mb-3">
          AI Text Rewriter
        </p>

        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-[280px] mb-7">
          Select any text on a webpage — emails, messages, documents — and instantly rewrite it in the perfect professional tone.
        </p>

        {/* Features row */}
        <div className="flex items-center gap-4 mb-7 w-full justify-center">
          {[
            { icon: '✦', label: 'Polite' },
            { icon: '✦', label: 'Formal' },
            { icon: '✦', label: 'Elaborate' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
              <span className="text-indigo-400 text-[8px]">{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="w-full border-t border-gray-100 dark:border-gray-800 mb-6" />

        {/* API key form */}
        <form onSubmit={handleSubmit} className="w-full space-y-3">
          <div className="text-left">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              OpenRouter API Key
            </label>
            <div className="relative">
              <input
                autoFocus
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={(e) => {
                  setKey(e.target.value)
                  if (error) setError('')
                }}
                placeholder="sk-or-v1-…"
                className={`w-full rounded-xl border px-3.5 py-2.5 pr-16 text-sm font-mono bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 transition-all ${
                  error
                    ? 'border-red-300 dark:border-red-700 focus:ring-red-300 dark:focus:ring-red-700'
                    : 'border-gray-200 dark:border-gray-700 focus:ring-indigo-300 dark:focus:ring-indigo-700 focus:border-indigo-300 dark:focus:border-indigo-700'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowKey((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
            {error && (
              <p className="text-[11px] text-red-500 dark:text-red-400 mt-1.5">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            {saving ? 'Saving…' : 'Get Started'}
          </button>
        </form>

        {/* Get key link */}
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-3.5">
          Don't have a key?{' '}
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noreferrer"
            className="text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium underline underline-offset-2 transition-colors"
            onClick={(e) => {
              e.preventDefault()
              chrome.tabs.create({ url: 'https://openrouter.ai/keys' })
            }}
          >
            Get a free key →
          </a>
        </p>
      </div>
    </div>
  )
}
