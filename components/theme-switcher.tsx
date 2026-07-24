'use client'

import { Check, Moon, Palette } from 'lucide-react'
import { useTheme } from 'next-themes'
import * as React from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type AppTheme = 'blue' | 'green' | 'dark'

const themes: Array<{ value: AppTheme; label: string; swatchClass: string; description: string }> = [
  {
    value: 'blue',
    label: 'Blue',
    swatchClass: 'bg-[oklch(0.41_0.13_257)] border-[oklch(0.36_0.11_257)]',
    description: 'Default educational palette',
  },
  {
    value: 'green',
    label: 'Green',
    swatchClass: 'bg-[oklch(0.53_0.14_156)] border-[oklch(0.47_0.12_156)]',
    description: 'Corporate emerald palette',
  },
  {
    value: 'dark',
    label: 'Dark',
    swatchClass: 'bg-[oklch(0.26_0.02_258)] border-[oklch(0.37_0.02_258)]',
    description: 'Enterprise dark palette',
  },
]

const ThemeButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> & { label: string }
>(function ThemeButton({ className, label, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={className}
      {...props}
    >
      <Palette className="h-4 w-4" />
      <span className="hidden sm:inline">Theme</span>
    </button>
  )
})

export function ThemeSwitcher({ mobile = false }: { mobile?: boolean }) {
  const { theme, setTheme } = useTheme()
  const activeTheme = (theme as AppTheme | undefined) ?? 'blue'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {mobile ? (
          <ThemeButton
            label="Select theme"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground/85 transition-colors hover:bg-muted hover:text-foreground"
          />
        ) : (
          <ThemeButton
            label="Select theme"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground/85 transition-colors hover:bg-muted hover:text-foreground"
          />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={mobile ? 'center' : 'end'} className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Moon className="h-4 w-4" />
          Choose theme
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themes.map((item) => {
          const selected = item.value === activeTheme
          return (
            <DropdownMenuItem
              key={item.value}
              onClick={() => setTheme(item.value)}
              className="flex items-center justify-between gap-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  aria-hidden="true"
                  className={`inline-block h-3 w-3 shrink-0 rounded-full border ${item.swatchClass}`}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{item.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
              {selected ? <Check className="h-4 w-4 text-primary" /> : null}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
