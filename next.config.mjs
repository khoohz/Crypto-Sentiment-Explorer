/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i-invdn-com.investing.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "investing.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
