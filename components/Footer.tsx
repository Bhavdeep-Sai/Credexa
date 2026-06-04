"use client";

import React from "react";
import Link from "next/link";
import { Shield, Mail, Phone, Heart, CheckCircle2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-slate-900 border-t border-slate-800 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-indigo-400" />
              <span className="font-sans text-lg font-bold tracking-tight text-white">
                Credexa
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-6">
              AI-powered protection to analyze scam text, suspicious links, phishing emails, and screen attachments before you interact.
            </p>
            <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
              Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500 animate-pulse" /> for secure connections.
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/features" className="hover:text-white transition-colors">
                  Scam Detector
                </Link>
              </li>
              <li>
                <Link href="/grandparent" className="hover:text-white transition-colors flex items-center gap-1">
                  Grandparent Mode
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-bold">
                    Easy
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Pricing Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Policy Links */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">Resources & Trust</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Mission
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">Security Support</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400" />
                <a href="mailto:support@credexa.live" className="hover:text-white transition-colors">
                  support@credexa.live
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-400" />
                <span>+1 (800) 555-CRDX</span>
              </li>
              <li className="flex items-center gap-2 text-xs border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>System: Online & Active</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 my-8"></div>

        {/* Disclaimer and Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <p>
            &copy; {new Date().getFullYear()} Credexa. All rights reserved. "Verify Before You Trust"
          </p>
          <p className="max-w-md text-center sm:text-right leading-5">
            Disclaimer: Credexa Scam Detector uses Google Gemini artificial intelligence to rate threat risks. Check with financial agents or trusted contacts before completing transactions.
          </p>
        </div>
      </div>
    </footer>
  );
}
