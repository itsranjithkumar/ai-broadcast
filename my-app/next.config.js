/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Add other configurations here if needed
  env: {
    // This makes the ELEVENLABS_API_KEY available to the browser
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
  },
  // This is required to make environment variables available in the browser
  // when using Next.js API routes
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

module.exports = nextConfig;
