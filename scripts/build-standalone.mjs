/**
 * Inlines the Vite build into a single HTML file with no external requests.
 *
 * Useful for sharing the module with colleagues, embedding it in an LMS, or
 * opening it straight from disk — the file works with no server at all.
 * Deliberately emits no <html>/<head>/<body> wrapper so the same file can also
 * be dropped into hosts that supply their own document skeleton.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = 'dist';
const OUT = join(DIST, 'from-pathway-to-therapy.html');

const html = await readFile(join(DIST, 'index.html'), 'utf8');
const assets = await readdir(join(DIST, 'assets'));

const jsName = assets.find((name) => name.endsWith('.js'));
const cssName = assets.find((name) => name.endsWith('.css'));
if (!jsName || !cssName) throw new Error('Run `vite build` first.');

const js = await readFile(join(DIST, 'assets', jsName), 'utf8');
const css = await readFile(join(DIST, 'assets', cssName), 'utf8');

const title = html.match(/<title>(.*?)<\/title>/)?.[1] ?? 'From Pathway to Therapy';

const out = `<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>${title}</title>
<style>
${css}
</style>
<div id="root"></div>
<script type="module">
${js.replaceAll('</script', '<\\/script')}
</script>
`;

await writeFile(OUT, out, 'utf8');
console.log(`${OUT} — ${(Buffer.byteLength(out) / 1024).toFixed(0)} kB`);
