/**
 * Build script for Vercel deployment.
 *
 * 1. Builds the shared package so @ticketing-platform/shared is available.
 * 2. Uses esbuild to bundle the Express API into a single file (api/index.js).
 * 3. Appends a CJS export fix so Vercel sees `module.exports = handler`
 *    instead of esbuild's default `exports.default = handler`.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Step 1 — Build the shared package (produces packages/shared/dist/)
console.log('[build-vercel] Building shared package...');
execSync('npm run build --workspace=packages/shared', { stdio: 'inherit' });

// Step 2 — Bundle the API handler with esbuild
console.log('[build-vercel] Bundling API with esbuild...');
execSync(
  'npx esbuild apps/api/src/handler.ts --bundle --platform=node --target=node18 --outfile=api/index.js --external:bcrypt',
  { stdio: 'inherit' }
);

// Step 3 — Fix CJS exports for Vercel compatibility
// esbuild converts `export default handler` → `exports.default = handler`
// but Vercel expects `module.exports = handler` (the function itself)
console.log('[build-vercel] Fixing exports for Vercel...');
const outFile = path.join(__dirname, '..', 'api', 'index.js');
let content = fs.readFileSync(outFile, 'utf8');
content += '\n// Vercel CJS compat: re-export default as module.exports\n';
content += 'if (module.exports && module.exports.default) { module.exports = module.exports.default; }\n';
fs.writeFileSync(outFile, content);

console.log('[build-vercel] Done — api/index.js is ready for deployment.');

