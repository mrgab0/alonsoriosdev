import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader, Inter } from "next/font/google";
import "./globals.css";
import { AccessibilityProvider } from "@/components/AccessibilityContext";
import { ConfigProvider } from "@/context/ConfigContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://alonsorios.dev"),
  title: "Alonso Ríos | Páginas Web, Apps Android, SEO & Cursos",
  description:
    "Desarrollo sitios web profesionales, aplicaciones móviles Android, recupero páginas caídas o infectadas y enseño a programar con libros y cursos en español claro.",
  keywords: [
    "Alonso Ríos",
    "Desarrollador Web",
    "Creación de Páginas Web",
    "Recuperación de Páginas Web",
    "Aplicaciones Android",
    "SEO Google",
    "Cursos de Programación",
    "Libros de Programación",
  ],
  authors: [{ name: "Alonso Ríos", url: "https://alonsorios.dev" }],
  openGraph: {
    title: "Alonso Ríos | Soluciones Web, Apps Android y Cursos",
    description:
      "Desarrollador especialista en sitios web rápidos, apps móviles, SEO y material educativo amigable.",
    url: "https://alonsorios.dev",
    siteName: "Alonso Ríos Dev",
    locale: "es_ES",
    type: "website",
  },
};

import Tracker from "@/components/Tracker";
import LeadCaptureFloatingWidget from "@/components/LeadCaptureFloatingWidget";
import WhatsAppButton from "@/components/WhatsAppButton";
import { ChatbotWidget } from "@/components/ChatbotWidget";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <ConfigProvider>
          <AccessibilityProvider>
            <Tracker />
            <LeadCaptureFloatingWidget />
            <WhatsAppButton />
            <ChatbotWidget />
            {children}
          </AccessibilityProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
