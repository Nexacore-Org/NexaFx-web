// Guards against navigation config drifting from the actual app routes.
// Every `href` in lib/navigation.ts must resolve to a page under app/.
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const navigationSource = readFileSync(join(root, 'lib', 'navigation.ts'), 'utf8')

const hrefs = [...navigationSource.matchAll(/href:\s*'([^']+)'/g)].map((match) => match[1])

if (hrefs.length === 0) {
  console.error('check-nav-routes: no nav hrefs found in lib/navigation.ts')
  process.exit(1)
}

// Collect every route the App Router exposes by walking app/ for page files.
const appDir = join(root, 'app')
const routes = new Set()

function walk(dir, segments) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      // Route groups like (dashboard) don't affect the URL.
      const isGroup = entry.name.startsWith('(') && entry.name.endsWith(')')
      walk(join(dir, entry.name), isGroup ? segments : [...segments, entry.name])
    } else if (/^page\.(t|j)sx?$/.test(entry.name)) {
      routes.add('/' + segments.join('/'))
    }
  }
}

walk(appDir, [])

const missing = hrefs.filter((href) => !routes.has(href))

if (missing.length > 0) {
  console.error('check-nav-routes: navigation links without a matching route:')
  for (const href of missing) console.error(`  - ${href}`)
  process.exit(1)
}

console.log(`check-nav-routes: ${hrefs.length} navigation link(s) verified.`)
