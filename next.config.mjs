/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Esta parte soluciona los errores de dependencias de MetaMask y WalletConnect
    webpack: (config) => {
        config.resolve.fallback = { fs: false, net: false, tls: false };
        config.externals.push('pino-pretty', 'lokijs', 'encoding');
        return config;
    },
};

export default nextConfig;
