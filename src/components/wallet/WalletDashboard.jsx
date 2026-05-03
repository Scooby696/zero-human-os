import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Wallet,
  CreditCard,
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

const SUPPORTED_CURRENCIES = [
  { code: 'usd', name: 'US Dollar', symbol: '$', color: 'text-blue-400' },
  { code: 'eur', name: 'Euro', symbol: '€', color: 'text-green-400' },
  { code: 'gbp', name: 'British Pound', symbol: '£', color: 'text-amber-400' },
];

export default function WalletDashboard() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddress, setShowAddress] = useState(false);
  const [transferModal, setTransferModal] = useState(false);
  const [chargeData, setChargeData] = useState({
    amount: '',
    currency: 'usd',
    description: '',
  });
  const [charging, setCharging] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Fetch or create wallet
        const res = await base44.functions.invoke('stripeWallet', {
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
      const res = await base44.functions.invoke('stripeWallet', {
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
      const res = await base44.functions.invoke('stripeWallet', {
        action: 'getTransactions',
      });
      setTransactions(res.data.transactions);
    } catch (error) {
      console.error('Failed to load transactions');
    }
  };

  const handleCharge = async () => {
    if (!chargeData.amount || !chargeData.description) {
      toast.error('Please fill in all fields');
      return;
    }

    setCharging(true);
    try {
      const res = await base44.functions.invoke('stripeWallet', {
        action: 'charge',
        amount: parseFloat(chargeData.amount),
        currency: chargeData.currency,
        description: chargeData.description,
      });

      toast.success(`Charge successful: ${res.data.transaction.amount} ${res.data.transaction.currency.toUpperCase()}`);
      setTransferModal(false);
      setChargeData({ amount: '', currency: 'usd', description: '' });
      await loadTransactions();
    } catch (error) {
      toast.error(`Charge failed: ${error.message}`);
    } finally {
      setCharging(false);
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
                <h2 className="text-xl font-bold text-foreground">Billing Wallet</h2>
                <p className="text-sm text-muted-foreground">Stripe payments & stablecoin billing</p>
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

          {/* Balance */}
          <div className="p-4 rounded-lg bg-background/50 border border-border/30 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Account Balance
            </p>
            <p className="text-3xl font-bold text-primary">
              {(wallet.balance / 100).toFixed(2)} {wallet.currency.toUpperCase()}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              onClick={() => setTransferModal(true)}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <CreditCard className="w-4 h-4" />
              Add Funds
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                copyToClipboard(wallet.stripeCustomerId);
              }}
            >
              <Copy className="w-4 h-4" />
              Copy Customer ID
            </Button>
          </div>
        </motion.div>
      )}

      {/* Charge Modal */}
      {transferModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border/50 rounded-2xl p-6 max-w-md w-full space-y-4"
          >
            <h3 className="text-xl font-bold text-foreground">Add Funds</h3>

            {/* Currency Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Currency</label>
              <select
                value={chargeData.currency}
                onChange={(e) =>
                  setChargeData({ ...chargeData, currency: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-background border border-border/50 text-foreground focus:outline-none focus:border-primary/50"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.symbol})
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
                value={chargeData.amount}
                onChange={(e) =>
                  setChargeData({ ...chargeData, amount: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description</label>
              <input
                type="text"
                placeholder="What is this for?"
                value={chargeData.description}
                onChange={(e) =>
                  setChargeData({ ...chargeData, description: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
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
                onClick={handleCharge}
                disabled={charging}
                className="flex-1 gap-2"
              >
                {charging ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Add Funds
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
                tx.status === 'succeeded' ? (
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
                        {tx.amount} {tx.currency.toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tx.description || 'Transaction'} • {new Date(tx.createdDate).toLocaleDateString()}
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