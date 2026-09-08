"use client";

import React, { useEffect, useRef } from "react";
import { animatePageEntrance } from "@/app/lib/gsap";

interface GsapPageWrapperProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}

export default function GsapPageWrapper({
  children,
  className = "",
  stagger = 0.08,
  delay = 0.1,
}: GsapPageWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    animatePageEntrance(containerRef.current, { stagger, delay });
  }, [stagger, delay]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
