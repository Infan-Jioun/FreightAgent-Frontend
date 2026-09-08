/**
 * Single source of truth for the site's horizontal container.
 *
 * Taken directly from Navbar.tsx's nav pill (`mx-auto max-w-[1200px]`,
 * `px-4 md:px-5`). Every section should import CONTAINER_CLASS from here
 * instead of hardcoding its own max-w/px values — that's what was causing
 * sections to drift out of alignment with the navbar in the first place.
 *
 * Usage:
 *   import { CONTAINER_CLASS } from "@/app/constants/layout";
 *   <div className={CONTAINER_CLASS}>...</div>
 */
export const CONTAINER_CLASS = "max-w-[1240px] mx-auto px-4 sm:px-6";