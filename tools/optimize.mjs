// Converts source photos into AVIF + WebP at several widths for <picture> srcset.
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const SRC = '../sources'
const OUT = 'public/img'
mkdirSync(OUT, { recursive: true })

const jobs = [
  ['generated/hero.png', 'hero', [960, 1600, 2400]],
  ['generated/finished.png', 'finished', [960, 1600, 2400]],
  ['generated/raw.png', 'raw', [960, 1600, 2400]],
  ['generated/spiral.png', 'spiral', [600, 896]],
  ['generated/steel.png', 'steel', [600, 896]],
  ['generated/glass.png', 'glass', [600, 928]],
  ['generated/exterior.png', 'exterior', [600, 928]],
  ['yandex-photos/p02.jpg', 'real-clad', [600, 960]],
  ['yandex-photos/p11.jpg', 'real-monolith', [600, 960]],
  ['yandex-photos/p05.jpg', 'real-pour', [600, 960]],
]

for (const [src, name, widths] of jobs) {
  for (const w of widths) {
    const img = sharp(`${SRC}/${src}`).resize({ width: w, withoutEnlargement: true })
    await img.clone().avif({ quality: 52, effort: 6 }).toFile(`${OUT}/${name}-${w}.avif`)
    await img.clone().webp({ quality: 74 }).toFile(`${OUT}/${name}-${w}.webp`)
  }
}
await sharp(`${SRC}/generated/hero.png`).resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 80 }).toFile(`${OUT}/og.jpg`)
console.log('done')
