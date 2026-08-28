import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Approach from "@/components/Approach";
import Projects from "@/components/Projects";
import AssistantSection from "@/components/AssistantSection";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Certifications from "@/components/Certifications";
import Contact from "@/components/Contact";
import ScrollProgress from "@/components/ScrollProgress";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <ScrollProgress />
      <Nav />
      <Hero />
      <Approach />
      <Projects />
      <AssistantSection />
      <Skills />
      <Experience />
      <Certifications />
      <Contact />
    </main>
  );
}
