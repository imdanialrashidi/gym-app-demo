import type { CSSProperties } from 'react'
import type { PictureSources } from '../lib/media'

interface ResponsivePhotoProps {
  sources: PictureSources
  alt: string
  sizes?: string
  className?: string
  imgClassName?: string
  loading?: 'eager' | 'lazy'
  fetchPriority?: 'high' | 'low' | 'auto'
  style?: CSSProperties
  width?: number
  height?: number
}

export function ResponsivePhoto({
  sources,
  alt,
  sizes = '100vw',
  className,
  imgClassName,
  loading = 'lazy',
  fetchPriority = 'auto',
  style,
  width,
  height,
}: ResponsivePhotoProps) {
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={sources.avif} sizes={sizes} />
      <source type="image/webp" srcSet={sources.webp} sizes={sizes} />
      <img
        src={sources.fallback}
        alt={alt}
        width={width ?? sources.width}
        height={height ?? sources.height}
        className={imgClassName}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        style={style}
      />
    </picture>
  )
}
