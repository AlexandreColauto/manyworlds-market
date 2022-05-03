/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: [
    {
      test: "test",
      AWS_ACCESS_KEY_ID_MYAPP: process.env.AWS_ACCESS_KEY_ID_MYAPP,
      AWS_SECRET_ACCESS_KEY_MYAPP: process.env.AWS_SECRET_ACCESS_KEY_MYAPP,
      AWS_BUCKET_MYAPP: process.env.AWS_BUCKET_MYAPP,
      AWS_REGION_MYAPP: process.env.AWS_REGION_MYAPP,
    },
  ],
};

module.exports = nextConfig;
