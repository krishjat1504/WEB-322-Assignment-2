/********************************************************************************
 *  WEB322 – Assignment 02
 *
 *  I declare that this assignment is my own work in accordance with Seneca's
 *  Academic Integrity Policy.
 *
 *  Name: Krish Jat  Student ID:102543246   Date: 2025-11-11
 ********************************************************************************/



const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// View engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Load data
const projects = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "projects.json"), "utf-8")
);

// Helpers
const bySector = (sector) =>
  projects.filter((p) => p.sector.toLowerCase() === sector.toLowerCase());
const byId = (id) => projects.find((p) => p.id === Number(id));

// Routes
// Home: show one featured project per sector
app.get("/", (req, res) => {
  const featuredSectors = ["Agriculture", "Electricity", "Transportation"];
  const featured = featuredSectors
    .map((sec) => projects.find((p) => p.sector.toLowerCase() === sec.toLowerCase()))
    .filter(Boolean); // skip sectors with no project
  res.render("home", { page: "/", featured });
});

app.get("/about", (req, res) => {
  res.render("about", { page: "/about" });
});

// List all projects, optionally filtered by sector
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
      sector: sector || "All",
    });
  } catch (e) {
    res.status(404).render("404", { page: "", message: e.message });
  }
});

// Project details
app.get("/solutions/projects/:id", (req, res) => {
  try {
    const project = byId(req.params.id);
    if (!project) {
      return res
        .status(404)
        .render("404", { page: "", message: `Project ${req.params.id} not found.` });
    }
    // Keep Projects tab active in navbar on details page
    res.render("project", { page: "/solutions/projects", project });
  } catch (e) {
    res.status(404).render("404", { page: "", message: e.message });
  }
});

// 404 (last)
app.use((req, res) => {
  res
    .status(404)
    .render("404", {
      page: "",
      message: "I'm sorry, we're unable to find what you're looking for.",
    });
});

// Local run
if (require.main === module) {
  app.listen(HTTP_PORT, () =>
    console.log(`Server listening on http://localhost:${HTTP_PORT}`)
  );
}

module.exports = app;
