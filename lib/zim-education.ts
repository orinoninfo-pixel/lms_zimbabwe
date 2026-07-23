export const ZIM_LEVEL_MIN = 1
export const ZIM_LEVEL_MAX = 13

export function formatZimLevel(level: number): string {
  if (level >= 1 && level <= 7) return `Grade ${level}`
  if (level >= 8 && level <= 13) return `Form ${level - 7}`
  return `Level ${level}`
}

export const ZIM_LEVELS: Array<{ value: number; label: string }> = Array.from(
  { length: ZIM_LEVEL_MAX },
  (_, i) => {
    const value = i + 1
    return { value, label: formatZimLevel(value) }
  }
)

export const EXAMINING_BODIES: Array<{ value: "zimsec" | "cambridge"; label: string }> = [
  { value: "zimsec", label: "ZIMSEC" },
  { value: "cambridge", label: "Cambridge" },
]

export function formatExaminingBody(body: string): string {
  return body === "cambridge" ? "Cambridge" : "ZIMSEC"
}
