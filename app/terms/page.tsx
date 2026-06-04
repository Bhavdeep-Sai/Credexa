"use client";

import React from "react";

export default function TermsOfService() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 prose prose-slate dark:prose-invert">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl mb-6">
        Terms of Service
      </h1>
      <p className="text-slate-500 text-sm mb-8">Last updated: June 4, 2026</p>

      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <p>
          Welcome to Credexa. By accessing or using our application, you agree to comply with and be bound by the following Terms of Service.
        </p>

        <h3 className="text-lg font-bold text-foreground mt-8">1. Acceptance of Terms</h3>
        <p>
          By creating an account, running scam scans, or accessing the website, you confirm your agreement to these terms. If you do not agree, please do not use the application.
        </p>

        <h3 className="text-lg font-bold text-foreground mt-8">2. Authorized Use & Limits</h3>
        <p>
          Credexa is built to help individuals verify messages. You agree not to:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Attempt to bypass rate limits or compromise security headers.</li>
          <li>Scan content that violates intellectual property or national security laws.</li>
          <li>Use automated scripts to extract reports from our backend endpoints.</li>
        </ul>

        <h3 className="text-lg font-bold text-foreground mt-8">3. AI Service Disclaimers</h3>
        <p>
          Credexa uses advanced AI models (Google Gemini) to analyze threats. While we aim for high accuracy, our reports should be treated as guidance, not absolute verification.
        </p>
        <p className="bg-muted p-4 rounded-xl border border-border text-foreground font-medium">
          IMPORTANT DISCLAIMER: Credexa does not assume liability for any financial decisions, transactions, or communications made by the user before or after using this platform. Always consult verified support numbers or financial agents before sharing credentials.
        </p>

        <h3 className="text-lg font-bold text-foreground mt-8">4. Accounts and Suspension</h3>
        <p>
          We reserve the right to suspend or terminate accounts that violate usage limits, trigger malicious OCR inputs, or flood the API routes.
        </p>

        <h3 className="text-lg font-bold text-foreground mt-8">5. Modifications to Services</h3>
        <p>
          We may modify or discontinue features, plans, and constraints at any point. Continued use of the platform after updates constitutes agreement to the updated terms.
        </p>
      </div>
    </div>
  );
}
