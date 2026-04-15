import React from "react";
import SocialLinks from "./SocialLinks";
import { Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-3">
            <img
              src="https://media.base44.com/images/public/69df985c75b2b8e8f4b5ac85/06958c67a_logo.png"
              alt="Zero Human Systems"
              className="h-8 w-8 rounded-lg"
            />
            <div>
              <span className="text-sm font-semibold text-foreground">Zero Human Systems</span>
              <p className="text-xs text-muted-foreground">© 2026 All rights reserved.</p>
            </div>
          </div>

          {/* Email */}
          <a
            href="mailto:zerohumansystems@gmail.com"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Mail className="w-4 h-4" />
            zerohumansystems@gmail.com
          </a>

          {/* Social Links */}
          <SocialLinks />
        </div>
      </div>
    </footer>
  );
}