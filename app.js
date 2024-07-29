const express = require("express");
const path = require("path");
const app = express();
//const passport = require('./middleware/passportMiddleware');
const fs = require("fs").promises;
const { v4: uuidv4 } = require("uuid");
require('dotenv').config();
const bodyParser = require("body-parser");
const routerProjects = require('./routes/projects');
const routerAuth = require("./routes/auth");
const authMiddleware = require('./middleware/authMiddleware');

const mongoose = require("mongoose");
const mongoDBConnectionString =
  "mongodb://root:1234@localhost:27017/app?authSource=admin";
mongoose.set("strictQuery", false);

const Project = require("./models/project");

app.use(express.json());
app.use(express.static(path.resolve("public")));
app.use(bodyParser.urlencoded({ extended: false, limit: "1mb" }));
app.use('/projects', routerAuth);
app.use('/api/projects', authMiddleware, routerProjects);
app.use('/api/auth', routerAuth);
//app.use('/api/projects', passport.authenticate('jwt', { session: false}), routerProjects);
app.use('/api/auth', routerAuth);
app.use("/img", express.static(path.resolve("img")));
//app.use(passport.initialize());

const projects = [
  { id: "1", name: "Valery", title: "GIT" },
  { id: "2", name: "Valery", title: "HTML5" },
  { id: "3", name: "Valery", title: "CSS" },
  { id: "4", name: "Valery", title: "JavaScript" },
  { id: "5", name: "Valery", title: "Node.js" },
];

app.get("/api/projects" ,async (req, res) => {
  //console.log(req.query.id);

  const projects = await Project.find();
  res.json(projects);
});

app.get("/api/projects/:id", async (req, res) => {
  //console.log(req.query.id);
  const project = await Project.findById(req.params.id);
  if (project) {
    await project.save();
    res.json(project);
    return;
  }
  res.status(400);
  res.end();
});

app.post("/api/projects", async function (req, res) {
  try {
    const project = new Project(req.body);
    if (await project.save()) {
      res.json({ result: true, ...project.toObject });
    } else {
      throw new Error("Не удалось сохранить проект в БД.");
    }
  } catch (err) {
    console.log(err);
    res.json({ result: "false" });
  }

});

app.put("/api/projects/:id", async function (req, res) {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      upsert: true,
      overwrite: true,
      runValidators: true,
    });
    if (project && project.isNew === false) {
      res.status(204);
      res.end();
      return;
    } else {
      res.setHeader("Location", `/api/projects/${req.params.id}`);
      res.status(201);
      res.end();
      return;
    }
  } catch (err) {
    // console.log(err);
    res.status(400);
    res.end();
    return;
  }
});

app.patch("/api/projects/:id", async function (req, res) {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (project) {
      res.status(200);
      res.json(project);
      return;
    }
  } catch (err) {
    // console.log(err);
    res.status(400);
    res.end();
    return;
  }
  res.status(400);
  res.end();
  return;
  // if (req.body && req.body.title) {
  //   if (isProjectExists(projects, req.params.id)) {
  //     const index = getProjectIndex(projects, req.params.id);
  //     if (index !== -1) {
  //       projects[index] = {
  //         ...projects[index],
  //         ...req.body,
  //         id: req.params.id,
  //       };
  //     }
  //     res.status(200);
  //     res.json(projects[index]);
  //     return;
  //   }
  // }
  // res.status(400);
  // res.end();
});

app.delete("/:id", async function (req, res) {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (project) {
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

const start = async () => {
  try {
    await mongoose.connect(mongoDBConnectionString).then(() => {
      console.log("MongoDB.Успешное соединение");
    });
    app.listen(3000, () => {
      console.log(`http://localhost:3000/`);
    });
  } catch (err) {
    console.log("MongoDB.Ошибка соединение");
    console.error(err);
    process.exit(1);
  }
};

start();

//Ctr-c
process.on("SIGINT", async () => {
  await mongoose.disconnect();
  console.log("Приложение завершило работу");
  process.exit(0);
});

function getProjectIndex(projects, id) {
  return projects.map((item) => item.id).indexOf(id);
}

function isProjectExists(projects, id) {
  const index = getProjectIndex(projects, id);
  return index !== -1;
}
