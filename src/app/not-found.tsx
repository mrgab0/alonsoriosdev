import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a1120] text-white flex flex-col justify-center items-center px-4 font-sans text-center">
      <h1 className="text-6xl font-black text-amber-400 mb-2">404</h1>
      <h2 className="text-xl font-black text-white mb-4">Página no encontrada</h2>
      <p className="text-xs text-white font-extrabold max-w-sm mb-6">
        La página que buscas no existe o ha sido movida.
      </p>
      <Link
        href="/"
        className="bg-amber-400 hover:bg-amber-500 text-[#0a1120] font-black px-6 py-3 rounded-xl transition text-xs flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a Inicio</span>
      </Link>
    </div>
  );
}
