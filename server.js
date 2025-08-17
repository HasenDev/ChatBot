const { createServer } = require("http");
const next = require("next");
const port = parseInt(process.env.PORT || "9700", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, '0.0.0.0', () => {
    console.log(`Next.js is ready on http://0.0.0.0:${port}`);
  });
});
