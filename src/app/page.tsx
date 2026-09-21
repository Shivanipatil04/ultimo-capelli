"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MagneticButton from "@/components/MagneticButton";
import BeforeAfterHead from "@/components/BeforeAfterHead";
import VideoGallery from "@/components/VideoGallery";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

// Dynamic imports for R3F components (SSR disabled)
const HeroHead = dynamic(() => import("@/components/HeroHead"), { ssr: false });
const WigPreviewer = dynamic(() => import("@/components/WigPreviewer"), { ssr: false });

export default function Home() {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const service = formData.get('service') as string;
    
    const text = `Hello, I would like to request a callback.\nName: ${name}\nPhone: ${phone}\nService of Interest: ${service || 'General Consultation'}`;
    window.open(`https://wa.me/918482954555?text=${encodeURIComponent(text)}`, '_blank');
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    // Progressive reveal animations — staggered, with breathing expo.out easing
    gsap.utils.toArray(".reveal-section").forEach((el: any) => {
      const children = el.querySelectorAll(".reveal-item");
      gsap.fromTo(
        children,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.1,
          ease: "expo.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
        }
      );
    });

    // Service cards — gentle lift-in with stagger
    gsap.fromTo(
      ".service-card",
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.15,
        ease: "expo.out",
        scrollTrigger: {
          trigger: "#services",
          start: "top 80%",
        },
      }
    );

    // Stats — fade up with spring
    gsap.fromTo(
      ".stat-item",
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.2)",
        scrollTrigger: {
          trigger: ".stats-bar",
          start: "top 85%",
        },
      }
    );

    // Image parallax — subtle 0.5x speed
    gsap.utils.toArray(".parallax-img").forEach((el: any) => {
      gsap.fromTo(
        el,
        { yPercent: -10 },
        {
          yPercent: 10,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    });

    // ── Scroll-Depth Parallax Layers ──
    const isMobile = window.innerWidth < 768;
    const scale = isMobile ? 0.5 : 1; // halve travel on mobile

    // Hero: background glow drifts slowest
    gsap.fromTo(".hero-layer-bg",
      { y: 0 },
      {
        y: 30 * scale,
        ease: "none",
        scrollTrigger: {
          trigger: "#home",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      }
    );

    // Hero: text moves at medium speed
    gsap.fromTo(".hero-layer-text",
      { y: 0 },
      {
        y: 60 * scale,
        ease: "none",
        scrollTrigger: {
          trigger: "#home",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      }
    );

    // Hero: 3D subject moves fastest (comes toward viewer)
    gsap.fromTo(".hero-layer-subject",
      { y: 0 },
      {
        y: 100 * scale,
        ease: "none",
        scrollTrigger: {
          trigger: "#home",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      }
    );

    // About: text column drifts at a different rate than the image
    gsap.fromTo(".about-layer-text",
      { y: 0 },
      {
        y: -40 * scale,
        ease: "none",
        scrollTrigger: {
          trigger: "#about",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );

    // Transformation: background glow drifts behind the pinned card
    gsap.fromTo(".transform-layer-bg",
      { y: 0, scale: 1 },
      {
        y: 50 * scale,
        scale: 1.1,
        ease: "none",
        scrollTrigger: {
          trigger: "#transformation",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <>
      <Navbar />
      <main className="flex-grow">

        {/* ════════════════ HERO ════════════════ */}
        <section id="home" className="relative min-h-[100svh] flex items-center overflow-hidden pt-20" style={{ background: "linear-gradient(180deg, #1A1030 0%, #2A1750 100%)" }}>
          {/* Parallax background glow layer */}
          <div className="hero-layer-bg absolute inset-0 pointer-events-none">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/15 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-accent-glow/10 blur-3xl" />
          </div>

          <div className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-gutter items-center">
              {/* Left — Text */}
              <div className="hero-layer-text reveal-section [perspective:800px] text-center lg:text-left pt-8 lg:pt-0 relative z-20">
                <span className="reveal-item inline-block px-4 py-1.5 mb-6 bg-primary/20 text-accent-glow font-label-md text-label-md uppercase tracking-widest rounded-full border border-primary/30 backdrop-blur-sm shadow-sm">
                  Bespoke Hair Restoration
                </span>
                <h1 className="reveal-item font-headline-lg-mobile text-[40px] leading-[1.1] md:font-display-lg md:text-display-lg text-on-dark mb-6">
                  Redefining Confidence.<br />
                  <span className="text-accent-glow">Restoring Your Edge.</span>
                </h1>
                <p className="reveal-item font-body-lg text-body-lg text-on-dark-variant mb-10 max-w-xl mx-auto lg:mx-0">
                  Experience the pinnacle of non-surgical hair replacement. Our premium, custom-crafted solutions seamlessly blend with your natural look, offering an undetectable transformation tailored exclusively for you.
                </p>
                <div className="reveal-item flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <MagneticButton onClick={() => scrollTo("contact")} className="bg-primary text-on-primary px-8 py-4 font-label-lg text-label-lg uppercase tracking-widest hover:bg-primary/90 transition-all w-full sm:w-auto text-center font-bold rounded-lg shadow-card hover:shadow-elevated">
                    Book Your Consultation
                  </MagneticButton>
                  <MagneticButton onClick={() => scrollTo("contact")} className="bg-white/10 backdrop-blur-md border border-white/20 text-on-dark px-8 py-4 font-label-lg text-label-lg uppercase tracking-widest hover:border-primary hover:text-accent-glow transition-all w-full sm:w-auto text-center rounded-lg">
                    Explore The Process
                  </MagneticButton>
                </div>
              </div>

              {/* Right — 3D Head (contained block on mobile, side-by-side on desktop) */}
              <div className="hero-layer-subject relative w-full h-[350px] lg:h-[650px] z-10">
                <HeroHead />
                {/* Soft glow behind the head */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary/20 blur-3xl pointer-events-none -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════ TRUST STATS ════════════════ */}
        <section className="stats-bar bg-surface-container border-y border-outline-variant/30 py-8 md:py-10 relative z-30">
          <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-4 md:gap-gutter divide-x divide-outline-variant/30">
              <div className="stat-item flex flex-col items-center justify-center text-center">
                <span className="font-headline-md text-[28px] md:text-headline-md text-primary mb-1 md:mb-2">10+</span>
                <span className="font-label-md md:font-label-lg text-label-md md:text-label-lg text-on-surface-variant uppercase tracking-widest">Years Experience</span>
              </div>
              <div className="stat-item flex flex-col items-center justify-center text-center">
                <span className="font-headline-md text-[28px] md:text-headline-md text-primary mb-1 md:mb-2">5000+</span>
                <span className="font-label-md md:font-label-lg text-label-md md:text-label-lg text-on-surface-variant uppercase tracking-widest">Men Treated</span>
              </div>
              <div className="stat-item col-span-2 md:col-span-1 flex flex-col items-center justify-center text-center pt-6 md:pt-0 border-t md:border-t-0 border-outline-variant/30 md:border-none md:border-l">
                <span className="font-headline-md text-[28px] md:text-headline-md text-primary mb-1 md:mb-2">2</span>
                <span className="font-label-md md:font-label-lg text-label-md md:text-label-lg text-on-surface-variant uppercase tracking-widest">Premium Locations</span>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════ ABOUT ════════════════ */}
        <section id="about" className="py-16 md:py-stack-lg bg-background">
          <div className="w-full max-w-container-max px-margin-mobile md:px-margin-desktop mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-lg items-center">
              <div className="about-layer-text flex flex-col gap-stack-md justify-center reveal-section">
                <div>
                  <h2 className="reveal-item font-display-lg text-display-lg text-on-surface mb-4">Our Legacy</h2>
                  <p className="reveal-item font-body-lg text-body-lg text-on-surface-variant max-w-prose">
                    At Ultimo Capelli, we specialize in premium non-surgical hair replacement solutions, offering high-quality hair wigs, hair patches, and expert replacement services. With a focus on natural appearance, comfort, and long-lasting results, we help you regain confidence with personalized hair solutions tailored to your style and lifestyle.
                  </p>
                </div>

                <div className="reveal-item bg-white p-6 rounded-xl border border-outline-variant/40 shadow-card">
                  <h3 className="font-headline-sm text-headline-sm text-primary mb-4">The Expert Team</h3>
                  <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-gutter">
                    <img 
                      className="w-20 h-20 rounded-xl object-cover shadow-soft" 
                      alt="Our dedicated team" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCALXknGLOw1_1ksWYLjECqM48VzS88JusVEhYrsv_CdnTGlzwjONCG_Ae8sg9kjiSoeaaOq8l__6bnRWU98riFSpXYZsh_-phh51ZZoXG2xe9T7H5VRDr6LjpNV8xmViUwWFz5HhgMllgpsMcI4Kbw4vJTMqJoikS6it8o5IKoeky4BlvWiM_bIyhDiKTTQlIIueDQw5fytnoU8rSOwhpt19_LBzJJv8ibaAYhgneghh2EK7LAnDgY"
                    />
                    <div>
                      <h4 className="font-label-lg text-label-lg uppercase tracking-widest text-on-surface">Our Experienced Team</h4>
                      <p className="font-label-md text-label-md text-primary mt-1 mb-2">Hair Restoration Specialists</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Our dedicated team brings extensive experience in custom hair integration, providing personalized, discreet, and expert care.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative h-[500px] md:h-[600px] w-full rounded-2xl overflow-hidden group shadow-elevated">
                <img 
                  className="parallax-img absolute inset-0 w-full h-[120%] object-cover" 
                  alt="High-end editorial portrait of a confident man" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDt0H2A5CfKdO4H8O9SX_KTV-gGrVdM8Aon5MJTQ7-wKzS0E5rOLC5auEHKouNP7_3LSMwvIeK7sIJTdO7b2sMgTjBCl1SnslxXWYQT2CM-xonv21yZOUcfA_Fyzfh2WERuxODeD2ZTsOFro9ADMz3N0_P5Cwiwuj_-cDQfgpIDWkMv-sRzc7M2QXJG9S1rJ4mavBQS2N6t4YFDtZd3dnI0jRlOmqGCIBF24Oj-8mwy33Oe3sLolMvj"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════ SERVICES ════════════════ */}
        <section id="services" className="py-16 md:py-stack-lg bg-surface">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-stack-md text-center md:text-left reveal-section">
            <h2 className="reveal-item font-display-lg text-headline-lg-mobile md:text-display-lg text-on-surface mb-4">
              Bespoke Restorations
            </h2>
            <p className="reveal-item font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Precision-engineered non-surgical hair replacement systems designed for complete discretion and natural movement.
            </p>
          </div>

          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-3 gap-gutter mb-stack-lg">
            {[
              { icon: "content_cut", title: "Hair Patch", desc: "Targeted restoration for localized balding, specifically crown thinning or receding hairlines. Custom-molded to blend seamlessly with your existing density and texture." },
              { icon: "person", title: "Hair Wig", desc: "Comprehensive coverage for advanced stages of hair loss. Constructed with breathable, micro-mesh bases replicating a natural scalp." },
              { icon: "spa", title: "Maintenance", desc: "Exclusive clinical maintenance ensuring the longevity and pristine condition of your system. Includes cleansing, adjustments, and styling." },
            ].map((service) => (
              <div key={service.title} className="service-card bg-white border border-outline-variant/30 p-8 rounded-xl group hover:shadow-elevated transition-all duration-500 flex flex-col h-full hover-lift">
                <div className="mb-6 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 0" }}>{service.icon}</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3">{service.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-8 flex-grow">{service.desc}</p>
                <div className="font-label-lg text-label-lg uppercase text-primary flex items-center gap-2 group-hover:gap-3 transition-all cursor-pointer">
                  Learn More <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════ 3D TRANSFORMATION (pinned scroll) ════════════════ */}
        <section id="transformation">
          <BeforeAfterHead />
        </section>

        {/* ════════════════ 3D WIG PREVIEWER ════════════════ */}
        <section id="preview" className="py-16 md:py-stack-lg" style={{ background: "linear-gradient(180deg, #1A1030 0%, #2A1750 100%)" }}>
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="text-center md:text-left mb-stack-md reveal-section">
              <h2 className="reveal-item font-display-lg text-headline-lg-mobile md:text-display-lg text-on-dark mb-4">
                Interactive Wig Preview
              </h2>
              <p className="reveal-item font-body-lg text-body-lg text-on-dark-variant max-w-2xl">
                Explore our collection in 3D. Drag to rotate the mannequin, switch between styles, and see how each option looks from every angle.
              </p>
            </div>

            <WigPreviewer />
          </div>
        </section>

        {/* ════════════════ 3D GALLERY ════════════════ */}
        <section id="gallery" className="py-16 md:py-stack-lg bg-background">
          <div className="w-full">
            <div className="mb-8 md:mb-12 text-center max-w-3xl mx-auto reveal-section px-margin-mobile md:px-margin-desktop">
              <h2 className="reveal-item font-display-lg text-[40px] leading-[1.1] md:text-display-lg text-on-surface mb-4">Gallery</h2>
              <p className="reveal-item font-body-lg text-body-lg text-on-surface-variant">A glimpse into our latest work, craft, and transformations.</p>
            </div>

            <VideoGallery />
          </div>
        </section>

        {/* ════════════════ CONTACT ════════════════ */}
        <section id="contact" className="py-16 md:py-stack-lg bg-surface">
          <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
            <div className="mb-stack-md text-center md:text-left reveal-section">
              <h2 className="reveal-item font-display-lg text-headline-lg-mobile md:text-display-lg text-on-surface mb-4">Begin Your Journey</h2>
              <p className="reveal-item font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Reach out to schedule a private consultation. Our specialists are ready to discuss your bespoke restoration plan.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter lg:gap-stack-md">
              {/* Contact form */}
              <div className="bg-white p-8 md:p-10 border border-outline-variant/30 rounded-2xl shadow-card reveal-section h-fit lg:sticky lg:top-32">
                <h3 className="reveal-item font-headline-sm text-headline-sm text-primary mb-6">Request a Callback</h3>
                <form className="space-y-5" onSubmit={handleFormSubmit}>
                  <div className="reveal-item flex flex-col">
                    <label className="font-label-md text-label-md text-on-surface-variant uppercase mb-2" htmlFor="name">Full Name</label>
                    <div className="bg-background border border-outline-variant/50 rounded-lg input-border-focus transition-all flex items-center px-4">
                      <span className="material-symbols-outlined text-on-surface-variant/60 mr-3 text-xl">person</span>
                      <input className="bg-transparent border-none text-on-surface font-body-md w-full py-3.5 focus:ring-0 px-0 outline-none" id="name" name="name" placeholder="John Doe" type="text" required />
                    </div>
                  </div>

                  <div className="reveal-item flex flex-col">
                    <label className="font-label-md text-label-md text-on-surface-variant uppercase mb-2" htmlFor="phone">Phone Number</label>
                    <div className="bg-background border border-outline-variant/50 rounded-lg input-border-focus transition-all flex items-center px-4">
                      <span className="material-symbols-outlined text-on-surface-variant/60 mr-3 text-xl">call</span>
                      <input className="bg-transparent border-none text-on-surface font-body-md w-full py-3.5 focus:ring-0 px-0 outline-none" id="phone" name="phone" placeholder="+91 00000 00000" type="tel" required />
                    </div>
                  </div>

                  <div className="reveal-item flex flex-col">
                    <label className="font-label-md text-label-md text-on-surface-variant uppercase mb-2" htmlFor="service">Service of Interest</label>
                    <div className="bg-background border border-outline-variant/50 rounded-lg input-border-focus transition-all flex items-center px-4 relative">
                      <span className="material-symbols-outlined text-on-surface-variant/60 mr-3 text-xl z-10">medical_services</span>
                      <select className="bg-transparent border-none text-on-surface font-body-md w-full py-3.5 focus:ring-0 px-0 appearance-none z-10 outline-none" id="service" name="service" required>
                        <option value="">Select a service...</option>
                        <option value="Hair Patch">Hair Patch</option>
                        <option value="Hair Wig">Hair Wig</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="General Consultation">General Consultation</option>
                      </select>
                      <span className="material-symbols-outlined text-on-surface-variant/60 absolute right-4 pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  <div className="reveal-item pt-2">
                    <MagneticButton className="w-full bg-primary text-on-primary font-label-lg text-label-lg uppercase py-4 font-bold hover:bg-primary/90 transition-all flex justify-center items-center rounded-lg shadow-soft hover:shadow-card" type="submit">
                      Submit Request <span className="material-symbols-outlined ml-2 text-[20px]">arrow_forward</span>
                    </MagneticButton>
                  </div>
                </form>
              </div>

              {/* Location cards */}
              <div className="flex flex-col space-y-4 reveal-section">
                <div className="reveal-item h-48 lg:h-56 w-full bg-surface-container border border-outline-variant/30 rounded-2xl overflow-hidden relative group cursor-pointer shadow-card">
                  <div 
                    className="parallax-img bg-cover bg-center w-full h-[120%] group-hover:scale-105 transition-transform duration-700" 
                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDnJ5A7WFPexzdUWKdmeL17tlv_wbnDHQqVmmqLRHgvdsDCc_MOcKAR1O24MC9ZgU2nDn_3hpCo2Y_JihgYoC719FRxSSbynSAmPqG58Dn00ZDAJvNujyY778IY2XhfDY0cQgYdU6VgB2iCL8Tg3SLY6DvKDp97LPEhrLUh8SejtaZ6yLAP8ROiGcRiRJ_UwUsF-aVB9fQs1F5sDbC-EVV67AZJWKe07rsyCjWpMlmgZJi2UHRDU0Qj')" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-sm border border-outline-variant/30 px-5 py-2.5 rounded-full flex items-center shadow-soft">
                      <span className="material-symbols-outlined text-primary mr-2">location_on</span>
                      <span className="font-label-md text-label-md uppercase text-on-surface tracking-wider">View Interactive Map</span>
                    </div>
                  </div>
                </div>

                <div className="reveal-item grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-6 border border-outline-variant/30 rounded-xl relative overflow-hidden shadow-card hover-lift">
                    <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
                      <span className="material-symbols-outlined text-9xl text-primary">apartment</span>
                    </div>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">Pune</h4>
                    <p className="font-label-md text-label-md text-primary uppercase tracking-widest mb-4">Maharashtra</p>
                    
                    <div className="mb-5 relative z-10">
                      <h5 className="font-label-lg text-label-lg text-on-surface mb-2 border-b border-outline-variant/20 pb-1">Viman Nagar</h5>
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <span className="material-symbols-outlined text-on-surface-variant/60 text-lg mr-2 mt-0.5">location_on</span>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">Shop No. UG-24, East Court, Phoenix Marketcity, Viman Nagar, Pune 411014, Maharashtra, India</p>
                        </div>
                        <div className="flex items-center">
                          <span className="material-symbols-outlined text-on-surface-variant/60 text-lg mr-2">call</span>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">+91 74477 14555</p>
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10">
                      <h5 className="font-label-lg text-label-lg text-on-surface mb-2 border-b border-outline-variant/20 pb-1">Pimple Saudagar</h5>
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <span className="material-symbols-outlined text-on-surface-variant/60 text-lg mr-2 mt-0.5">location_on</span>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">Shop No. 12, 1st Floor, Spot Mall, Mana-Mandir Society, Pimple Saudagar, Pune 411014, Maharashtra, India</p>
                        </div>
                        <div className="flex items-center">
                          <span className="material-symbols-outlined text-on-surface-variant/60 text-lg mr-2">call</span>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">+91 73919 54555</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 border border-outline-variant/30 rounded-xl relative overflow-hidden shadow-card hover-lift">
                    <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
                      <span className="material-symbols-outlined text-9xl text-primary">apartment</span>
                    </div>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">Bhubaneswar</h4>
                    <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-4">Odisha</p>
                    
                    <div className="mb-5 relative z-10">
                      <h5 className="font-label-lg text-label-lg text-on-surface mb-2 border-b border-outline-variant/20 pb-1">Kharvela Nagar</h5>
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <span className="material-symbols-outlined text-on-surface-variant/60 text-lg mr-2 mt-0.5">location_on</span>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">Infront of Padmalaya Book Store, Plot No.: 65 Janpath Road, Kharvela Nagar, Bhubaneswar – 751001</p>
                        </div>
                        <div className="flex items-center">
                          <span className="material-symbols-outlined text-on-surface-variant/60 text-lg mr-2">call</span>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">74477 14555 | 73919 54555</p>
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10">
                      <h5 className="font-label-lg text-label-lg text-on-surface mb-2 border-b border-outline-variant/20 pb-1">Patia</h5>
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <span className="material-symbols-outlined text-on-surface-variant/60 text-lg mr-2 mt-0.5">location_on</span>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">Plot No.: 516, 3rd Floor, Santi Vihar Kiit Square, Behind Mufti, Patia, Bhubaneswar – 751024</p>
                        </div>
                        <div className="flex items-center">
                          <span className="material-symbols-outlined text-on-surface-variant/60 text-lg mr-2">call</span>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">74477 14555 | 73270 74715</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 border border-outline-variant/30 rounded-xl relative overflow-hidden shadow-card hover-lift md:col-span-2">
                    <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
                      <span className="material-symbols-outlined text-9xl text-primary">apartment</span>
                    </div>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">Nashik</h4>
                    <p className="font-label-md text-label-md text-primary uppercase tracking-widest mb-4">Maharashtra</p>
                    <div className="space-y-2 relative z-10">
                      <div className="flex items-start">
                        <span className="material-symbols-outlined text-on-surface-variant/60 text-lg mr-2 mt-0.5">location_on</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Beside Hari Niwas Society, 1st Floor, Above Chotu Vadapav, Opposite BYK College Main Gate, Nashik, Maharashtra, India</p>
                      </div>
                      <div className="flex items-center">
                        <span className="material-symbols-outlined text-on-surface-variant/60 text-lg mr-2">call</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">084829 54555</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="reveal-item flex flex-col sm:flex-row items-center justify-between bg-white border border-outline-variant/30 p-5 rounded-xl shadow-soft">
                  <div className="flex items-center mb-4 sm:mb-0">
                    <div className="bg-[#25D366]/10 p-3 rounded-xl mr-4">
                      <span className="material-symbols-outlined text-[#25D366]">forum</span>
                    </div>
                    <div>
                      <h4 className="font-label-lg text-label-lg text-on-surface">Prefer instant messaging?</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Our concierge is available on WhatsApp.</p>
                    </div>
                  </div>
                  <MagneticButton onClick={() => window.open('https://wa.me/918482954555?text=Hello,%20I%20would%20like%20to%20know%20more%20about%20your%20services.', '_blank')} className="w-full sm:w-auto border border-[#25D366] text-[#25D366] font-label-md text-label-md uppercase px-6 py-3 hover:bg-[#25D366]/10 transition-colors flex items-center justify-center rounded-lg">
                    Message Us
                  </MagneticButton>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
