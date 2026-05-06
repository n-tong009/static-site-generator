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
