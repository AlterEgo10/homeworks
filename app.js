const express = require("express");
const path = require("path");
const app = express();

require("dotenv").config();
const bodyParser = require("body-parser");
const routerProjects = require("./routes/projects");
const routerComments = require("./routes/comments");
const routerAuth = require("./routes/auth");
const authMiddleware = require("./middleware/authMiddleware");

const mongoose = require("mongoose");
const mongoDBConnectionString = process.env.MONGO_DB_URL;
mongoose.set("strictQuery", false);

app.use(express.json());
app.use(express.static(path.resolve("public")));
app.use(bodyParser.urlencoded({ extended: false, limit: "1mb" }));

app.use("/api/projects", authMiddleware, routerProjects);
app.use("/api/comments", routerComments);
app.use("/api/auth", routerAuth);
app.use("/img", express.static(path.resolve("img")));
app.use("/font", express.static(path.resolve("font")));
app.use((err, req, res, next) => {
  //console.log(err.stack);
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
