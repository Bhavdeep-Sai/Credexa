"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, Menu, X, Sun, Moon, LogOut, User, LayoutDashboard, History, Settings, Eye } from "lucide-react";
import { useAuthStore } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, initialized, checkSession } = useAuthStore();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Check user session on mount
  useEffect(() => {
    if (!initialized) {
      checkSession();
    }
  }, [initialized, checkSession]);

  // Load and apply theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      document.documentElement.classList.add("dark"); // Default dark mode
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    toast(`Switched to ${nextTheme} mode`, "info", 1500);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast("Logged out successfully", "success");
      router.push("/");
    } catch {
      toast("Failed to log out", "error");
    }
  };

  const isLinkActive = (path: string) => pathname === path;

  // Render navigation links based on user status
  const getNavLinks = (): { href: string; label: string; icon?: React.ReactNode }[] => {
    if (user) {
      const links = [
        { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
        { href: "/analyze", label: "Scan Terminal", icon: <Shield className="w-4 h-4" /> },
        { href: "/history", label: "History", icon: <History className="w-4 h-4" /> },
        { href: "/profile", label: "Profile", icon: <User className="w-4 h-4" /> },
      ];
      if (user.role === "admin") {
        links.push({ href: "/admin", label: "Admin Panel", icon: <Settings className="w-4 h-4" /> });
      }
      return links;
    }
    return [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/contact", label: "Contact" },
    ];
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-border/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="w-7 h-7 text-primary" />
              <span className="font-sans text-xl font-bold tracking-tight text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Credexa
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {getNavLinks().map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isLinkActive(link.href)
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Grandparent Mode Shortcut */}
            <Link
              href="/grandparent"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent font-semibold text-xs hover:bg-accent hover:text-accent-foreground transition-all duration-300 shadow-sm"
              title="Switch to Grandparent Mode (Simplified view)"
            >
              <Eye className="w-3.5 h-3.5" />
              Grandparent Mode
            </Link>

            {/* Dark Mode Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Authenticated Controls */}
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground font-medium max-w-[100px] truncate">
                  Hi, {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-destructive/20 bg-destructive/5 hover:bg-destructive text-destructive hover:text-white transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-border/50 text-foreground hover:bg-muted transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-sm hover:shadow-indigo-500/10"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-b border-border/40 p-4">
          <div className="flex flex-col gap-2">
            {getNavLinks().map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 p-3 rounded-lg text-base font-medium transition-colors ${
                  isLinkActive(link.href)
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            
            <div className="border-t border-border/50 my-2 pt-2 flex flex-col gap-2">
              <Link
                href="/grandparent"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20 text-accent font-semibold"
              >
                <Eye className="w-4 h-4" />
                Grandparent Mode
              </Link>

              {user ? (
                <div className="flex flex-col gap-2 mt-2">
                  <div className="text-sm text-muted-foreground text-center">
                    Logged in as <span className="font-semibold text-foreground">{user.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-destructive/20 bg-destructive/5 text-destructive font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 mt-2">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center p-3 rounded-lg border border-border/50 text-foreground font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center p-3 rounded-lg bg-primary text-primary-foreground font-medium"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
