import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { ProjectSlider } from "@/components/ProjectSlider";
import { BooksAndCourses } from "@/components/BooksAndCourses";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { ChatbotWidget } from "@/components/ChatbotWidget";

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
    </div>
  );
}
