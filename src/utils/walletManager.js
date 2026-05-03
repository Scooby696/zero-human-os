export function createWalletManager() {
  const storageKey = "agent_wallets";

  return {
    createWallet(name, initialBalance = 0, role = "payor") {
      const wallets = this.listWallets();
      const wallet = {
        id: `wallet_${Date.now()}`,
        name,
        role, // "payor" or "payee"
        balance: initialBalance,
        totalFunded: initialBalance,
        totalSpent: 0,
        totalEarned: 0,
        transactions: [],
        createdAt: Date.now(),
        linkedAgents: [],
      };
      wallets.push(wallet);
      localStorage.setItem(storageKey, JSON.stringify(wallets));
      return wallet;
    },

    listWallets() {
      const data = localStorage.getItem(storageKey);
      return data ? JSON.parse(data) : [];
    },

    getWallet(walletId) {
      return this.listWallets().find((w) => w.id === walletId);
    },

    updateBalance(walletId, amount, type = "spend", description = "") {
      const wallets = this.listWallets();
      const wallet = wallets.find((w) => w.id === walletId);
      if (!wallet) return null;

      const transaction = {
        id: `tx_${Date.now()}`,
        timestamp: Date.now(),
        type,
        amount,
        description,
        balanceBefore: wallet.balance,
      };

      if (type === "spend") {
        wallet.balance -= amount;
        wallet.totalSpent += amount;
      } else if (type === "fund") {
        wallet.balance += amount;
        wallet.totalFunded += amount;
      } else if (type === "earn") {
        wallet.balance += amount;
        wallet.totalEarned += amount;
      }

      transaction.balanceAfter = wallet.balance;
      wallet.transactions.push(transaction);

      localStorage.setItem(storageKey, JSON.stringify(wallets));
      return wallet;
    },

    linkAgentToWallet(walletId, agentId) {
      const wallets = this.listWallets();
      const wallet = wallets.find((w) => w.id === walletId);
      if (wallet && !wallet.linkedAgents.includes(agentId)) {
        wallet.linkedAgents.push(agentId);
        localStorage.setItem(storageKey, JSON.stringify(wallets));
      }
      return wallet;
    },

    deleteWallet(walletId) {
      const wallets = this.listWallets();
      const filtered = wallets.filter((w) => w.id !== walletId);
      localStorage.setItem(storageKey, JSON.stringify(filtered));
    },
  };
}