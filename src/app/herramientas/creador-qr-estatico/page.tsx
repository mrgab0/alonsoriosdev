import React from "react";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import StaticQRClient from "./StaticQRClient";

export const metadata: Metadata = {
  title: "Creador de Códigos QR Gratis (SVG y PNG) | alonsorios.dev",
  description:
    "Genera códigos QR estáticos gratis en alta resolución para URLs, WiFi, WhatsApp y texto. Descarga en PNG y SVG sin límites ni marcas de agua.",
  keywords: [
    "creador de codigos qr gratis",
    "generador qr gratis",
    "qr svg",
    "qr png alta resolucion",
    "qr wifi gratis",
    "qr whatsapp",
    "alonso rios herramientas",
  ],
  openGraph: {
    title: "Creador de Códigos QR Gratis | alonsorios.dev",
    description: "Genera códigos QR gratis para tu web, WhatsApp o WiFi en formato vectorial SVG y PNG.",
    url: "https://www.alonsorios.dev/herramientas/creador-qr-estatico",
    siteName: "Alonso Ríos",
    locale: "es_ES",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default function StaticQRPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070d19] text-white">
      <Header />
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <StaticQRClient />
      </main>
      <Footer />
    </div>
  );
}
