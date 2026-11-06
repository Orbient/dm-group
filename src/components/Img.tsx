import type { CSSProperties } from 'react'

type Props = {
  name: string
  widths: number[]
  alt: string
  sizes?: string
  className?: string
  style?: CSSProperties
  eager?: boolean
}

/** AVIF first, WebP fallback, responsive widths produced by tools/optimize.mjs */
export default function Img({ name, widths, alt, sizes = '100vw', className, style, eager }: Props) {
  const base = import.meta.env.BASE_URL
  const set = (ext: string) => widths.map((w) => `${base}img/${name}-${w}.${ext} ${w}w`).join(', ')
  const fallback = `${base}img/${name}-${widths[Math.min(1, widths.length - 1)]}.webp`
  return (
    <picture>
      <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
      <img
        src={fallback}
        alt={alt}
        className={className}
        style={style}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'auto'}
        decoding="async"
        draggable={false}
      />
    </picture>
  )
}
