'use client';

import Script from 'next/script';

// Blink's donate button, served from our own copy (see public/vendor/blink/README.md).
export default function BlinkDonate({ username }) {
  const init = () => {
    if (typeof window === 'undefined' || !window.BlinkPayButton) return;
    const box = document.getElementById('blink-pay-button-container');
    if (!box || box.dataset.ready) return;
    box.dataset.ready = '1';
    window.BlinkPayButton.init({
      username,
      containerId: 'blink-pay-button-container',
      themeMode: 'light',
      language: 'en',
      defaultAmount: 1000,
      supportedCurrencies: [
        { code: 'sats', name: 'sats', isCrypto: true },
        { code: 'USD', name: 'USD', isCrypto: false }
      ],
      debug: false
    });
  };
  return (
    <>
      <div id="blink-pay-button-container" style={{ margin: '16px 0' }} />
      <Script src="/vendor/blink/blink-pay-button.js" strategy="afterInteractive" onReady={init} onLoad={init} />
    </>
  );
}
