const express = require("express");
const path = require("path");
// const fs = require('fs');
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const multer = require("multer");
const { register, login } = require("../controllers/AuthController");
// const { createMateriMulti, UpdateMateri } = require("../controllers/materiController");
const jwtValidateMidlleWare = require("../middleware/jwtMiddleware");
const {
  createMateriMulti,
  updateMateri,
  deleteMateriMulti,
  getMateriGuru,
  getMateriSiswa,
} = require("../controllers/materiController");
// const validationResultMiddleware = require("../middleware/validatorResult");

router.post("/register", register);
router.post("/login", login);

router.use(jwtValidateMidlleWare);
//materi
router.post("/materi/createMateri", createMateriMulti);
router.put("/materi/updateMateri", updateMateri);
router.delete("/materi/deleteMateri", deleteMateriMulti);
router.get("/materi/getMateriS", getMateriSiswa);
router.get("/materi/getMateriG", getMateriGuru);

module.exports = router;
