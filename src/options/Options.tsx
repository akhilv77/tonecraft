import { useState, useEffect } from 'react'

const MODEL_OPTIONS = [
  { value: 'openai/gpt-oss-120b:free', label: 'GPT OSS 120B (free)' },
  { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini (fast, cost-effective)' },
  { value: 'openai/gpt-4o', label: 'GPT-4o (most capable)' },
  { value: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku (fast)' },
  { value: 'anthropic/claude-3-sonnet', label: 'Claude 3 Sonnet (balanced)' },
  { value: 'anthropic/claude-3-opus', label: 'Claude 3 Opus (advanced)' },
  { value: 'google/gemini-flash-1.5', label: 'Gemini Flash 1.5 (fast)' },
  { value: 'meta-llama/llama-3.1-8b-instruct:free', label: 'LLaMA 3.1 8B (free tier)' },
]

export default function Options() {
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('openai/gpt-oss-120b:free')
  const [customModel, setCustomModel] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)
  const [dark, setDark] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    // API key: local storage (never leaves this device)
    chrome.storage.local.get(['apiKey'], (local) => {
      if (!chrome.runtime.lastError && local.apiKey) {
        setApiKey(local.apiKey as string)
      }
    })
    // Preferences: sync storage (non-sensitive, convenient across devices)
    chrome.storage.sync.get(['model', 'darkMode'], (synced) => {
      if (chrome.runtime.lastError) return
      if (synced.darkMode === true) setDark(true)
      if (synced.model) {
        const isPreset = MODEL_OPTIONS.some((m) => m.value === synced.model)
        if (isPreset) {
          setModel(synced.model as string)
        } else {
          setUseCustom(true)
          setCustomModel(synced.model as string)
        }
      }
    })
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  function handleSave() {
    setSaveError(null)
    const finalModel = useCustom ? customModel.trim() : model

    if (!finalModel) {
      setSaveError('Please select or enter a model.')
      return
    }

    // Save API key to local storage (stays on-device only)
    chrome.storage.local.set({ apiKey: apiKey.trim() }, () => {
      if (chrome.runtime.lastError) {
        setSaveError('Failed to save API key.')
        return
      }
      // Save non-sensitive preferences to sync storage
      chrome.storage.sync.set({ model: finalModel, darkMode: dark }, () => {
        if (chrome.runtime.lastError) {
          setSaveError('Failed to save preferences.')
          return
        }
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      })
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      {/* Top accent bar — matches popup and onboarding */}
      <div className="h-[3px] w-full bg-indigo-600" />
      <div className="max-w-xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold">ToneCraft</h1>
              <p className="text-[11px] text-indigo-500 dark:text-indigo-400 uppercase tracking-widest font-medium">AI Text Rewriter · Settings</p>
            </div>
          </div>
          <button
            onClick={() => setDark((d) => !d)}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {dark ? '☀ Light Mode' : '☾ Dark Mode'}
          </button>
        </div>

        <div className="space-y-6">
          {/* API Key */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="text-sm font-semibold mb-1">OpenRouter API Key</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Required to use the AI rewriting features. Get your key at{' '}
              <span className="text-indigo-500">openrouter.ai/keys</span>.
            </p>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-v1-…"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2.5 pr-16 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowKey((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
            {!apiKey && (
              <p className="text-xs text-amber-500 mt-2">
                No API key set — the extension will not function without one.
              </p>
            )}
          </div>

          {/* Model Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="text-sm font-semibold mb-1">AI Model</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Choose the model used for tone conversion. All models are available via OpenRouter.
            </p>

            <div className="space-y-2 mb-3">
              {MODEL_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${!useCustom && model === opt.value
                    ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-600'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                >
                  <input
                    type="radio"
                    name="model"
                    value={opt.value}
                    checked={!useCustom && model === opt.value}
                    onChange={() => {
                      setModel(opt.value)
                      setUseCustom(false)
                    }}
                    className="accent-indigo-600"
                  />
                  <div>
                    <div className="text-sm font-medium">{opt.label.split(' (')[0]}</div>
                    <div className="text-xs text-gray-400">
                      {opt.label.includes('(') ? opt.label.match(/\((.+)\)/)?.[1] : ''}
                    </div>
                  </div>
                </label>
              ))}

              {/* Custom model */}
              <label
                className={`flex items-start gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${useCustom
                  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-600'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
              >
                <input
                  type="radio"
                  name="model"
                  checked={useCustom}
                  onChange={() => setUseCustom(true)}
                  className="accent-indigo-600 mt-1"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium mb-1.5">Custom model ID</div>
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => {
                      setCustomModel(e.target.value)
                      setUseCustom(true)
                    }}
                    placeholder="e.g. mistralai/mistral-7b-instruct"
                    className="w-full rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-2.5 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors"
                  />
                </div>
              </label>
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              Save Settings
            </button>
            {saved && (
              <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                ✓ Saved
              </span>
            )}
          </div>

          {saveError && (
            <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p>
          )}

          {/* Info + privacy */}
          <div className="text-xs text-gray-400 dark:text-gray-600 leading-relaxed">
            Settings are stored in your browser's sync storage and are not shared externally.
            Your API key is sent only to OpenRouter when performing tone conversions.
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-300 dark:text-gray-600">
              ToneCraft v1.0.0 · Akhil Varma Gadiraju
            </span>
            <a
              href="https://nuevesolutions.github.io/tonecraft/privacy-policy"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
