import React from "react";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import PublicPagoMovilClient from "./PublicPagoMovilClient";

export const metadata: Metadata = {
  title: "Creador de Códigos QR para Pago Móvil Venezuela (Acrílicos y Mostrador) | alonsorios.dev",
  description:
    "Genera gratis tu código QR oficial de Pago Móvil para bancos de Venezuela (BDV, Banesco, Mercantil, Bancamiga, etc.) bajo la red Suiche 7B. Diseña y descarga tu cartel de mostrador en alta resolución para soporte de acrílico.",
  keywords: [
    "qr pago movil venezuela",
    "creador qr pago movil gratis",
    "codigo qr bdv banco de venezuela",
    "cartel acrilico pago movil",
    "qr suiche 7b negocios",
    "pago movil banesco qr",
    "soporte acrilico pago movil mostrador",
    "alonso rios pago movil",
  ],
  openGraph: {
    title: "Creador de Códigos QR para Pago Móvil Venezuela | alonsorios.dev",
    description: "Diseña tu cartel de mostrador para Pago Móvil con código QR oficial listo para imprimir en acrílico.",
    url: "https://www.alonsorios.dev/herramientas/creador-qr-pago-movil",
    siteName: "Alonso Ríos",
    locale: "es_VE",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default function PublicPagoMovilPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070d19] text-white">
      <Header />
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <PublicPagoMovilClient />
      </main>
      <Footer />
    </div>
  );
}
