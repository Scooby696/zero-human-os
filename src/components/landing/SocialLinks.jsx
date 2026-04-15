import React from "react";
import { MessageCircle } from "lucide-react";

export default function SocialLinks({ size = "md" }) {
  const sizeClasses = size === "lg" ? "w-6 h-6" : "w-5 h-5";
  const padClasses = size === "lg" ? "p-3" : "p-2.5";

  return (
    <div className="flex items-center gap-3">
      <a
        href="https://x.com/zerohuman87307"
        target="_blank"
        rel="noopener noreferrer"
        className={`${padClasses} rounded-xl bg-secondary/50 border border-border/50 hover:border-primary/30 hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-all duration-300`}
        aria-label="Follow us on X"
      >
        <svg className={sizeClasses} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <a
        href="https://t.me/zerohumansystems"
        target="_blank"
        rel="noopener noreferrer"
        className={`${padClasses} rounded-xl bg-secondary/50 border border-border/50 hover:border-primary/30 hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-all duration-300`}
        aria-label="Join our Telegram"
      >
        <MessageCircle className={sizeClasses} />
      </a>
    </div>
  );
}