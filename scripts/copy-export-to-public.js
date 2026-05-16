const { rmSync, cpSync, existsSync } = require('fs')
const { resolve } = require('path')

const outDir = resolve(__dirname, '..', 'frontend', 'out')
const nextExportDir = resolve(__dirname, '..', 'frontend', '.next', 'export')
const publicDir = resolve(__dirname, '..', 'public')

let srcDir = null
if (existsSync(outDir)) {
  srcDir = outDir
} else if (existsSync(nextExportDir)) {
  srcDir = nextExportDir
}

if (!srcDir) {
  console.error(`Export directory not found. Checked: ${outDir} and ${nextExportDir}`)
  process.exit(1)
}

rmSync(publicDir, { recursive: true, force: true })
cpSync(srcDir, publicDir, { recursive: true })
console.log(`Copied exported site from ${srcDir} to ${publicDir}`)
