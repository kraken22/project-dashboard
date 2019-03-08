require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const verifyToken = require("./verifyToken");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const zipper = require("adm-zip");
const rimraf = require("rimraf");

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use("/", express.static(path.join(__dirname, "projects")));
app.use(express.static(path.join(__dirname, "build")));

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.get("/dashboard/verifyToken", verifyToken, (req, res) => {
  res.send({
    status: "success"
  });
});

app.get("/dashboard/projects", verifyToken, (req, res) => {
  res.send({
    status: "success",
    data: loadDatabase()
  });
});

app.post("/dashboard/projects/new", verifyToken, (req, res) => {
  try {
    if (req.body.endpoint.indexOf(" ") !== -1)
      throw Error("Endpoints cannot contain spaces");
    const endpoint = encodeURIComponent(req.body.endpoint.toLowerCase().trim());
    const database = loadDatabase();
    if (database.filter(d => d.endpoint === endpoint).length > 0)
      throw Error("endpoints must be unique");
    database.push({
      name: req.body.name,
      endpoint
    });
    updateDatabase(database);
    res.send({
      status: "success",
      data: database
    });
  } catch (error) {
    res.send({
      status: "error",
      data: error.message
    });
  }
});

app.post("/dashboard/projects/delete", verifyToken, (req, res) => {
  try {
    const endpoint = req.body.endpoint;
    if (fs.existsSync(path.join(__dirname, "projects", endpoint))) {
      rimraf.sync(path.join(__dirname, "projects", endpoint));
    }
    let database = loadDatabase();
    database = database.filter(val => val.endpoint !== endpoint);
    updateDatabase(database);
    res.send({
      status: "success",
      data: database
    });
  } catch (error) {
    res.send({
      status: "error",
      data: error.message
    });
  }
});

app.post(
  "/dashboard/projects/:endpoint/newVersion",
  verifyToken,
  (req, res) => {
    try {
      const endpoint = req.params.endpoint;
      const folderPath = path.join(__dirname, "projects", endpoint);
      if (fs.existsSync(folderPath)) {
        rimraf.sync(folderPath);
      }
      fs.mkdirSync(folderPath);
      if (req.files.file === undefined) throw Error("no file uploaded");
      fs.writeFileSync(folderPath + "/data.zip", req.files.file.data);
      const zip = new zipper(folderPath + "/data.zip");
      zip.extractAllTo(folderPath, true);
      fs.unlinkSync(folderPath + "/data.zip");
      res.send({
        status: "success"
      });
    } catch (error) {
      res.send({
        status: "error",
        data: error.message
      });
    }
  }
);

app.post("/dashboard/login", (req, res) => {
  try {
    if (req.body.username !== process.env.ADMINUSERNAME)
      throw Error("Incorrect username or password");
    if (req.body.password !== process.env.ADMINPASSWORD)
      throw Error("Incorrect username or password");

    const jwtToken = jwt.sign({ type: "admin" }, process.env.JWTSECRETKEY, {
      expiresIn: "1h"
    });
    res.send({
      status: "success",
      data: jwtToken
    });
  } catch (error) {
    res.send({
      status: "error",
      data: error.message
    });
  }
});

app.listen(7001);

function loadDatabase() {
  return JSON.parse(fs.readFileSync("./projects/database.json"));
}

function updateDatabase(newDatabase) {
  fs.writeFileSync("./projects/database.json", JSON.stringify(newDatabase));
}
