// Entry point for Hostinger's shared-hosting Node.js app manager, which
// runs apps via Phusion Passenger rather than `next start` directly.
// Passenger expects a script that starts an HTTP server listening on
// process.env.PORT — this wraps Next's programmatic API to do that.
// Local dev still uses `next dev` (see package.json); this file is only
// exercised in production, after `npm run build`.
const { createServer } = require("http");
const next = require("next");

const port = process.env.PORT || 3000;
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`Ready on port ${port}`);
  });
});
