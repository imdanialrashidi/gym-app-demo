import type { ImageKey } from '../demo/data'

const MEDIA_ROOT = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/media`

export function mediaUrl(file: string): string {
  return `${MEDIA_ROOT}/${file}`
}

export function buildSrcSet(name: string, widths: number[], extension: 'avif' | 'webp'): string {
  return widths.map((width) => `${mediaUrl(`${name}-${width}.${extension}`)} ${width}w`).join(', ')
}

export interface PictureSources {
  avif: string
  webp: string
  fallback: string
  width: number
  height: number
}

const HERO_MOBILE_WIDTHS = [640, 960, 1280]
const HERO_WIDE_WIDTHS = [960, 1440, 1920]
const CARD_WIDTHS = [480, 800, 1120, 1600]

export const heroMobile: PictureSources = {
  avif: buildSrcSet('hero-mobile', HERO_MOBILE_WIDTHS, 'avif'),
  webp: buildSrcSet('hero-mobile', HERO_MOBILE_WIDTHS, 'webp'),
  fallback: mediaUrl('hero-mobile-960.webp'),
  width: 1280,
  height: 1600,
}

export const heroWide: PictureSources = {
  avif: buildSrcSet('hero-wide', HERO_WIDE_WIDTHS, 'avif'),
  webp: buildSrcSet('hero-wide', HERO_WIDE_WIDTHS, 'webp'),
  fallback: mediaUrl('hero-wide-1440.webp'),
  width: 1920,
  height: 1080,
}

export function programPicture(name: 'push' | 'pull' | 'legs' | 'promo'): PictureSources {
  return {
    avif: buildSrcSet(name, CARD_WIDTHS, 'avif'),
    webp: buildSrcSet(name, CARD_WIDTHS, 'webp'),
    fallback: mediaUrl(`${name}-800.webp`),
    width: 1120,
    height: 1400,
  }
}

export function exercisePicture(key: ImageKey): PictureSources {
  return {
    avif: mediaUrl(`ex-${key}-840.avif`),
    webp: mediaUrl(`ex-${key}-840.webp`),
    fallback: mediaUrl(`ex-${key}-840.webp`),
    width: 840,
    height: 630,
  }
}

export function gymPicture(): PictureSources {
  return {
    avif: buildSrcSet('ex-gym', [840, 1600], 'avif'),
    webp: buildSrcSet('ex-gym', [840, 1600], 'webp'),
    fallback: mediaUrl('ex-gym-840.webp'),
    width: 1600,
    height: 1200,
  }
}

export function editorialPicture(key: 'deadlift' | 'gym'): PictureSources {
  return {
    avif: buildSrcSet(`ex-${key}`, [840, 1600], 'avif'),
    webp: buildSrcSet(`ex-${key}`, [840, 1600], 'webp'),
    fallback: mediaUrl(`ex-${key}-840.webp`),
    width: 1600,
    height: 1200,
  }
}

export { MEDIA_ROOT }
