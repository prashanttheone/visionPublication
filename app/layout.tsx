import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ClientLayout from "@/component/ClientLayout";
import LayoutWrapper from "@/component/LayoutWrapper";
import { AuthProvider } from "@/context/AuthProvider";
import { CartProvider } from "@/context/CartContext";
import Celebration from "@/utils/Celebration";
import WhatsAppCTA from "@/component/whatsappCta";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VisionPublications - Healthcare Books & Publishing",
  description: "Discover a comprehensive collection of medical, nursing, and healthcare textbooks from VisionPublications. Expert-curated educational resources for healthcare professionals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <CartProvider>
            <Celebration />
            <WhatsAppCTA />
            <ClientLayout>
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </ClientLayout>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
