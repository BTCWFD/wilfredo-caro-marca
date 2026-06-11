// --- Web3: Connect Wallet (injected EIP-1193 provider, no external deps/RPC) ---
const walletBtn = document.getElementById('wallet-connect');
const walletLabel = document.getElementById('wallet-label');
if (walletBtn && walletLabel) {
  const shortAddr = (a) => `${a.slice(0, 6)}…${a.slice(-4)}`;
  const setConnected = (addr) => {
    walletLabel.textContent = shortAddr(addr);
    walletBtn.classList.add('connected');
    walletBtn.title = addr;
    
    // Simulated VIP Client Portal Logic
    let vipPanel = document.getElementById('vip-dashboard');
    if (!vipPanel) {
      vipPanel = document.createElement('div');
      vipPanel.id = 'vip-dashboard';
      vipPanel.className = 'glass-panel';
      vipPanel.style.position = 'fixed';
      vipPanel.style.top = '100px';
      vipPanel.style.left = '50%';
      vipPanel.style.transform = 'translateX(-50%)';
      vipPanel.style.zIndex = '9999';
      vipPanel.style.padding = '2rem';
      vipPanel.style.textAlign = 'center';
      vipPanel.style.border = '1px solid var(--accent-primary)';
      document.body.appendChild(vipPanel);
    }
    vipPanel.innerHTML = `
      <h3 class="text-gradient" style="margin-bottom: 1rem;">Client VIP Portal</h3>
      <p style="margin-bottom: 0.5rem;">Connected: <strong>${shortAddr(addr)}</strong></p>
      <p style="margin-bottom: 1.5rem; opacity: 0.8;">Your AI Bots & Web3 Contracts are fully operational.</p>
      <button class="btn btn-primary" onclick="document.getElementById('vip-dashboard').remove()">Close Dashboard</button>
    `;
  };
  const setDisconnected = () => {
    walletLabel.textContent = 'Connect Wallet';
    walletBtn.classList.remove('connected');
    walletBtn.title = 'Connect Wallet';
  };

  if (window.ethereum) {
    // Restore session silently if already authorized
    window.ethereum.request({ method: 'eth_accounts' })
      .then((accs) => { if (accs && accs[0]) setConnected(accs[0]); })
      .catch(() => {});
    if (typeof window.ethereum.on === 'function') {
      window.ethereum.on('accountsChanged', (accs) => {
        if (accs && accs[0]) setConnected(accs[0]);
        else setDisconnected();
      });
    }
  }

  walletBtn.addEventListener('click', async () => {
    if (!window.ethereum) {
      window.open('https://metamask.io/download/', '_blank', 'noopener');
      return;
    }
    try {
      const accs = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accs && accs[0]) {
        setConnected(accs[0]);
        window.trackEvent('wallet_connect');
      }
    } catch (err) {
      console.warn('Wallet connection rejected or failed.', err);
    }
  });
}

