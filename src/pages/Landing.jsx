import { useEffect, useState } from "react";
import AuraTitle from "../components/AuraTitle";
import SectionTitle from "../components/SectionTitle";
import ProjectCard from "../components/ProjectCard";
import BlogTeaser from "../components/BlogTeaser";
import { projects, blogPreviews, skills } from "../data/site";

export default function Landing() {
  const [year, setYear] = useState(new Date().getFullYear());
  useEffect(() => setYear(new Date().getFullYear()), []);

  return (
    <main>
      {/* NAV */}
      <nav className="sticky top-0 z-50 backdrop-blur border-b border-white/10 bg-black/30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-brand-600 to-cyanx"></div>
          <span className="font-bold tracking-wide">JEREMY ROBARDS</span>
          <div className="ml-auto hidden sm:flex items-center gap-5 text-sm text-slate-300">
            <a href="#projects" className="hover:text-white">Projects</a>
            <a href="#skills" className="hover:text-white">Skills</a>
            <a href="/blog" className="hover:text-white">Blog</a>
            <a href="#contact" className="hover:text-white">Contact</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="max-w-6xl mx-auto px-4 pt-12 pb-10">
        <p className="uppercase tracking-[.2em] text-xs text-slate-300">Software Developer • Front-End Engineer</p>
        <div className="mt-3">
          <AuraTitle>Design-minded engineer crafting fast, resilient interfaces.</AuraTitle>
        </div>
        <p className="mt-4 max-w-3xl text-slate-200/90 text-lg md:text-xl">
          I specialize in <span className="font-semibold text-white">Advanced Prompt Engineering</span>, modern web development, and human-centered UI. I turn ambiguous goals into well-shipped, production-ready features.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="#projects" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-cyanx px-5 py-2.5 font-semibold text-black shadow-soft hover:brightness-110 transition">View Projects</a>
          <a href="#contact" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 font-semibold hover:bg-white/10">Contact</a>
        </div>
      </header>

      {/* PROJECTS */}
      <section id="projects" className="max-w-6xl mx-auto px-4 pb-4">
        <SectionTitle>Selected Work</SectionTitle>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p, i) => <ProjectCard key={i} p={p} i={i} />)}
        </div>
      </section>

      {/* SKILLS */}
      <section id="skills" className="max-w-6xl mx-auto px-4 mt-10">
        <SectionTitle>Core Skills</SectionTitle>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-soft">
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-6 text-sm">
            {skills.map((s, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-brand-600 to-cyanx animate-floaty"></span>
                <span className="text-slate-300/90">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* BLOG PREVIEW */}
      <section id="blog" className="max-w-6xl mx-auto px-4 mt-10">
        <SectionTitle>Latest Writing</SectionTitle>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-soft">
          <BlogTeaser items={blogPreviews} />
          <div className="text-right mt-3"><a href="/blog" className="text-sm text-brand-300 hover:text-white">Open Blog →</a></div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="max-w-6xl mx-auto px-4 mt-12">
        <SectionTitle>Contact</SectionTitle>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-soft grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-slate-300/90">Available for front-end engineering roles and selective freelance. I value clear scope, quick feedback loops, and shipping value early.</p>
          </div>
          <div className="grid gap-2 text-sm">
            <div><span className="text-slate-300">Email:</span> <a className="hover:underline" href="mailto:contact@jeremyrobards.com">contact@jeremyrobards.com</a></div>
            <div><span className="text-slate-300">GitHub:</span> <a className="hover:underline" href="https://github.com/TheSeeker713" target="_blank" rel="noopener">github.com/TheSeeker713</a></div>
            <div><span className="text-slate-300">Website:</span> <a className="hover:underline" href="https://www.jeremyrobards.com" target="_blank" rel="noopener">www.JeremyRobards.com</a></div>
          </div>
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-4 text-center text-slate-400/80 py-10">© {year} Jeremy Robards</footer>
    </main>
  );
}
