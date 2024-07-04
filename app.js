const express = require("express");
const path = require("path");
const app = express();
const fs = require("fs").promises;
const { v4: uuidv4 } = require("uuid");
const bodyParser = require("body-parser");

app.use(express.json());
app.use(express.static(path.resolve("public")));
app.use(bodyParser.urlencoded({ extended: false, limit: "1mb" }));

const projects = [
  { id: "1", name: "Valery", title: "GIT" },
  { id: "2", name: "Valery", title: "HTML5" },
  { id: "3", name: "Valery", title: "CSS" },
  { id: "4", name: "Valery", title: "JavaScript" },
  { id: "5", name: "Valery", title: "Node.js" },
];

app.get("/", function (req, res) {
  // express.static(path.resolve('public')));
  //res.send('Hello SWorld')
  //  res.status(200);
  //  res.json({test: 'es'})
  fs.readFile(path.join(__dirname, "index.html")) //"public"
    .then((contents) => {
      res.setHeader("Content-Type", "text/html");
      //res.writeHead(200);
      res.status(200);
      res.end(contents);
    })
    .catch((error) => {
      res.writeHead(500);
      res.end(error);
      return;
    });
});

app.get("/api/projects", (req, res) => {
  //console.log(req.query.id);

  res.json(projects);
});

app.post("/api/projects", function (req, res) {
  // console.log(req.body);
  //res.send('Hello World')
  if (req.body && req.body.title) {
    const item = {
      id: uuidv4(),
      name: req.name,
      title: req.body.title,
    };
    projects.push(item);
    res.json({ result: true, ...item });
    return;
  }
  res.json({ result: false });
  //  res.status(200);
  // res.json({test: 'POST'})
});

app.put("/api/projects/:id", function (req, res) {
  // console.log(req.body);
  //res.send('Hello World')
  if (req.body && req.body.title) {
    if (isProjectExists(projects, req.params.id)) {
      const index = getProjectIndex(projects, req.params.id);
      if (index !== -1) {
        projects[index] = {
          id: req.params.id,
          ...req.body,
        };
      }
      res.status(204);
      res.end();
      return;
    } else {
      const item = {
        id: uuidv4(),
        name: req.name,
        title: req.body.title,
      };

      projects.push(item);
      res.setHeader("Location", `/api/projects/${item.id}`);
      res.status(201);
      res.end();
      return;
    }
  }
  res.status(400);
  res.end();
});

app.patch("/api/projects/:id", function (req, res) {
  if (req.body && req.body.title) {
    if (isProjectExists(projects, req.params.id)) {
      const index = getProjectIndex(projects, req.params.id);
      if (index !== -1) {
        projects[index] = {
          ...projects[index],
          ...req.body,
          id: req.params.id,
        };
      }
      res.status(200);
      res.json(projects[index]);
      return;
    } 
  }
  res.status(400);
  res.end();
});

app.delete("/:id", function (req, res) {
  const index = getProjectIndex(projects, req.params.id);
  if (index !== -1) {
    projects.splice(index, 1);
    res.status(204);
    res.end();
    return;
  }
  res.status(400);
  res.end();
});

app.delete("/:id", function (req, res) {
  const index = getProjectIndex(projects, req.params.id);
  if (index !== -1) {
    projects.splice(index, 1);
    res.status(204);
    res.end();
    return;
  }
  res.status(400);
  res.end();
});

//app.use("/projects", routerProjects);

// app.use(express.static('public'));
//app.use(express.static(path.resolve('public')));

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500);
  res.send("Сервер недоступен");
});

app.listen(3000, () => {
  console.log(`http://localhost:3000/`);
});

function getProjectIndex(projects, id) {
  return projects.map((item) => item.id).indexOf(id);
}

function isProjectExists(projects, id){
  const index = getProjectIndex(projects, id);
  return index !== -1;
}