const BASE_URL = 'https://bitcoin-kisumu.vercel.app';

const ROUTES = [
  '/',
  '/about',
  '/programs',
  '/guide',
  '/merchants',
  '/events',
  '/team',
  '/donate',
  '/treasury',
  '/resources',
  '/executive-summary',
  '/contact'
];

export default function sitemap() {
  return ROUTES.map((route) => ({
    url: `${BASE_URL}${route === '/' ? '' : route}`,
    lastModified: new Date()
  }));
}
