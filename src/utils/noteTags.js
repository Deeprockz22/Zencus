// Plain text of a note's HTML body: tags, attributes and entities never count as words.
// Every tag becomes a space first, so words in neighbouring blocks (</p><li>) never merge.
export function htmlToText(html = '') {
  if (!html) return '';
  const spaced = String(html).replace(/<[^>]*>/g, ' ');
  if (typeof DOMParser === 'undefined') return spaced;
  return new DOMParser().parseFromString(spaced, 'text/html').body.textContent || '';
}

// #tags in a note's title and visible text. A tag starts with a letter, so colour codes in
// inline styles (#ff3b30 is inside an attribute) and entities like &#39; never become tags.
export function extractTags(title = '', html = '') {
  const text = `${title || ''} ${htmlToText(html)}`;
  const tags = [];
  for (const m of text.matchAll(/(?:^|[^\w&])(#[A-Za-z][\w-]*)/g)) {
    if (!tags.includes(m[1])) tags.push(m[1]);
  }
  return tags;
}
