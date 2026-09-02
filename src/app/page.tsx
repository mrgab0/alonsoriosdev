import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { ProjectSlider } from "@/components/ProjectSlider";
import { BooksAndCourses } from "@/components/BooksAndCourses";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import Link from "next/link";
import { Settings } from "lucide-react";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a1120] text-white relative">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Services />
        <ProjectSlider />
        <BooksAndCourses />
        <ContactForm />
      </main>
      <Footer />
      <ChatbotWidget />

      {/* Admin Panel Quick Access Button */}
      <Link
        href="/admin"
        className="fixed bottom-6 left-6 z-40 bg-[#121b2d] hover:bg-amber-400 text-[#0a1120] font-black p-3 rounded-full border border-[#1e2a42] shadow-xl transition flex items-center gap-2 text-xs"
        title="Acceder al Panel de Administración"
      >
        <Settings className="w-5 h-5 text-amber-400 hover:text-[#0a1120]" />
        <span className="hidden sm:inline text-white font-black hover:text-[#0a1120]">Panel Admin</span>
      </Link>
    </div>
  );
}
