import { ClerkProvider } from "@clerk/nextjs";
import { DarkModeProvider } from "@/contexts/InventoryContext";
import Layout from "@/components/Layout";
import Providers from "./providers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Inventory App",
  description: "Aplikasi manajemen stok barang modern dan mudah digunakan.",
};

// ... font setup dan metadata ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider>
          <DarkModeProvider>
            <Providers>
              <Layout>{children}</Layout>
            </Providers>
          </DarkModeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
