export type Tone = 'polite' | 'formal' | 'elaborate'

const EMAIL_PATTERN =
  /^(dear\s|hi\s|hello\s|good\s(morning|afternoon|evening)|from:\s|to:\s|subject:\s)/im

export function detectEmailStyle(text: string): boolean {
  return EMAIL_PATTERN.test(text.trim())
}

// ── Structural contract ──────────────────────────────────────────────────────
// Explicit, itemised rules that the model must follow verbatim.
// Written as a numbered list so the model treats each rule independently.

const STRUCTURE_RULES = `
Structural rules — follow these exactly:
1. A blank line in the input (\\n\\n) means a paragraph break. Keep every paragraph break in the same position in the output.
2. A single line break within a paragraph (\\n) must be preserved exactly — do not merge lines.
3. Bullet points starting with -, *, or • must stay as bullet points in the same position.
4. Numbered lists (1. 2. 3.) must stay numbered in the same order and format.
5. Indented lines must remain indented.
6. Do NOT introduce any markdown formatting (**, __, #, etc.) that was not present in the input.
7. Do NOT merge separate paragraphs into one block.
8. Do NOT add a preamble, intro sentence, label, or explanation before or after the output.
9. Return ONLY the rewritten text — nothing else.`.trim()

const EMAIL_RULES = `
Email-specific rules:
- Keep the salutation line (e.g. "Dear Alex," / "Hi Sarah,") in place; only adjust its tone.
- Keep the sign-off and signature block (e.g. "Best regards,\\nAkhil") at the end, unchanged in position.
- Rewrite only the body paragraphs between the salutation and sign-off.`.trim()

// ── Tone personas ────────────────────────────────────────────────────────────

const TONE_PERSONA: Record<Tone, string> = {
  polite:
    'You are a professional writing assistant that rewrites text to be warm, courteous, and considerate. ' +
    'Preserve every idea and detail from the original — only change how it is expressed.',

  formal:
    'You are a professional writing assistant that rewrites text in a formal, precise register suitable for ' +
    'business correspondence, official documents, and professional reports. ' +
    'Use complete sentences, avoid contractions and colloquialisms, and maintain a neutral, objective tone. ' +
    'Preserve every idea and detail from the original — only change how it is expressed.',

  elaborate:
    'You are a professional writing assistant that rewrites text with greater depth, richer vocabulary, and ' +
    'well-developed explanations. Expand on key points where natural, add professional context, and use varied ' +
    'sentence structures. Preserve the core message entirely — only enrich how it is expressed.',
}

// ── Public API ───────────────────────────────────────────────────────────────

export interface PromptPayload {
  systemPrompt: string
  userMessage: string
}

export function buildPrompt(text: string, tone: Tone): PromptPayload {
  const isEmail = detectEmailStyle(text)

  const systemPrompt = [
    TONE_PERSONA[tone],
    STRUCTURE_RULES,
    isEmail ? EMAIL_RULES : '',
  ]
    .filter(Boolean)
    .join('\n\n')

  return { systemPrompt, userMessage: text }
}
