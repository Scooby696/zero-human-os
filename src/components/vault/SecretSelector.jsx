import React, { useState } from "react";
import { Zap, ChevronDown } from "lucide-react";
import { secretVault } from "../../utils/secretVault";

export default function SecretSelector({ value, onChange, label = "API Key / Secret" }) {
  const [isOpen, setIsOpen] = useState(false);
  const secrets = secretVault.getSecrets();

  const selectedSecret = value && value.startsWith("{{secret:")
    ? secrets.find((s) => value.includes(s.id))
    : null;

  return (
    <div className="relative">
      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{label}</label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground hover:border-border transition-colors text-left"
        >
          <div className="flex items-center gap-2 flex-1">
            <Zap className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">
              {selectedSecret ? selectedSecret.name : "Select a secret..."}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 z-10 bg-card border border-border/50 rounded-lg shadow-lg overflow-hidden">
            <div className="max-h-48 overflow-y-auto">
              {secrets.length === 0 ? (
                <div className="p-3 text-xs text-muted-foreground text-center">
                  No secrets created. Create one in the vault.
                </div>
              ) : (
                secrets.map((secret) => (
                  <button
                    key={secret.id}
                    onClick={() => {
                      onChange(secretVault.generateSecretReference(secret.id));
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-secondary/50 border-b border-border/20 last:border-b-0 transition-colors"
                  >
                    <p className="font-medium">{secret.name}</p>
                    <p className="text-muted-foreground/70 text-[10px]">{secret.type}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {selectedSecret && (
        <p className="text-[10px] text-muted-foreground/70 mt-1">
          Using secret: <span className="font-mono">{selectedSecret.name}</span>
        </p>
      )}
    </div>
  );
}