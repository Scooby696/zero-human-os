import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Wallet,
  Send,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const SUPPORTED_TOKENS = [
  { symbol: 'USDC', name: 'USD Coin', icon: '$', color: 'text-blue-400' },
  { symbol: 'EURC', name: 'Euro Coin', icon: '€', color: 'text-green-400' },
];

const SUPPORTED_NETWORKS = [
  { id: 'polygon', name: 'Polygon', icon: '◆' },
  { id: 'ethereum', name: 'Ethereum', icon: 'Ξ' },
  { id: 'solana', name: 'Solana', icon: '◎' },
];

export default function WalletDashboard() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddress, setShowAddress] = useState(false);
  const [transferModal, setTransferModal] = useState(false);
  const [transferData, setTransferData] = useState({
    token: 'USDC',
    amount: '',
    toAddress: '',
    network: 'polygon',
  });
  const [transferring, setTransferring] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Fetch or create wallet
        const res = await base44.functions.invoke('circleWallet', {
          action: 'getWallet',
          email: currentUser.email,
        });

        if (res.data.wallet) {
          setWallet(res.data.wallet);
          await loadTransactions();
        } else {
          // Create wallet if not found
          await createWallet();
        }
      } catch (error) {
        console.error('Load error:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const createWallet = async () => {
    try {
      const res = await base44.functions.invoke('circleWallet', {
        action: 'createWallet',
        walletType: 'email',
      });
      setWallet(res.data.wallet);
      toast.success('Wallet created successfully');
    } catch (error) {
      toast.error('Failed to create wallet');
    }
  };

  const loadTransactions = async () => {
    try {
      const res = await base44.functions.invoke('circleWallet', {
        action: 'getTransactions',
      });
      setTransactions(res.data.transactions);
    } catch (error) {
      console.error('Failed to load transactions');
    }
  };

  const handleTransfer = async () => {
    if (!transferData.amount || !transferData.toAddress) {
      toast.error('Please fill in all fields');
      return;
    }

    setTransferring(true);
    try {
      const res = await base44.functions.invoke('circleWallet', {
        action: 'transfer',
        token: transferData.token,
        amount: parseFloat(transferData.amount),
        toAddress: transferData.toAddress,
        network: transferData.network,
      });

      toast.success(`Transfer initiated: ${res.data.transaction.amount} ${res.data.transaction.token}`);
      setTransferModal(false);
      setTransferData({ token: 'USDC', amount: '', toAddress: '', network: 'polygon' });
      await loadTransactions();
    } catch (error) {
      toast.error(`Transfer failed: ${error.message}`);
    } finally {
      setTransferring(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading wallet...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Wallet Card */}
      {wallet && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/20">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Multi-Currency Wallet</h2>
                <p className="text-sm text-muted-foreground">Stablecoin transfers powered by Circle</p>
              </div>
            </div>
            <Button
              onClick={async () => {
                await loadTransactions();
                toast.success('Refreshed');
              }}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          {/* Address */}
          <div className="p-4 rounded-xl bg-background/50 border border-border/30 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Wallet Address
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono text-foreground break-all">
                {showAddress ? wallet.walletAddress : `${wallet.walletAddress.substring(0, 10)}...${wallet.walletAddress.substring(wallet.walletAddress.length - 8)}`}
              </code>
              <button
                onClick={() => setShowAddress(!showAddress)}
                className="p-2 hover:bg-secondary/30 rounded-lg transition-colors"
              >
                {showAddress ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              <button
                onClick={() => copyToClipboard(wallet.walletAddress)}
                className="p-2 hover:bg-secondary/30 rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Balances */}
          {wallet.balances && wallet.balances.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SUPPORTED_TOKENS.map((token) => {
                const balance = wallet.balances.find(
                  (b) => b.currency === token.symbol
                );
                return (
                  <div
                    key={token.symbol}
                    className="p-4 rounded-lg bg-background/50 border border-border/30 space-y-2"
                  >
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                      {token.name}
                    </p>
                    <p className={`text-2xl font-bold ${token.color}`}>
                      {balance ? balance.amount : '0.00'} {token.symbol}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              onClick={() => setTransferModal(true)}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
              Send Stablecoin
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                copyToClipboard(wallet.walletAddress);
              }}
            >
              <Plus className="w-4 h-4" />
              Receive Funds
            </Button>
          </div>
        </motion.div>
      )}

      {/* Transfer Modal */}
      {transferModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border/50 rounded-2xl p-6 max-w-md w-full space-y-4"
          >
            <h3 className="text-xl font-bold text-foreground">Send Stablecoin</h3>

            {/* Token Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Token</label>
              <select
                value={transferData.token}
                onChange={(e) =>
                  setTransferData({ ...transferData, token: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-background border border-border/50 text-foreground focus:outline-none focus:border-primary/50"
              >
                {SUPPORTED_TOKENS.map((t) => (
                  <option key={t.symbol} value={t.symbol}>
                    {t.name} ({t.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Amount</label>
              <input
                type="number"
                placeholder="0.00"
                value={transferData.amount}
                onChange={(e) =>
                  setTransferData({ ...transferData, amount: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
              />
            </div>

            {/* Network */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Network</label>
              <select
                value={transferData.network}
                onChange={(e) =>
                  setTransferData({ ...transferData, network: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-background border border-border/50 text-foreground focus:outline-none focus:border-primary/50"
              >
                {SUPPORTED_NETWORKS.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Recipient Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Recipient Address
              </label>
              <input
                type="text"
                placeholder="0x..."
                value={transferData.toAddress}
                onChange={(e) =>
                  setTransferData({ ...transferData, toAddress: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 font-mono text-sm"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => setTransferModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleTransfer}
                disabled={transferring}
                className="flex-1 gap-2"
              >
                {transferring ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Transaction History */}
      {transactions && transactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-bold text-foreground">Transaction History</h3>
          <div className="space-y-2">
            {transactions.map((tx) => {
              const statusIcon =
                tx.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : tx.status === 'failed' ? (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                ) : (
                  <Clock className="w-5 h-5 text-amber-400" />
                );

              return (
                <div
                  key={tx.id}
                  className="p-4 rounded-lg bg-card border border-border/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {statusIcon}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">
                        {tx.amount} {tx.token}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tx.network} • {new Date(tx.createdDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}