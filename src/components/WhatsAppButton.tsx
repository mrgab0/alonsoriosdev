"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
}

export const WhatsAppButton = ({
  phoneNumber = "584129912840",
  message = "¡Hola Alonso! 👋 Vi tu sitio web y me gustaría hablar sobre un proyecto.",
}: WhatsAppButtonProps) => {
  const pathname = usePathname();
  const isAdmin = pathname ? pathname.startsWith("/admin") : false;

  const [showTooltip, setShowTooltip] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Mostrar tooltip automáticamente después de 3.5 segundos solo para visitantes
    if (!isAdmin) {
      const timer = setTimeout(() => setShowTooltip(true), 3500);
      const hideTimer = setTimeout(() => setShowTooltip(false), 9000);
      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    }
  }, [isAdmin]);

  // No renderizar en el panel de administración
  if (!isMounted || isAdmin) return null;

  const cleanPhone = phoneNumber.replace(/[^\d]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-24 sm:bottom-28 right-6 sm:right-8 z-50 flex flex-col items-end gap-2">
      {/* Tooltip / Burbuja de texto */}
      {showTooltip && (
        <div className="relative flex items-center gap-2 bg-[#0d1527] border border-emerald-500/30 text-white text-xs rounded-2xl rounded-br-sm px-3.5 py-2.5 shadow-2xl max-w-[210px] animate-fade-in backdrop-blur-md">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute -top-2 -right-2 bg-gray-800 hover:bg-gray-700 rounded-full p-1 text-gray-300 hover:text-white transition-colors"
            aria-label="Cerrar sugerencia"
          >
            <X size={10} />
          </button>
          <span>
            ¿Tienes un proyecto? <strong>Hablemos directo</strong> 🚀
          </span>
        </div>
      )}

      {/* Botón flotante WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setShowTooltip(false)}
        aria-label="Contactar a Alonso por WhatsApp"
        className="flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white pl-3.5 pr-4 py-3 rounded-full shadow-[0px_8px_24px_rgba(37,211,102,0.4)] hover:shadow-[0px_12px_32px_rgba(37,211,102,0.55)] hover:scale-105 transition-all duration-300 active:scale-95 group"
      >
        {/* SVG Oficial WhatsApp */}
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 fill-white flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        <span className="font-bold text-xs whitespace-nowrap">
          WhatsApp
        </span>
      </a>
    </div>
  );
};

export default WhatsAppButton;
