"use client";
import React, { useRef, useState, MouseEvent } from "react";

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function MagneticButton({ children, className = "", ...props }: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [transform, setTransform] = useState("translate(0px, 0px)");

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const distanceX = Math.max(-12, Math.min(12, x * 0.3));
    const distanceY = Math.max(-12, Math.min(12, y * 0.3));

    setTransform(`translate(${distanceX}px, ${distanceY}px)`);
  };

  const handleMouseLeave = () => {
    setTransform("translate(0px, 0px)");
  };

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-300 ease-out ${className}`}
      style={{ transform }}
      {...props}
    >
      {children}
    </button>
  );
}
