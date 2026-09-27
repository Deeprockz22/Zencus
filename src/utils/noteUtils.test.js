import { describe, it, expect } from 'vitest';
import { extractTags } from './noteTags';
import { createCustomFolder } from './noteFolders';

describe('extractTags', () => {
  it('finds real tags in title and text, once each', () => {
    expect(extractTags('Plan #work', '<p>ship it #work #launch-day</p>')).toEqual(['#work', '#launch-day']);
  });

  it('ignores colour codes in markup and HTML entities', () => {
    expect(extractTags('', '<p><span style="color: #ff3b30">red</span> it&#39;s fine</p>')).toEqual([]);
  });

  it('ignores number-only hashes', () => {
    expect(extractTags('', '<p>#1 priority</p>')).toEqual([]);
  });
});

describe('createCustomFolder', () => {
  it('slugs the name into an id', () => {
    expect(createCustomFolder('My Thesis', [])).toEqual({ folder: { id: 'my-thesis', name: 'My Thesis' } });
  });

  it('rejects empty names and names already used, built-ins included', () => {
    expect(createCustomFolder('  ', []).error).toBeTruthy();
    expect(createCustomFolder('work', []).error).toBeTruthy();
    expect(createCustomFolder('Thesis', [{ id: 'thesis', name: 'Thesis' }]).error).toBeTruthy();
  });

  it('never reuses an id', () => {
    expect(createCustomFolder('Ideas', []).folder.id).toBe('ideas-2');
    expect(createCustomFolder('!!!', []).folder.id).toBe('folder');
  });
});
