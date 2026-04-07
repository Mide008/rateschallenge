/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    "@sparticuz/chromium-min", 
    "puppeteer-core",
    "@react-pdf/renderer"
  ],
}

export default nextConfig;