/**
 * Cleans raw selected text before it is sent to the API.
 * Fixes browser/OS artifacts without changing the visible structure.
 */
export function normalizeText(raw: string): string {
  return raw
    // Normalize all line endings to \n
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Replace non-breaking spaces and zero-width chars with regular space
    .replace(/[   ⁠﻿]/g, ' ')
    // Replace soft hyphens (invisible, can confuse the model)
    .replace(/­/g, '')
    // Collapse more than 2 consecutive blank lines into exactly 2
    .replace(/\n{3,}/g, '\n\n')
    // Remove trailing whitespace from each line (keeps indent on leading side)
    .split('\n').map(line => line.trimEnd()).join('\n')
    // Trim the whole string
    .trim()
}

/**
 * Cleans the raw API response before displaying it.
 * Removes code fences, preamble phrases, and normalises line endings.
 */
export function cleanResponse(raw: string): string {
  let text = raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')

  // Strip wrapping code fences: ```text ... ``` or ``` ... ```
  text = text.replace(/^```[a-z]*\n?([\s\S]*?)```$/i, '$1')

  // Strip common preamble patterns the model adds despite instructions
  const preambles = [
    /^here(?:'s| is) the rewritten(?: text)?:?\s*/i,
    /^here(?:'s| is) (?:a |the )?(?:polite|formal|elaborate)(?: version)?:?\s*/i,
    /^rewritten(?: text)?:?\s*/i,
    /^certainly[!.]?\s*/i,
    /^sure[!.]?\s*/i,
    /^of course[!.]?\s*/i,
  ]
  for (const pattern of preambles) {
    text = text.replace(pattern, '')
  }

  // Collapse 3+ blank lines that the model occasionally introduces
  text = text.replace(/\n{3,}/g, '\n\n')

  return text.trim()
}
