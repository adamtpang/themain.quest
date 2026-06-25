/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This project has its own lockfile; pin tracing here so a parent-folder
  // lockfile doesn't get picked as the workspace root.
  outputFileTracingRoot: import.meta.dirname,
};

export default nextConfig;
