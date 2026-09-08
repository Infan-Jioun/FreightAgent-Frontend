import gsap from "gsap";

/**
 * Initializes and configures GSAP for client-side animations.
 */
export const initGsap = () => {
  if (typeof window !== "undefined") {
    gsap.defaults({
      ease: "power3.out",
      duration: 0.8,
    });
  }
};

/**
 * Animate page entrance with a staggered reveal of elements.
 */
export const animatePageEntrance = (
  containerRef: HTMLElement | null,
  options?: {
    stagger?: number;
    delay?: number;
    yOffset?: number;
  }
) => {
  if (!containerRef || typeof window === "undefined") return;

  const elements = containerRef.querySelectorAll(".gsap-reveal");
  if (!elements || elements.length === 0) return;

  gsap.fromTo(
    elements,
    {
      opacity: 0,
      y: options?.yOffset ?? 28,
    },
    {
      opacity: 1,
      y: 0,
      stagger: options?.stagger ?? 0.1,
      delay: options?.delay ?? 0.1,
      duration: 0.8,
      ease: "power3.out",
      clearProps: "transform",
    }
  );
};

export { gsap };
