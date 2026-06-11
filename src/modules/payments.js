// --- Payment Gateways Logic ---
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
          alert('¡Pago aprobado con éxito!');
        } else {
          alert('El pago no pudo ser procesado o fue cancelado.');
        }
      });
      window.trackEvent('open_wompi_checkout', { ref: ref });
    } else {
      console.error('Wompi Widget not loaded.');
      alert('Error cargando la pasarela de pagos. Por favor intenta más tarde.');
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
       alert('La integración Web3 para pagos en Wenia / USDC está en configuración. Contáctame por Calendly.');
    } else {
       alert('Por favor instala MetaMask o una billetera Web3 para pagos Cripto (Wenia).');
    }
  });
});
