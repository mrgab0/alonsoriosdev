import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ShieldCheck, Wifi, ArrowLeft, ExternalLink, CheckCircle2, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidad | Remote WiFi Keyboard - Alonso Ríos",
  description:
    "Política de privacidad oficial de la app Remote WiFi Keyboard. 100% comunicación local, cero telemetría, cero publicidad. Cumple con Google Play Console, GDPR y CCPA.",
  alternates: {
    canonical: "https://alonsorios.dev/privacy-remote-keyboard.html",
  },
};

export default function PrivacyRemoteKeyboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070d19] text-white">
      <Header />

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
          <Link
            href="/apps/remote-wifi-keyboard"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la ficha de Remote WiFi Keyboard</span>
          </Link>

          <a
            href="/privacy-remote-keyboard.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full font-mono hover:bg-amber-400/20 transition"
          >
            <span>Ver versión HTML pura (Google Play)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Header Block */}
        <div className="bg-[#0c1527] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-[11px] font-mono uppercase tracking-wider bg-amber-400/10 text-amber-400 border border-amber-400/30 px-2.5 py-0.5 rounded-full font-bold">
              Android App
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
              <Wifi className="w-3 h-3" />
              100% Red Local · Sin Servidores Externos
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-bold">
              GDPR & CCPA Compliant
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            Política de Privacidad
          </h1>
          <p className="text-slate-400 text-sm">
            <strong>Aplicación:</strong> Remote WiFi Keyboard &bull; <strong>Desarrollador:</strong> Alonso Ríos &bull;{" "}
            <strong>Última actualización:</strong> Septiembre 2026
          </p>

          <div className="mt-6 p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-sm text-emerald-200/90 leading-relaxed">
              <strong>Compromiso Cero Recopilación de Datos:</strong> Remote WiFi Keyboard no recopila, almacena, rastrea ni transmite ningún dato personal, pulsación de teclas, contraseñas ni información de identificación a servidores de Internet o de terceros.
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-slate-300 leading-relaxed text-sm sm:text-base">
          <section className="bg-[#0b1325] border border-slate-800/80 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-amber-400 font-mono">1.</span> Identificación del Desarrollador
            </h2>
            <p className="text-slate-300 mb-3">
              El responsable directo del desarrollo y distribución de la aplicación es:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 font-mono text-sm">
              <li><strong>Desarrollador:</strong> Alonso Ríos</li>
              <li><strong>Web Oficial:</strong> <a href="https://alonsorios.dev" className="text-amber-400 underline">https://alonsorios.dev</a></li>
              <li><strong>Contacto de Privacidad:</strong> <a href="mailto:contacto@alonsorios.dev" className="text-amber-400 underline">contacto@alonsorios.dev</a></li>
            </ul>
          </section>

          <section className="bg-[#0b1325] border border-slate-800/80 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-amber-400 font-mono">2.</span> Comunicación Local Exclusiva
            </h2>
            <p className="text-slate-300 mb-3">
              Todas las comunicaciones entre tu teléfono móvil y tu computadora se realizan de forma 100% local dentro de tu propia red Wi-Fi privada. 
            </p>
            <p className="text-slate-400">
              Ningún paquete de red ni texto ingresado sale a Internet. La aplicación opera con sockets locales en tu red privada doméstica o empresarial.
            </p>
          </section>

          <section className="bg-[#0b1325] border border-slate-800/80 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-amber-400 font-mono">3.</span> Permisos Solicitados y su Uso Técnico
            </h2>
            <div className="space-y-3 font-mono text-xs sm:text-sm">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-amber-400 font-bold block mb-1">INTERNET / ACCESS_NETWORK_STATE / ACCESS_WIFI_STATE</span>
                <span className="text-slate-300 font-sans">
                  Requerido únicamente para abrir el socket de conexión local con el navegador o cliente de tu computadora en la misma red Wi-Fi y verificar el estado de la red.
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-amber-400 font-bold block mb-1">FOREGROUND_SERVICE</span>
                <span className="text-slate-300 font-sans">
                  Utilizado para mantener la conexión activa en segundo plano con una notificación en la barra de estado mientras escribes, evitando que el sistema operativo cierre la app por ahorro de batería.
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-amber-400 font-bold block mb-1">VIBRATE</span>
                <span className="text-slate-300 font-sans">
                  Para proporcionar retroalimentación háptica leve y opcional al pulsar teclas o confirmar comandos.
                </span>
              </div>
            </div>
          </section>

          <section className="bg-[#0b1325] border border-slate-800/80 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-amber-400 font-mono">4.</span> Menores de Edad, Publicidad y Analíticas
            </h2>
            <p className="text-slate-300 mb-2">
              La aplicación es apta para todo público (All Ages) y:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>NO contiene anuncios publicitarios</strong> de ninguna clase.</li>
              <li><strong>NO incluye compras dentro de la app (In-App Purchases)</strong> ni pasarelas externas en la app.</li>
              <li><strong>NO incluye librerías de analítica</strong> de terceros (sin Firebase Analytics, sin Facebook SDK, sin rastreadores).</li>
              <li>Cumple con la Ley de Protección de la Privacidad Infantil en Línea (COPPA) al no recolectar datos de ningún usuario.</li>
            </ul>
          </section>

          <section className="bg-[#0b1325] border border-slate-800/80 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-amber-400 font-mono">5.</span> Cumplimiento Legal Internacional (GDPR & CCPA)
            </h2>
            <p className="text-slate-300 mb-3">
              Bajo las normativas <strong>GDPR (Unión Europea)</strong> y <strong>CCPA/CPRA (California, EE. UU.)</strong>:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-sans">
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                <strong className="text-white block mb-1">GDPR (Europa):</strong>
                <span className="text-slate-400">
                  Principio de minimización extrema. Al no existir bases de datos con información personal, no hay riesgos de filtración ni transferencias internacionales.
                </span>
              </div>
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                <strong className="text-white block mb-1">CCPA / CPRA (EE. UU.):</strong>
                <span className="text-slate-400">
                  No vendemos ni compartimos información personal de ningún usuario. Total respeto al derecho "Do Not Sell My Info".
                </span>
              </div>
            </div>
          </section>

          <section className="bg-[#0b1325] border border-slate-800/80 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-amber-400 font-mono">6.</span> Contacto y Dudas
            </h2>
            <p className="text-slate-300">
              Si tienes alguna duda o consulta técnica acerca de esta política de privacidad, puedes contactarnos directamente al correo:{" "}
              <a href="mailto:contacto@alonsorios.dev" className="text-amber-400 font-mono font-bold underline">
                contacto@alonsorios.dev
              </a>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
