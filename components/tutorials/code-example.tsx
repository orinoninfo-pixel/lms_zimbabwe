"use client"

import { useMemo, useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

const PYTHON_KEYWORDS = new Set(["and", "as", "break", "class", "continue", "def", "elif", "else", "False", "for", "from", "if", "import", "in", "is", "None", "not", "or", "pass", "return", "True", "while", "with", "yield"])

function highlightedPython(source: string) {
  return source.split(/(#[^\n]*|"[^"\n]*"|'[^'\n]*'|\b[A-Za-z_]\w*\b|\b\d+(?:\.\d+)?\b)/g).map((token, index) => {
    const className = token.startsWith("#")
      ? "text-emerald-400"
      : token.startsWith('"') || token.startsWith("'")
        ? "text-amber-300"
        : PYTHON_KEYWORDS.has(token)
          ? "text-fuchsia-300"
          : /^\d/.test(token)
            ? "text-cyan-300"
            : "text-slate-100"
    return <span className={className} key={`${index}-${token}`}>{token}</span>
  })
}

export function CodeExample({ title, language, sourceCode, expectedOutput, explanation }: { title: string; language: string; sourceCode: string; expectedOutput?: string | null; explanation?: string | null }) {
  const [copied, setCopied] = useState(false)
  const code = useMemo(() => language.toLowerCase() === "python" ? highlightedPython(sourceCode) : sourceCode, [language, sourceCode])

  async function copy() {
    await navigator.clipboard.writeText(sourceCode)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <figure className="my-7 overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-sm">
      <figcaption className="flex items-center justify-between gap-4 border-b border-slate-800 px-4 py-3">
        <div><p className="text-sm font-medium text-slate-100">{title}</p><p className="text-xs uppercase tracking-wider text-slate-400">{language}</p></div>
        <Button type="button" size="sm" variant="secondary" onClick={() => void copy()} aria-label={`Copy ${title} code`}>
          {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}{copied ? "Copied" : "Copy"}
        </Button>
      </figcaption>
      <pre className="max-w-full overflow-x-auto p-4 text-sm leading-7 text-slate-100"><code>{code}</code></pre>
      {expectedOutput ? <div className="border-t border-slate-800 bg-slate-900 px-4 py-3"><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Expected output</p><pre className="overflow-x-auto text-sm text-emerald-300">{expectedOutput}</pre></div> : null}
      {explanation ? <p className="border-t border-slate-800 px-4 py-3 text-sm leading-6 text-slate-300">{explanation}</p> : null}
    </figure>
  )
}
