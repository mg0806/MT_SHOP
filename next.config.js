const { domainToASCII } = require("url");

/** @type {import('next').NextConfig} */
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
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://*.razorpay.com; frame-src https://api.razorpay.com https://checkout.razorpay.com; img-src 'self' data: blob: https:; connect-src 'self' https://api.razorpay.com https://*.razorpay.com https://apiv2.shiprocket.in;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
