// app/page.tsx
// Server Component — stays free of "use client" so metadata, etc. still
// work normally here. All ssr:false dynamic imports live in HomeClient.
import { HomeClient } from "./components/HomeClient";

export default function HomePage() {
  return <HomeClient />;
}