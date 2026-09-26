declare module "next-pwa" {
  interface PWAOptions {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    [key: string]: unknown;
  }

  function withPWA(options: PWAOptions): (nextConfig: unknown) => unknown;

  export default withPWA;
}
