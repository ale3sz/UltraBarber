// Helper to resolve asset URLs correctly across local dev, custom domains, and GitHub Pages (subpaths)
export function getAssetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }

  const clean = path.replace(/^\/+/, '');

  if (typeof window !== 'undefined') {
    // If hosted on GitHub Pages (e.g. username.github.io/repo-name)
    const segments = window.location.pathname.split('/').filter(Boolean);
    if (window.location.hostname.includes('github.io') && segments.length > 0) {
      const repo = segments[0];
      return `/${repo}/${clean}`;
    }
  }

  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}${clean}`;
}
