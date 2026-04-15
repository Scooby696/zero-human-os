import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, LayoutDashboard, Database, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function DashboardHeader({ user }) {
  const location = useLocation();

  const tabs = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Agent Activity", href: "/dashboard/agents", icon: BarChart3 },
    { label: "Tools & OS", href: "/dashboard/tools", icon: Database },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="https://media.base44.com/images/public/69df985c75b2b8e8f4b5ac85/06958c67a_logo.png" alt="ZHS" className="h-8 w-8 rounded-xl" />
              <span className="text-base font-bold text-foreground hidden sm:block">Zero Human <span className="text-primary">OS</span></span>
            </Link>
            <nav className="flex items-center gap-1">
              {tabs.map((tab) => (
                <Link
                  key={tab.href}
                  to={tab.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === tab.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.full_name || user?.email || "Agent"}</span>
            <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => base44.auth.logout()}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}