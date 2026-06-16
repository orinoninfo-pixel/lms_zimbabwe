"use client"

interface VideoPlayerProps {
  title: string
  lessonNumber: number
  videoUrl: string
  onComplete?: () => void
}

export function VideoPlayer({ title, lessonNumber, videoUrl, onComplete }: VideoPlayerProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Lesson {lessonNumber}</p>
          <h3 className="font-medium text-foreground">{title}</h3>
        </div>
      </div>
      <div className="aspect-video rounded-xl overflow-hidden bg-muted">
        <video
          className="h-full w-full"
          src={videoUrl}
          controls
          playsInline
          onEnded={onComplete}
        />
      </div>
    </div>
  )
}
