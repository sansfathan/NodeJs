const { where } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const sendEmailHandle = require("../mail");
const crypto = require("crypto");
const UserModel = require("../models").user;
require("dotenv").config();

async function register(req, res) {
  try {
    const payload = req.body;
    const { nama, email, password, role } = payload;
    let hashPassword = await bcrypt.hashSync(password, 10);

    await UserModel.create({
      nama,
      email,
      password : hashPassword,
      role,
    });
    if (email === null) {
      return res.status(422).json({
        status: "Fail",
        msg: "Email kosong Silakan di isi",
      });
    }
    res.json({
      status: "Success",
      msg: "Register Berhasil",
    });
  } catch (err) {
    res.status(403).json({
      status: "Fail",
      msg: "Ada Kesalahan",
      err,
    });
  }
}

async function login(req, res) {
  try {
    const payload = req.body;
    const { email, password } = payload;
    const user = await UserModel.findOne({
      where: {
        email: email,
      },
    });
    if (user === null) {
      return res.status(422).json({
        status: 422,
        msg: 'Email tidak ditemukan silahkan register',
      });
    }
    if (password === null) {
      return res.status(422).json({
        status: 422,
        msg: 'Email & Password tidak dicocok',
      });
    }
    
    const verify = await bcrypt.compareSync(password, user.password);

    if (verify === false) {
      return res.status(422).json({
        status: "Fail",
        msg: "Email dan Password Tidak Cocok",
      });
    }

    const token = jwt.sign(
      {
        id: user?.id,
        role: user?.role,
        email: user?.email,
        nama: user?.nama,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    
    res.json({
      status: "Success",
      msg: "Login Berhasil",
      user: user,
      token
    });
  } catch (err) {
    res.status(403).json({
      status: "Fail",
      msg: "Ada Kesalahan",
      err,
    });
  }
}

module.exports = { register, login };
