// Helper to resolve asset URLs correctly across local dev, custom domains, and GitHub Pages (subpaths)
export function getAssetUrl(path) {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  // Strip leading ./ or /
  let clean = path.replace(/^(\.\/|\/)+/, '');

  // Optimización automática a formato WebP ultraligero para acelerar la carga (95%+ reducción)
  if (clean.startsWith('imagenes/')) {
    clean = clean.replace(/(\.JPG\.jpeg|\.jpg|\.jpeg|\.png|\.PNG)$/i, '.webp');
  }

  if (typeof window !== 'undefined') {
    const segments = window.location.pathname.split('/').filter(Boolean);
    if (window.location.hostname.includes('github.io') && segments.length > 0) {
      const repo = segments[0];
      // Make idempotent: if already prefixed with repo name, don't prefix again
      if (clean.startsWith(`${repo}/`)) {
        return `/${clean}`;
      }
      return `/${repo}/${clean}`;
    }
  }

  const base = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}${clean}`;
}
