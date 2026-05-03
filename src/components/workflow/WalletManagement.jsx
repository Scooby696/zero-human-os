import React, { useState } from "react";
import { X, Plus, Trash2, Wallet, TrendingUp, DollarSign } from "lucide-react";
import { createWalletManager } from "../../utils/walletManager";
import { analyzePaidAgentViability } from "../../utils/costAnalyzer";

export default function WalletManagement({ isOpen, onClose, agents = [] }) {
  const walletManager = React.useRef(createWalletManager()).current;
  const [wallets, setWallets] = useState(walletManager.listWallets());
  const [newWalletName, setNewWalletName] = useState("");
  const [newWalletBalance, setNewWalletBalance] = useState("");
  const [newWalletRole, setNewWalletRole] = useState("payor");
  const [expandedWallet, setExpandedWallet] = useState(null);
  const [fundAmount, setFundAmount] = useState("");
  const [fundWalletId, setFundWalletId] = useState(null);

  const handleCreateWallet = () => {
    if (newWalletName.trim()) {
      const wallet = walletManager.createWallet(
        newWalletName,
        parseFloat(newWalletBalance) || 0,
        newWalletRole
      );
      setWallets(walletManager.listWallets());
      setNewWalletName("");
      setNewWalletBalance("");
      setNewWalletRole("payor");
    }
  };

  const handleFundWallet = (walletId) => {
    if (fundAmount && parseFloat(fundAmount) > 0) {
      walletManager.updateBalance(walletId, parseFloat(fundAmount), "fund", "Manual funding");
      setWallets(walletManager.listWallets());
      setFundAmount("");
      setFundWalletId(null);
    }
  };

  const handleDeleteWallet = (walletId) => {
    walletManager.deleteWallet(walletId);
    setWallets(walletManager.listWallets());
    setExpandedWallet(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] max-w-[90vw] bg-card border border-border/50 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-secondary/20 shrink-0">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Wallet Management</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Create wallet section */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-3">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Create New Wallet
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={newWalletName}
                onChange={(e) => setNewWalletName(e.target.value)}
                placeholder="Wallet name (e.g., Data Processing)"
                className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={newWalletBalance}
                  onChange={(e) => setNewWalletBalance(e.target.value)}
                  placeholder="Initial balance"
                  className="bg-background border border-border/50 rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
                />
                <select
                  value={newWalletRole}
                  onChange={(e) => setNewWalletRole(e.target.value)}
                  className="bg-background border border-border/50 rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                >
                  <option value="payor">Payor (Spend)</option>
                  <option value="payee">Payee (Earn)</option>
                </select>
              </div>
              <button
                onClick={handleCreateWallet}
                disabled={!newWalletName.trim()}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                <Plus className="w-3 h-3" />
                Create Wallet
              </button>
            </div>
          </div>

          {/* Wallets list */}
          <div className="border-t border-border/30 pt-3 space-y-2">
            {wallets.length === 0 ? (
              <p className="text-xs text-muted-foreground/50 text-center py-4">No wallets created yet</p>
            ) : (
              wallets.map((wallet) => {
                const agentList = agents.filter((a) =>
                  wallet.linkedAgents?.includes(a.id)
                );
                const analysis = analyzePaidAgentViability(wallet.balance, agentList, 1);

                return (
                  <div key={wallet.id} className="rounded-lg bg-background/60 border border-border/30 overflow-hidden">
                    {/* Wallet header */}
                    <button
                      onClick={() =>
                        setExpandedWallet(expandedWallet === wallet.id ? null : wallet.id)
                      }
                      className="w-full text-left p-4 hover:bg-background/80 transition-colors flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-foreground">{wallet.name}</h3>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {wallet.role}
                          </span>
                          {!analysis.isViable && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-400/10 text-red-400">
                              ⚠ Low funds
                            </span>
                          )}
                        </div>
                        <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground">
                          <span>${wallet.balance.toFixed(2)}</span>
                          <span>Spent: ${wallet.totalSpent.toFixed(2)}</span>
                          <span>Earned: ${wallet.totalEarned.toFixed(2)}</span>
                        </div>
                      </div>
                      <span className={expandedWallet === wallet.id ? "rotate-180" : ""}>
                        ▼
                      </span>
                    </button>

                    {/* Expanded details */}
                    {expandedWallet === wallet.id && (
                      <div className="px-4 py-3 bg-background/40 border-t border-border/20 space-y-3">
                        {/* Funding section */}
                        {fundWalletId === wallet.id ? (
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={fundAmount}
                              onChange={(e) => setFundAmount(e.target.value)}
                              placeholder="Amount to add"
                              className="flex-1 bg-card border border-border/50 rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:border-primary/50"
                            />
                            <button
                              onClick={() => handleFundWallet(wallet.id)}
                              className="px-3 py-1 bg-green-400/20 border border-green-400/30 text-green-400 text-xs font-medium rounded hover:bg-green-400/30"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => setFundWalletId(null)}
                              className="px-3 py-1 bg-secondary border border-border/30 text-foreground text-xs font-medium rounded hover:bg-secondary/80"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setFundWalletId(wallet.id)}
                            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-secondary/50 border border-border/40 text-foreground text-xs font-medium hover:bg-secondary transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            Add Funds
                          </button>
                        )}

                        {/* Cost analysis */}
                        {agentList.length > 0 && (
                          <div className="p-3 rounded-lg bg-card border border-border/30 space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground">Cost Analysis</p>
                            <div className="space-y-1 text-[10px]">
                              <div className="flex justify-between">
                                <span>Status:</span>
                                <span className={analysis.isViable ? "text-green-400" : "text-red-400"}>
                                  {analysis.recommendation}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Cost per call:</span>
                                <span className="font-mono">${analysis.totalCostPerCall.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Cost per 30 days:</span>
                                <span className="font-mono">${analysis.totalCostPer30Days.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Days of funding:</span>
                                <span className="font-mono">
                                  {analysis.daysOfFunding === Infinity ? "∞" : analysis.daysOfFunding}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteWallet(wallet.id)}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-xs font-medium hover:bg-red-400/20"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete Wallet
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border/40 bg-secondary/10 shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg border border-border/50 text-foreground text-xs font-medium hover:bg-secondary/50"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}