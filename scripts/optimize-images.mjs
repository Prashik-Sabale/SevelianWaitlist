/**
 * Builds responsive AVIF + WebP derivatives from the originals in /assets-src.
 * Run with: npm run images
 *
 * Every source image here comes from the live sevelian.com storefront.
 * Crops are given as fractions of the source (x, y, w, h), so they stay
 * valid if a higher-resolution original replaces a file later.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const SRC = path.resolve('assets-src')
const OUT = path.resolve('public/images')

/** name -> { src, crop?, widths } */
const JOBS = {
  // Hero: art-directed landscape (desktop) and portrait (mobile) crops.
  'hero-wide': { src: 'outfitmen.jpg', widths: [960, 1440, 1920, 2560] },
  'hero-tall': { src: 'outfitmen.jpg', crop: [0.25, 0, 0.42, 1], widths: [480, 768, 1080] },

  // Final statement
  'statement-wide': { src: 'bluesky.jpg', widths: [960, 1440, 1920, 2560] },
  'statement-tall': { src: 'bluesky.jpg', crop: [0.42, 0, 0.36, 1], widths: [480, 768, 1080] },

  // Philosophy: close-up of the striped shirt
  'philosophy-detail': { src: 'outfitmen.jpg', crop: [0.355, 0.3, 0.215, 0.5], widths: [480, 800] },

  // Material story
  'material-comfort': { src: 'category3.jpg', crop: [0, 0, 1, 0.62], widths: [480, 736] },
  'material-design': { src: 'shirtimg7.jpg', crop: [0.18, 0.04, 0.64, 0.6], widths: [400, 634] },
  'material-details': { src: 'bluesky.jpg', crop: [0.53, 0.2, 0.17, 0.32], widths: [400, 640] },

  // Collection preview (primary + hover image)
  'col-linen': { src: 'shirtimg7.jpg', widths: [480, 634] },
  'col-linen-alt': { src: 'shirtimg9.jpg', widths: [480, 634] },
  'col-essentials': { src: 'shirtimg2.jpg', widths: [480, 634] },
  'col-essentials-alt': { src: 'shirtimg4.jpg', widths: [480, 634] },
  'col-classics': { src: 'shirtimg12.jpg', widths: [480, 634] },
  'col-classics-alt': { src: 'shirtimg6.jpg', widths: [480, 634] },
  'col-everyday': { src: 'shirtimg10.jpg', widths: [480, 634] },
  'col-everyday-alt': { src: 'shirtimg8.jpg', widths: [480, 634] },

  // Social gallery (square)
  'social-1': { src: 'category3.jpg', crop: [0, 0.28, 1, 0.667], widths: [400, 640] },
  'social-2': { src: 'shirtimg3.jpg', crop: [0.1, 0.03, 0.8, 0.625], widths: [400, 507] },
  'social-3': { src: 'outfitmen.jpg', crop: [0.27, 0, 0.36, 0.61], widths: [400, 640] },
  'social-4': { src: 'shirtimg5.jpg', crop: [0.1, 0.03, 0.8, 0.625], widths: [400, 507] },
  'social-5': { src: 'bluesky.jpg', crop: [0.44, 0.02, 0.34, 0.58], widths: [400, 640] },
  'social-6': { src: 'shirtimg1.jpg', crop: [0.1, 0.03, 0.8, 0.625], widths: [400, 507] },
}

async function load(src, crop) {
  const file = path.join(SRC, src)
  const img = sharp(file)
  if (!crop) return img
  const { width, height } = await img.metadata()
  const [x, y, w, h] = crop
  return sharp(file).extract({
    left: Math.round(x * width),
    top: Math.round(y * height),
    width: Math.round(w * width),
    height: Math.round(h * height),
  })
}

async function main() {
  await fs.mkdir(OUT, { recursive: true })
  const manifest = {}

  for (const [name, { src, crop, widths }] of Object.entries(JOBS)) {
    const base = await (await load(src, crop)).toBuffer()
    const meta = await sharp(base).metadata()
    const usable = widths.filter((w) => w <= meta.width)
    if (Math.max(...widths) > meta.width && !usable.includes(meta.width)) usable.push(meta.width)

    for (const w of usable) {
      const resized = sharp(base).resize({ width: w })
      await resized.clone().avif({ quality: 52, effort: 5 }).toFile(path.join(OUT, `${name}-${w}.avif`))
      await resized.clone().webp({ quality: 78 }).toFile(path.join(OUT, `${name}-${w}.webp`))
    }
    manifest[name] = { widths: usable, width: meta.width, height: meta.height }
    console.log(`${name.padEnd(20)} ${meta.width}x${meta.height}  -> ${usable.join(', ')}`)
  }

  await fs.writeFile(
    path.resolve('src/data/image-manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n',
  )

  // Brand marks: wordmark in charcoal + ivory, monogram favicons, OG image.
  const ivory = '#F2EBDD'
  const wordmark = path.join(SRC, 'logo-wordmark.png')
  const monogram = path.join(SRC, 'logo-monogram.png')

  await sharp(wordmark).resize({ width: 640 }).png().toFile(path.join(OUT, 'logo-dark.png'))
  await sharp(wordmark).resize({ width: 640 }).negate({ alpha: false })
    .tint(ivory).png().toFile(path.join(OUT, 'logo-light.png'))

  const fav = (size) =>
    sharp(monogram)
      .resize(Math.round(size * 0.86))
      .extend({
        top: Math.round(size * 0.07), bottom: size - Math.round(size * 0.86) - Math.round(size * 0.07),
        left: Math.round(size * 0.07), right: size - Math.round(size * 0.86) - Math.round(size * 0.07),
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .flatten({ background: ivory })
      .png()
  await fav(32).toFile(path.resolve('public/favicon-32.png'))
  await fav(180).toFile(path.resolve('public/apple-touch-icon.png'))
  await fav(512).toFile(path.resolve('public/icon-512.png'))

  const ogLogo = await sharp(wordmark).resize({ width: 560 }).negate({ alpha: false })
    .tint(ivory).png().toBuffer()
  const ogLogoMeta = await sharp(ogLogo).metadata()
  await sharp(path.join(SRC, 'outfitmen.jpg'))
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .modulate({ brightness: 0.78 })
    .composite([{ input: ogLogo, left: Math.round((1200 - 560) / 2), top: Math.round((630 - ogLogoMeta.height) / 2) }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.resolve('public/og-image.jpg'))

  console.log('brand marks, favicons, og-image done')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
