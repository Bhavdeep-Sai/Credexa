"use client";

import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 prose prose-slate dark:prose-invert">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl mb-6">
        Privacy Policy
      </h1>
      <p className="text-slate-500 text-sm mb-8">Last updated: June 4, 2026</p>

      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <p>
          At Credexa, we prioritize the privacy and security of our users. This Privacy Policy details how we collect, process, and protect information when you use our scam analysis platform.
        </p>

        <h3 className="text-lg font-bold text-foreground mt-8">1. Information We Collect</h3>
        <p>
          We collect information directly from you when you create an account, update your profile, or submit content for analysis.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Account Data:</strong> Name, email address, password hashes, and profile picture references.</li>
          <li><strong>Scan Inputs:</strong> Text messages, URL links, screenshots, or voice recordings you explicitly upload for analysis.</li>
          <li><strong>System Logs:</strong> IP address, browser type, timestamps, and request activity collected for rate limiting and threat auditing.</li>
        </ul>

        <h3 className="text-lg font-bold text-foreground mt-8">2. How We Process Scan Data</h3>
        <p>
          Scan inputs (texts, URLs, screenshots, and audio files) are sent to the Google Gemini API for scam detection and transcription. 
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Anonymous Users:</strong> Inputs are processed entirely in memory. Results are cached briefly to avoid redundant AI queries but are not saved persistently to our databases.</li>
          <li><strong>Registered Users:</strong> We save the threat report, content preview, and type to your personal Scan History. Users can delete individual records or purge their entire history history vault at any time.</li>
        </ul>

        <h3 className="text-lg font-bold text-foreground mt-8">3. Data Retention</h3>
        <p>
          We store account information for as long as your account remains active. System audit logs are rotated and purged automatically after 30 days. Files uploaded during screenshot or audio scans are deleted from local servers immediately after the AI analysis completes.
        </p>

        <h3 className="text-lg font-bold text-foreground mt-8">4. Sharing Your Data</h3>
        <p>
          Credexa does not sell, license, or share user data with third-party advertisers. Data is shared with Google Gemini solely for the purpose of executing requested AI threat checks.
        </p>

        <h3 className="text-lg font-bold text-foreground mt-8">5. Your Security Rights</h3>
        <p>
          You have the right to access your profile data, edit profile credentials, delete individual scan histories, or request permanent deletion of your account. Contact us at <a href="mailto:support@credexa.live" className="text-primary hover:underline">support@credexa.live</a> for assistance.
        </p>
      </div>
    </div>
  );
}
