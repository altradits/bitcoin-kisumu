export default function manifest() {
  return {
    name: 'Bitcoin Kisumu',
    short_name: 'BTC Kisumu',
    description: 'Free, open-source Bitcoin education for Kisumu, Kenya.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0a1931',
    icons: [{ src: '/logo-mark.svg', sizes: 'any', type: 'image/svg+xml' }]
  };
}
