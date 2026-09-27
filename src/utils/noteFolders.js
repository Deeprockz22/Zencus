export const BUILT_IN_FOLDERS = [
  { id: 'all', name: 'All Notes' },
  { id: 'quick', name: 'Quick Notes' },
  { id: 'work', name: 'Work' },
  { id: 'personal', name: 'Personal' },
  { id: 'ideas', name: 'Ideas & Drafts' },
  { id: 'archive', name: 'Archive' },
  { id: 'trash', name: 'Recently Deleted' }
];

/**
 * Builds a new custom folder, or explains why it can't be made.
 * Names are unique (case-insensitive, built-ins included) and ids never collide.
 */
export function createCustomFolder(rawName, customFolders = []) {
  const name = String(rawName || '').trim();
  if (!name) return { error: 'Give the folder a name.' };

  const taken = [...BUILT_IN_FOLDERS, ...customFolders].map((f) => String(f.name ?? f).toLowerCase());
  if (taken.includes(name.toLowerCase())) return { error: `"${name}" already exists.` };

  const ids = new Set([...BUILT_IN_FOLDERS, ...customFolders].map((f) => (typeof f === 'object' ? f.id : String(f))));
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'folder';
  let id = base;
  for (let n = 2; ids.has(id); n++) id = `${base}-${n}`;
  return { folder: { id, name } };
}
