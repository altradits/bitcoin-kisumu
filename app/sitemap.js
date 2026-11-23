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
  '/pilot',
  '/partners',
  '/merch',
  '/sw',
  '/verify',
  '/resources/field-kit',
  '/resources',
  '/executive-summary',
  '/stories',
  '/contact'
];

export default function sitemap() {
  return ROUTES.map((route) => ({
    url: `${BASE_URL}${route === '/' ? '' : route}`,
    lastModified: new Date()
  }));
}
