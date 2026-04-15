import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bot, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Agents", href: "#agents" },
    { label: "How It Works", href: "#how" },
    { label: "Tech Stack", href: "#stack" },
    { label: "Roadmap", href: "#roadmap" },
    { label: "Community", href: "#community" },
    { label: "Audit", href: "/audit", isRoute: true },
    { label: "Monetize", href: "/monetization", isRoute: true },
    { label: "AI Docs", href: "/docs", isRoute: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img 
                src="https://media.base44.com/images/public/69df985c75b2b8e8f4b5ac85/06958c67a_logo.png" 
                alt="Zero Human Systems" 
                className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl"
              />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Zero Human<span className="text-primary"> Systems</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
              link.isRoute ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors rounded-lg hover:bg-primary/10 border border-primary/20"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
                >
                  {link.label}
                </a>
              )
            )}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => base44.auth.redirectToLogin()}
            >
              Sign In
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl px-6"
              onClick={() => base44.auth.redirectToLogin()}
            >
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) =>
                link.isRoute ? (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="block px-4 py-3 text-sm font-medium text-primary rounded-lg hover:bg-primary/10"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/50"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                )
              )}
              <div className="pt-2 border-t border-border/50 space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-center text-muted-foreground"
                  onClick={() => base44.auth.redirectToLogin()}
                >
                  Sign In
                </Button>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                  onClick={() => base44.auth.redirectToLogin()}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}