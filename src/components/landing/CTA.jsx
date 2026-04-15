import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function CTA() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground mb-6 leading-tight">
            The future doesn't need<br />
            <span className="text-primary">more employees.</span>
            <br />
            It needs better systems.
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Make your company run itself. Zero Human Systems — your complete autonomous AI operating system, deployable today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl px-10 h-14 text-base gap-2 group shadow-lg shadow-primary/20"
              onClick={() => base44.auth.redirectToLogin()}
            >
              <Zap className="w-5 h-5" />
              Deploy Your Zero Human Company
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          {/* Social links */}
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <a
              href="https://x.com/zerohuman87307"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-foreground transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              @zerohuman87307
            </a>
            <span className="w-px h-4 bg-border/50" />
            <a
              href="https://t.me/zerohumansystems"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-foreground transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              t.me/zerohumansystems
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}