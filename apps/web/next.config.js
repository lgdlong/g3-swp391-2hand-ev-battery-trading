/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Strict whitelist of allowed image domains (security best practice)
    domains: [
      'res.cloudinary.com', // Cloudinary CDN
      'lh3.googleusercontent.com', // Google OAuth avatars
      'avatar.iran.liara.run', // Default avatar service
    ],
    // Use remotePatterns for more control (only for specific trusted domains)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatar.iran.liara.run',
        pathname: '/public/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
    ],
  },
  // Security headers including CSP
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval/inline
              "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
              "img-src 'self' data: https: blob:", // Allow images from https sources
              "font-src 'self' data:",
              "connect-src 'self' http://localhost:8000 ws://localhost:8000 https: wss:", // API + WebSocket connections
              "frame-src 'none'", // Prevent clickjacking
              "object-src 'none'", // Block plugins
              "base-uri 'self'", // Prevent base tag injection
              "form-action 'self'", // Restrict form submissions
              'upgrade-insecure-requests', // Upgrade HTTP to HTTPS
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Prevent clickjacking
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Prevent MIME sniffing
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
