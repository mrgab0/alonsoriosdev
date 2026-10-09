import React from "react";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import DynamicQRClient from "./DynamicQRClient";

export const metadata: Metadata = {
  title: "Creador de Códigos QR Dinámicos (Editables) | alonsorios.dev",
  description:
    "Crea códigos QR dinámicos gratis cuyo destino puedes cambiar en cualquier momento después de imprimir. Monitorea escaneos y descargas en alta calidad PNG y SVG.",
  keywords: [
    "creador qr dinamico gratis",
    "qr editable gratis",
    "cambiar enlace qr despues de imprimir",
    "rastrear escaneos qr",
    "generador qr dinamico alonso rios",
  ],
  openGraph: {
    title: "Creador de Códigos QR Dinámicos (Editables) | alonsorios.dev",
    description: "Crea códigos QR que puedes actualizar después de imprimir sin cambiar el código visual.",
    url: "https://www.alonsorios.dev/herramientas/creador-qr-dinamico",
    siteName: "Alonso Ríos",
    locale: "es_ES",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default function DynamicQRPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070d19] text-white">
      <Header />
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <DynamicQRClient />
      </main>
      <Footer />
    </div>
  );
}
