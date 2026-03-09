const express = require("express");
const path = require("path");
const fs = require("fs");

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "5000", 10);

if (dev) {
  const next = require("next");
  const nextApp = next({ dev });
  const handle = nextApp.getRequestHandler();

  nextApp.prepare().then(() => {
    const server = express();
    const backendApp = require("./backend/src/server");
    server.use("/api", backendApp);
    server.all("/{*path}", (req, res) => handle(req, res));
    server.listen(port, "0.0.0.0", () => {
      console.log(`> Server ready on http://0.0.0.0:${port}`);
    });
  });
} else {
  const server = express();

  const backendApp = require("./backend/src/server");
  server.use("/api", backendApp);

  const nextDir = path.resolve(__dirname, ".next");
  const appDir = path.resolve(nextDir, "server", "app");

  server.use("/_next/static", express.static(path.join(nextDir, "static"), {
    maxAge: "365d",
    immutable: true,
  }));

  function sendHtml(res, filename) {
    const filePath = path.join(appDir, filename);
    if (fs.existsSync(filePath)) {
      res.type("html").send(fs.readFileSync(filePath, "utf-8"));
    } else {
      res.status(404).type("html").send(fs.readFileSync(path.join(appDir, "_not-found.html"), "utf-8"));
    }
  }

  function sendRsc(res, filename) {
    const rscFile = path.join(appDir, filename);
    const metaFile = path.join(appDir, filename.replace(".rsc", ".meta"));
    if (fs.existsSync(rscFile)) {
      if (fs.existsSync(metaFile)) {
        try {
          const meta = JSON.parse(fs.readFileSync(metaFile, "utf-8"));
          if (meta.headers) {
            for (const [key, value] of Object.entries(meta.headers)) {
              res.setHeader(key, value);
            }
          }
        } catch (e) {}
      }
      res.type("text/x-component").send(fs.readFileSync(rscFile, "utf-8"));
    } else {
      res.status(404).send("");
    }
  }

  const staticRoutes = [
    "login", "dashboard", "articles", "variants", "fabric",
    "accessories", "import", "reports", "settings", "users"
  ];

  server.get("/", (req, res) => {
    res.redirect(302, "/login");
  });

  for (const route of staticRoutes) {
    server.get(`/${route}`, (req, res) => {
      if (req.headers["rsc"] === "1") {
        return sendRsc(res, `${route}.rsc`);
      }
      sendHtml(res, `${route}.html`);
    });
  }

  server.get("/articles/:id", (req, res) => {
    if (req.headers["rsc"] === "1") {
      return sendRsc(res, "articles.rsc");
    }
    sendHtml(res, "articles.html");
  });

  server.get("/_next/data/{*path}", (req, res) => {
    res.json({});
  });

  server.use((req, res) => {
    sendHtml(res, "_not-found.html");
  });

  server.listen(port, "0.0.0.0", () => {
    console.log(`> Server ready on http://0.0.0.0:${port}`);
  });
}
