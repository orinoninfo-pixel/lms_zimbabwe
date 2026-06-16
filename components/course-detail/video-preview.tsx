"use client"

import { useState } from "react"
import { Play, Volume2, VolumeX, Maximize2, Pause } from "lucide-react"

interface VideoPreviewProps {
  thumbnailUrl: string
  duration: string
}

export function VideoPreview({ thumbnailUrl, duration }: VideoPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  return (
    <div className="relative aspect-video bg-muted rounded-xl overflow-hidden shadow-lg">
      {!isPlaying ? (
        <>
          <div 
            className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center"
          >
            <div className="text-center">
              <button
                onClick={() => setIsPlaying(true)}
                className="group flex h-20 w-20 items-center justify-center rounded-full bg-primary-foreground/20 backdrop-blur-sm hover:bg-primary-foreground/30 transition-all hover:scale-105"
                aria-label="Play preview"
              >
                <Play className="h-8 w-8 text-primary-foreground ml-1" />
              </button>
              <p className="mt-4 text-primary-foreground font-medium">Preview this course</p>
            </div>
          </div>
          <div className="absolute bottom-4 right-4 bg-primary/90 text-primary-foreground text-sm font-medium px-2 py-1 rounded">
            {duration}
          </div>
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-primary/90 flex items-center justify-center">
            <div className="text-center text-primary-foreground">
              <div className="animate-pulse">
                <Play className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">Video playing...</p>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(false)}
                  className="text-white hover:text-white/80 transition-colors"
                  aria-label="Pause"
                >
                  <Pause className="h-5 w-5" />
                </button>
                <div className="flex-1 h-1 bg-white/30 rounded-full w-48">
                  <div className="h-full w-1/3 bg-white rounded-full" />
                </div>
                <span className="text-white text-sm">1:23 / {duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white hover:text-white/80 transition-colors"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                <button
                  className="text-white hover:text-white/80 transition-colors"
                  aria-label="Fullscreen"
                >
                  <Maximize2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
