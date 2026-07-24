import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { THUMBNAIL_BLUR_DATA_URL } from "@/lib/utils"

const formatUsd = (amount: number) =>
  new Intl.NumberFormat("en-ZW", { style: "currency", currency: "USD" }).format(amount)

type CourseCardProps = {
  id: string
  title: string
  description: string | null | undefined
  price: number | null | undefined
  instructorName?: string | null
  thumbnail?: string | null
  href?: string
  actionLabel?: string
  className?: string
  imageSizes?: string
  titleHoverClassName?: string
}

export function CourseCard({
  id,
  title,
  description,
  price,
  instructorName,
  thumbnail,
  href,
  actionLabel = "View",
  className,
  imageSizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  titleHoverClassName = "group-hover:text-primary",
}: CourseCardProps) {
  const courseHref = href ?? `/course/${id}`
  const displayPrice = typeof price === "number" ? formatUsd(price) : "Free"

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md ${className ?? ""}`}
    >
      <Link href={courseHref} className="block">
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={thumbnail || "/placeholder.jpg"}
            alt={title}
            fill
            sizes={imageSizes}
            placeholder="blur"
            blurDataURL={THUMBNAIL_BLUR_DATA_URL}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={courseHref}>
          <h3 className={`line-clamp-2 font-semibold text-foreground transition-colors ${titleHoverClassName}`}>
            {title}
          </h3>
        </Link>

        <p className="mt-1.5 min-h-5 text-sm text-muted-foreground">
          {instructorName ? `by ${instructorName}` : "Instructor TBA"}
        </p>

        <p className="mt-3 line-clamp-3 min-h-[3.75rem] text-sm text-muted-foreground">
          {description || "No description available yet."}
        </p>

        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-lg font-semibold text-foreground">{displayPrice}</span>
            <Button asChild size="sm" variant="default">
              <Link href={courseHref}>{actionLabel}</Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
