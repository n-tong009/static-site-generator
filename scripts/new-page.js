import fs from 'fs-extra'
import path from 'path'

const name = process.argv[2]

if (!name) {
  console.error('Usage: pnpm new-page <name>')
  process.exit(1)
}

if (!/^[a-z][a-z0-9-]*$/.test(name)) {
  console.error(`Invalid page name: "${name}". Use lowercase letters, numbers, and hyphens only (must start with a letter).`)
  process.exit(1)
}

const ejsPath = `src/pages/${name}.ejs`
const scssPath = `src/scss/pages/_${name}.scss`
const mainScssPath = 'src/scss/main.scss'

if (await fs.pathExists(ejsPath)) {
  console.error(`Already exists: ${ejsPath}`)
  process.exit(1)
}
if (await fs.pathExists(scssPath)) {
  console.error(`Already exists: ${scssPath}`)
  process.exit(1)
}

await fs.outputFile(
  ejsPath,
  `---
title: '${name}'
description: ''
layout: 'DefaultLayout'
pageId: '${name}'
---
`
)

await fs.outputFile(
  scssPath,
  `@use 'sass:math';
@use '../common/config' as *;

.page-${name} {
  @include RESPONSIVE('PC', $MIN_WIDTH) {
  }
  @include RESPONSIVE('SP', $MIN_WIDTH) {
  }
}
`
)

const mainScss = await fs.readFile(mainScssPath, 'utf8')
const useStatement = `@use 'pages/${name}';`
if (mainScss.includes(useStatement)) {
  console.log(`Already in main.scss: ${useStatement} (skipped)`)
} else {
  const lines = mainScss.split('\n')
  let lastPagesIndex = -1
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("@use 'pages/")) {
      lastPagesIndex = i
    }
  }
  if (lastPagesIndex >= 0) {
    lines.splice(lastPagesIndex + 1, 0, useStatement)
  } else {
    lines.push(useStatement)
  }
  await fs.writeFile(mainScssPath, lines.join('\n'))
}

console.log(`✓ Created: ${ejsPath}`)
console.log(`✓ Created: ${scssPath}`)
console.log(`✓ Updated: ${mainScssPath} (added ${useStatement})`)
