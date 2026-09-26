import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["framer-motion", "lucide-react", "@react-three/fiber", "@react-three/drei"],

  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/register/agent",
        destination: "/register-agent",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;