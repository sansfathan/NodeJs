const http = require("http");
const express = require("express");

const dayjs = require("dayjs");
const app = express();
const { sequelize } = require("./src/models");
// const bodyParse = require("body-parser")
require("dotenv").config();
const port = process.env.PORT || 8087;

const router = require("./src/routes/routers");
// const br = require("./src/routes/app")
const notfound = require("./src/middleware/404.js");
const console1 = require("./src/middleware/consoleMiddleware");
const console2 = require("./src/middleware/consoleMiddleware2");
const errorHandler = require("./src/middleware/errorHandling");
const autMiddleware = require("./src/middleware/authMiddleware.js");
const example = require("./example.js");
const moment = require("moment/moment.js");
const authMiddleware = require("./src/middleware/authMiddleware");
const log = require("./src/middleware/log");
const paginationMiddleware = require("./src/middleware/pageSizeMiddleware");
// app.use(autMiddleware)

app.use(express.json());
app.use(express.static("src/storage/uploads"));
app.use(console2);
app.use(console1);
app.use(paginationMiddleware)

app.use(router);
app.use(notfound);
app.listen(port, async () => {
  try {
    await sequelize.authenticate();
    console.log(`Server berjalan di http://localhost:${port}`);

    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("🚫 ➤➤➤ Unable to connect to the database:", error);
  }
});
