module.exports = {
  outputFileTracingRoot: __dirname,
  // The root ESLint configuration uses the library TypeScript project, which excludes this JS consumer.
  eslint: { ignoreDuringBuilds: true },
  // Keep this small integration consumer usable on constrained CI workers.
  experimental: { cpus: 1 },
};
