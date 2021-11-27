require("dotenv").config();

let { router } = require("./routes/index");
let cors = require("cors");

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

// require("./db");

// require("./api/telegram");

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use("/api", router);
app.use(express.static(path.resolve(__dirname, "../client/build")));
app.use(express.static("build"));

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
