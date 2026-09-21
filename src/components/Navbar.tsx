"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import logo from "@/assets/ultimoLogo.png";
export default function Navbar() {
  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );

    sections.forEach((section) => observer.observe(section));

    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      sections.forEach((section) => observer.unobserve(section));
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const getLinkClasses = (section: string) => {
    const base = "font-label-lg text-label-lg uppercase tracking-widest transition-all duration-300 cursor-pointer relative py-1";
    if (activeSection === section) {
      return `${base} text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary after:rounded-full`;
    }
    return `${base} text-on-surface-variant hover:text-primary`;
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      scrolled || mobileOpen
        ? "bg-white/95 backdrop-blur-lg border-b border-outline-variant/40 shadow-soft" 
        : "bg-white/95 lg:bg-transparent backdrop-blur-lg lg:backdrop-blur-none"
    }`}>
      <div className="flex justify-between items-center h-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <button onClick={() => scrollTo("home")} className="cursor-pointer border-none bg-transparent p-0 flex items-center justify-center">
          <Image src={logo} alt="Ultimo Capelli Logo" width={220} height={70} className={`object-contain hover:scale-105 transition-transform duration-300 ${!scrolled ? 'brightness-0 lg:brightness-100' : 'brightness-0'} opacity-90`} priority />
        </button>
        <div className="hidden lg:flex gap-8 items-center">
          <button onClick={() => scrollTo("home")} className={getLinkClasses('home')}><span className={!scrolled ? "lg:text-on-dark/80 lg:hover:text-white" : ""}>Home</span></button>
          <button onClick={() => scrollTo("about")} className={getLinkClasses('about')}><span className={!scrolled ? "lg:text-on-dark/80 lg:hover:text-white" : ""}>About</span></button>
          <button onClick={() => scrollTo("services")} className={getLinkClasses('services')}><span className={!scrolled ? "lg:text-on-dark/80 lg:hover:text-white" : ""}>Services</span></button>
          <button onClick={() => scrollTo("preview")} className={getLinkClasses('preview')}><span className={!scrolled ? "lg:text-on-dark/80 lg:hover:text-white" : ""}>3D Preview</span></button>
          <button onClick={() => scrollTo("gallery")} className={getLinkClasses('gallery')}><span className={!scrolled ? "lg:text-on-dark/80 lg:hover:text-white" : ""}>Gallery</span></button>
          <button onClick={() => scrollTo("contact")} className={getLinkClasses('contact')}><span className={!scrolled ? "lg:text-on-dark/80 lg:hover:text-white" : ""}>Contact</span></button>
        </div>
        <button onClick={() => scrollTo("contact")} className="bg-primary text-on-primary px-6 py-3 font-label-lg text-label-lg uppercase tracking-widest hover:bg-primary/90 transition-all hidden lg:block rounded-lg cursor-pointer border-none font-bold shadow-soft hover:shadow-card">
          Book Consultation
        </button>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-on-surface bg-transparent border-none cursor-pointer p-2">
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 0" }}>
            {mobileOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-lg border-t border-outline-variant/30 shadow-elevated">
          <div className="flex flex-col gap-1 p-4">
            {["home", "about", "services", "preview", "gallery", "contact"].map((id) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`text-left px-4 py-3 rounded-lg font-label-lg text-label-lg uppercase tracking-widest transition-colors ${
                  activeSection === id ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {id === "preview" ? "3D Preview" : id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
