import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { EthereumWalletProvider } from "@/contexts/EthereumWalletContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AAVE Vault Rebalancer",
  description: "A DeFi portfolio rebalancing application using AAVE Vault",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <EthereumWalletProvider>
          {children}
        </EthereumWalletProvider>
      </body>
    </html>
  );
}
