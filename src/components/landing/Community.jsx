import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Users, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import SocialLinks from "./SocialLinks";

export default function Community() {
  return (
    <section id="community" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Users className="w-3.5 h-3.5" />
            Join the Movement
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Connect with <span className="text-primary">Us</span>
          </h2>
          <p className="max-w-xl mx-auto text-muted-foreground text-lg mb-12">
            Stay updated on the latest developments, join the conversation, and be part 
            of the autonomous future.
          </p>

          {/* Social cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* X / Twitter */}
            <motion.a
              href="https://x.com/zerohuman87307"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group relative p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-lg hover:shadow-primary/5 text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500" />
              <div className="relative">
                <div className="inline-flex p-3 rounded-xl bg-foreground/10 mb-5">
                  <svg className="w-6 h-6 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Follow on X</h3>
                <p className="text-muted-foreground text-sm mb-4">Get real-time updates, announcements, and insights from Zero Human Systems.</p>
                <div className="flex items-center gap-2 text-primary text-sm font-medium group-hover:gap-3 transition-all">
                  @zerohuman87307 <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.a>

            {/* Telegram */}
            <motion.a
              href="https://t.me/zerohumansystems"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group relative p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-lg hover:shadow-primary/5 text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500" />
              <div className="relative">
                <div className="inline-flex p-3 rounded-xl bg-blue-500/10 mb-5">
                  <MessageCircle className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Join Telegram</h3>
                <p className="text-muted-foreground text-sm mb-4">Join our community channel for discussions, news, and direct communication.</p>
                <div className="flex items-center gap-2 text-primary text-sm font-medium group-hover:gap-3 transition-all">
                  t.me/zerohumansystems <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.a>

            {/* Email */}
            <motion.a
              href="mailto:zerohumansystems@gmail.com"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="group relative p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-lg hover:shadow-primary/5 text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500" />
              <div className="relative">
                <div className="inline-flex p-3 rounded-xl bg-green-500/10 mb-5">
                  <Mail className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Email Us</h3>
                <p className="text-muted-foreground text-sm mb-4">Business inquiries, partnerships, enterprise deployments, and real-world audits.</p>
                <div className="flex items-center gap-2 text-primary text-sm font-medium group-hover:gap-3 transition-all">
                  zerohumansystems@gmail.com <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}