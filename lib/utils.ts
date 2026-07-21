import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Shared blur-up placeholder for course thumbnails loaded from a dynamic
// string `src` (next/image can't auto-generate blurDataURL for those, only
// for statically imported images). A 4x4 mid-gray PNG matching the card
// background, so it costs ~90 bytes instead of a network round trip.
export const THUMBNAIL_BLUR_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAEUlEQVR4nGO4dOkKHDEQxwEAA1AngW9/xHgAAAAASUVORK5CYII='
