/********************************************************************************
 *  WEB322 – Assignment 02
 *
 *  I declare that this assignment is my own work in accordance with Seneca's
 *  Academic Integrity Policy.
 *
 *  Name: YOUR_NAME_HERE  Student ID: YOUR_ID  Date: YYYY-MM-DD
 ********************************************************************************/
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// View engine (works locally and on Vercel)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Static files
app.use(express.static("public"));

// Load data (sync is fine for A2)
const projects = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "projects.json"), "utf-8")
);

// Helpers
const bySector = (sector) =>
  projects.filter((p) => p.sector.toLowerCase() === sector.toLowerCase());
const byId = (id) => projects.find((p) => p.id === Number(id));

// Routes
app.get("/", (req, res) => {
  res.render("home", { page: "/", projects: projects.slice(0, 3) });
});

app.get("/about", (req, res) => {
  res.render("about", { page: "/about" });
});

app.get("/solutions/projects", (req, res) => {
  try {
    let list = projects;
    const { sector } = req.query;
    if (sector) {
      list = bySector(sector);
      if (!list.length) {
        return res
          .status(404)
          .render("404", { page: "", message: `No projects in "${sector}".` });
      }
    }
    res.render("projects", {
      page: "/solutions/projects",
      projects: list,
      sector: sector || "All"
    });
  } catch (e) {
    res.status(404).render("404", { page: "", message: e.message });
  }
});

app.get("/solutions/projects/:id", (req, res) => {
  try {
    const project = byId(req.params.id);
    if (!project) {
      return res
        .status(404)
        .render("404", { page: "", message: `Project ${req.params.id} not found.` });
    }
    res.render("project", { page: "", project });
  } catch (e) {
    res.status(404).render("404", { page: "", message: e.message });
  }
});

// 404 (last)
app.use((req, res) => {
  res
    .status(404)
    .render("404", { page: "", message: "I'm sorry, we're unable to find what you're looking for." });
});

// Local run (Vercel ignores this and uses the exported app)
if (require.main === module) {
  app.listen(HTTP_PORT, () =>
    console.log(`Server listening on http://localhost:${HTTP_PORT}`)
  );
}
module.exports = app;
