"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Routes that shouldn't render the default site Navbar/Footer
  const hideLayout = 
    pathname === "/login" || 
    pathname === "/register" || 
    pathname === "/grandparent";

  if (hideLayout) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow bg-grid-glow">{children}</main>
      <Footer />
    </>
  );
}
