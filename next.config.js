/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== "production";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""} https://checkout.razorpay.com https://*.razorpay.com`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "frame-src https://api.razorpay.com https://checkout.razorpay.com",
  "img-src 'self' data: blob: https:",
  `connect-src 'self' ${isDev ? "ws: http://localhost:* http://127.0.0.1:*" : ""} https://api.razorpay.com https://*.razorpay.com https://apiv2.shiprocket.in`,
].join("; ");

const nextConfig = {
  images: {
    domains: [
      "m.media-amazon.com",
      "lh3.googleusercontent.com",
      "res.cloudinary.com",
      "firebasestorage.googleapis.com",
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: csp,
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
