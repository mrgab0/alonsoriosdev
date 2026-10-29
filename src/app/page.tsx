import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { ProjectSlider } from "@/components/ProjectSlider";
import { BooksAndCourses } from "@/components/BooksAndCourses";
import { HomeToolsSection } from "@/components/HomeToolsSection";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070d19] text-white relative">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Services />
        <ProjectSlider />
        <BooksAndCourses />
        <HomeToolsSection />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
