/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        // /embed is meant to be framed on arbitrary client domains (that's its entire
        // purpose — see app/embed/). Nothing else in the site sets X-Frame-Options or a
        // frame-ancestors CSP today (default browser behavior already allows framing
        // everywhere), so this header changes no existing behavior. It's here as an
        // explicit, forward-compatible statement of intent: if framing restrictions are
        // ever added elsewhere on the site later, this route is documented as the one
        // that must stay embeddable everywhere.
        source: "/embed",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors *" },
        ],
      },
    ];
  },
};

export default nextConfig;
