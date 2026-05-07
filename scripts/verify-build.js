import fs from 'fs-extra'

const manifestPath = 'dist/.build-manifest.json'
if (!(await fs.pathExists(manifestPath))) {
  console.error(`Build manifest not found: ${manifestPath}`)
  process.exit(1)
}
const manifest = await fs.readJson(manifestPath)
const expected = process.env.EXPECTED_ENV
if (!expected) {
  console.error('EXPECTED_ENV not set')
  process.exit(1)
}
if (manifest.buildEnv !== expected) {
  console.error(`Build env mismatch: expected ${expected}, got ${manifest.buildEnv}`)
  process.exit(1)
}
console.log(`✓ Build env verified: ${manifest.buildEnv} (${manifest.siteUrl})`)

// CSS 検証
const cssPath = 'dist/assets/css/main.css'
if (!(await fs.pathExists(cssPath))) {
  console.error(`CSS not found: ${cssPath}`)
  process.exit(1)
}

const cssFiles = await fs.readdir('dist/assets/css').catch(() => [])
const extraCss = cssFiles.filter((f) => f.endsWith('.css') && f !== 'main.css')
if (extraCss.length > 0) {
  console.error(`Hashed CSS files detected (minify/hash settings broken): ${extraCss.join(', ')}`)
  process.exit(1)
}

const cssContent = await fs.readFile(cssPath, 'utf8')
const lineCount = cssContent.split('\n').length
if (lineCount < 5) {
  console.error(`CSS appears minified (${lineCount} lines). cssMinify must be false.`)
  process.exit(1)
}
console.log(`✓ CSS verified: main.css (${lineCount} lines, not minified)`)
