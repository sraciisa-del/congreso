/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Permite build aunque haya errores de lint
  },
};

export default nextConfig;
