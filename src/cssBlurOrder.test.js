import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/*
 * The CSS minifier keeps only the LAST of a `-webkit-backdrop-filter` /
 * `backdrop-filter` pair in one rule. If the prefixed one comes last, Chrome
 * gets no blur in the built app (it only looks right in dev). So in every
 * rule that has both, the prefixed declaration must come first.
 */
const cssFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return cssFiles(path);
    return name.endsWith('.css') ? [path] : [];
  });

describe('backdrop-filter order', () => {
  it('lists -webkit-backdrop-filter before backdrop-filter in every rule', () => {
    const root = join(process.cwd(), 'src');
    const offenders = [];
    for (const file of cssFiles(root)) {
      const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      // innermost declaration blocks: text between a { and the next }
      for (const match of css.matchAll(/\{([^{}]*)\}/g)) {
        const block = match[1];
        const plain = block.search(/(^|[;\s])backdrop-filter\s*:/);
        const prefixed = block.search(/-webkit-backdrop-filter\s*:/);
        if (plain !== -1 && prefixed !== -1 && prefixed > plain) {
          const line = css.slice(0, match.index).split('\n').length;
          offenders.push(`${relative(process.cwd(), file)}:${line}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
