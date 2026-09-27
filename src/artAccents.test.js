import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/*
 * Crisp's red is written straight into components as Tailwind utilities
 * (bg-[#ff3b30], hover:text-[#ff3b30], ...). The art themes recast each of
 * them in src/themes/art-accents.css. A new red utility the recast doesn't
 * know about would show Crisp's red in Surreal, Lantern and Komorebi, so any
 * variant used in a component must have a rule there.
 */
const files = (dir, ext) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path, ext);
    return name.endsWith(ext) && !name.includes('.test.') ? [path] : [];
  });

const src = join(process.cwd(), 'src');
const art = readFileSync(join(src, 'themes', 'art-accents.css'), 'utf8');
const RED = /[a-z-]+(?::[a-z-]+)*-\[[^\]"'`\s]*#ff3b30[^\]"'`\s]*\]/gi;

describe('art accents cover every red utility', () => {
  const uses = files(src, '.jsx').flatMap((file) =>
    [...readFileSync(file, 'utf8').matchAll(RED)].map((m) => ({ file: relative(process.cwd(), file), cls: m[0] }))
  );

  it('finds the red utilities in components', () => {
    expect(uses.length).toBeGreaterThan(0);
  });

  it('has a rule in art-accents.css for each colour variant', () => {
    const missing = [
      ...new Set(
        uses
          .map((u) => u.cls)
          // glows ride on a coloured dot; the dot's rule clears them (checked below)
          .filter((cls) => !cls.startsWith('shadow-'))
          .filter((cls) => !art.includes('.' + cls.replace(/[:[\]#]/g, '\\$&')))
      ),
    ];
    expect(missing).toEqual([]);
  });

  it('only uses a red glow on an element that is also a red dot', () => {
    const lonely = [];
    for (const file of files(src, '.jsx')) {
      const code = readFileSync(file, 'utf8');
      for (const m of code.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g)) {
        const cls = m[1] ?? m[2];
        if (/shadow-\[[^\]]*#ff3b30/.test(cls) && !/(^|\s)bg-\[#ff3b30\]/.test(cls)) {
          lonely.push(`${relative(process.cwd(), file)}: ${cls.slice(0, 60)}`);
        }
      }
    }
    expect(lonely).toEqual([]);
  });
});
