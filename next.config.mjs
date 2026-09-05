/** @type {import('next').NextConfig} */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: (() => {
      let hostname = "*.supabase.co";
      let protocol = "https";
      try {
        const u = new URL(SUPABASE_URL || "https://placeholder.supabase.co");
        hostname = u.hostname;
        protocol = u.protocol.replace(":", "");
      } catch {
        // keep default
      }
      return [{ protocol, hostname }];
    })(),
  },
};

export default nextConfig;
