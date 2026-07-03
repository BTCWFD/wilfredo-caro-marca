// --- Payment Gateways Logic ---
const getTranslation = (key, fallback) => {
  const lang = document.documentElement.lang || 'en';
  if (window.translations && window.translations[lang] && window.translations[lang][key]) {
    return window.translations[lang][key];
  }
  return fallback;
};

document.querySelectorAll('.pay-wompi-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const amount = btn.dataset.amount;
    const ref = btn.dataset.ref + '-' + Math.floor(Math.random() * 1000000);
    
    // Check if WidgetCheckout is available (loaded from Wompi script)
    if (typeof WidgetCheckout !== 'undefined') {
      const checkout = new WidgetCheckout({
        currency: 'COP',
        amountInCents: parseInt(amount, 10),
        reference: ref,
        // Sandbox Public Key. Replace with Production Key for real payments.
        publicKey: 'pub_test_Q5yDA9xoKdePzhSGeZaVvwAXmRkdDPGq',
      });
      checkout.open(function (result) {
        const transaction = result.transaction;
        console.log('Transaction result: ', transaction);
        if (transaction.status === 'APPROVED') {
          alert(getTranslation('pay_alert_success', 'Payment approved successfully!'));
        } else {
          alert(getTranslation('pay_alert_failed', 'Payment could not be processed or was cancelled.'));
        }
      });
      window.trackEvent('open_wompi_checkout', { ref: ref });
    } else {
      console.error('Wompi Widget not loaded.');
      alert(getTranslation('pay_alert_error', 'Error loading payment gateway. Please try again later.'));
    }
  });
});

document.querySelectorAll('.pay-bold-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const link = btn.dataset.link;
    window.trackEvent('open_bold_checkout', { link: link });
    window.open(link, '_blank', 'noopener');
  });
});

document.querySelectorAll('.pay-wenia-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    window.trackEvent('open_crypto_checkout');
    if (window.ethereum) {
       // Simple fallback to connect wallet if desired, but here we just alert
       alert(getTranslation('pay_alert_wenia_config', 'Web3 integration for Wenia / USDC payments is in configuration. Contact me via Calendly.'));
    } else {
       alert(getTranslation('pay_alert_install_wallet', 'Please install MetaMask or a Web3 wallet for Crypto (Wenia) payments.'));
    }
  });
});
