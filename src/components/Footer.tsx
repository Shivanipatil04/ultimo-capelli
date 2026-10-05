"use client";

import Image from "next/image";
import logo from "@/assets/ultimoLogo.png";

export default function Footer() {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-surface-container w-full py-16 md:py-stack-lg border-t border-outline-variant/40 mt-auto z-40 relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="col-span-1 md:col-span-1">
          <div className="mb-6">
            <Image src={logo} alt="Ultimo Capelli Logo" width={180} height={56} className="object-contain hover:scale-105 transition-transform duration-300 cursor-pointer brightness-0 opacity-90" onClick={() => scrollTo("home")} />
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
            Elevating confidence through premier non-surgical hair restoration services.
          </p>
          <div className="font-body-sm text-body-sm text-on-surface-variant/60">
            © {new Date().getFullYear()} ULTIMO CAPELLI. ALL RIGHTS RESERVED.
          </div>
        </div>
        <div className="col-span-1">
          <h4 className="font-label-lg text-label-lg text-on-surface mb-4 uppercase tracking-widest">Links</h4>
          <ul className="space-y-3">
            <li><a href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Terms of Service</a></li>
          </ul>
        </div>
        <div className="col-span-1">
          <h4 className="font-label-lg text-label-lg text-on-surface mb-4 uppercase tracking-widest">Locations</h4>
          <ul className="space-y-3">
            <li><button onClick={() => scrollTo("contact")} className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors bg-transparent border-none cursor-pointer p-0">Pune Branch</button></li>
            <li><button onClick={() => scrollTo("contact")} className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors bg-transparent border-none cursor-pointer p-0">Nashik Branch</button></li>
            <li><button onClick={() => scrollTo("contact")} className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors bg-transparent border-none cursor-pointer p-0">Bhubaneswar Branch</button></li>
          </ul>
        </div>
        <div className="col-span-1">
          <h4 className="font-label-lg text-label-lg text-on-surface mb-4 uppercase tracking-widest">Stay Updated</h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">Get expert tips and exclusive offers.</p>
          <div className="relative">
            <input 
              className="w-full bg-white border border-outline-variant/50 px-4 py-2.5 font-body-sm text-body-sm text-on-surface rounded-lg focus:border-primary focus:ring-0 transition-colors input-border-focus" 
              placeholder="Email Address" 
              type="email"
            />
            <button className="absolute right-1 top-1 bottom-1 px-3 bg-primary text-on-primary rounded-md hover:bg-primary/90 transition-colors">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
