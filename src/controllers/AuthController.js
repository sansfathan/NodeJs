const UserModel = require("../models").user;
const ForgotPasswordModel = require("../models").password;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmailHandle = require("../mail");
const crypto = require("crypto");
const dayjs = require("dayjs");
const user = require("../models/user");
require("dotenv").config();

async function register(req, res) {
  try {
    const payload = req.body;
    const { nama, email, password } = payload;

    let hashPassword = await bcrypt.hashSync(password, 10);

    await UserModel.create({
      nama,
      email,
      password: hashPassword,
    });
    res.json({
      status: "Success",
      msg: "Register Berhasil",
      data:user,
    });
  } catch (err) {
    res.status(403).json({
      status: "Fail",
      msg: "Ada Kesalahan",
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
        status: "Fail",
        msg: "Email Tidak ditemukan, Silahkan Register",
      });
    }

    if (password === null) {
      return res.status(422).json({
        status: "Fail",
        msg: "Email dan Password Tidak Cocok",
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
      token: token,
      user: user,
    });
  } catch (err) {
    res.status(403).json({
      status: "Fail",
      msg: "Ada Kesalahan",
      err
    });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    //cek apakah user dengan email tsb terdaftar
    const user = await UserModel.findOne({
      where: {
        email: email,
      },
    });

    //jika tidak terdaftar berikan response dengan msg email tidak terdaftar
    if (user === null) {
      res.status(422).json({
        status: "Fail",
        msg: "Email Tidak ditemukan, silahkan gunakan email yg terdaftar",
      });
    }
    // cek apakah token sudah pernah dibuat pada user tsb di table forgot password
    const currentToken = await ForgotPasswordModel.findOne({
      where: {
        userId: user.id,
      },
    });
    //jika ada, hapus yg ada
    if (currentToken !== null) {
      await ForgotPasswordModel.destroy({
        where: {
          userId: user.id,
        },
      });
    }
    // jika belum buat token
    const token = crypto.randomBytes(32).toString("hex");
    const date = new Date();
    const expire = date.setHours(date.getHours() + 1);

    await ForgotPasswordModel.create({
      userId: user.id,
      token: token,
      expireDate: dayjs(expire).format("YYYY-MM-DD HH:mm:ss"),
    });

    const context = {
      link: `${process.env.MAIL_CLIENT_URL}/reset-password/${user.id}/${token}`,
    };
    const sendMail = await sendEmailHandle(
      email,
      "lupa password",
      "lupaPassword",
      context
    );
    if (sendMail === "success") {
      res.json({
        status: "Success",
        msg: "silahkan cek email",
      });
    } else {
      res.status(403).json({
        status: "Fail",
        msg: "Gunakan email yg terdaftar",
      });
    }
  } catch (err) {
    res.status(404).json({
      status: "Fail",
      msg: "ada kesalahan",
    });
  }
}

async function resetPassword(req, res) {
  try {
    let { newPassword } = req.body;
    let { userId, token } = req.params;
    // -  cek apakah token dan userId ada di tabel
    const currentToken = await ForgotPasswordModel.findOne({
      where: { userId: userId, token: token },
    });

    const user = await UserModel.findOne({
      where: {
        id: userId,
      },
    });
    //jika gk ada berikan response token tidak valid
    if (currentToken === null) {
      res.status(403).json({
        msg: "token invalid",
      });
    } else {
      let userExpired = currentToken.expiredDate;
      let expire = dayjs(Date());
      let difference = expire.diff(userExpired, "hour");
      // - cek apakah sudah expire
      // jika sudah expire berikan respinse token sudah expire
      if (difference !== 0) {
        res.json({
          status: "Fail",
          msg: "Token has expired",
        });
      } else {
        let hashPassword = await bcrypt.hash(newPassword, 10);
        await UserModel.update(
          { password: hashPassword },
          {
            where: {
              id: user.id,
            },
          }
        );
        await ForgotPasswordModel.destroy({ where: { token: token } });
        res.json({
          status: "success",
          msg: "password updated",
        });
      }
    }
  } catch (err) {
    console.log("err", err);
    res.status(403).json({
      status: "error 403",
      msg: "ada error",
      err: err,
      // token: currentToken
    });
  }
}

module.exports = { register, login, forgotPassword, resetPassword };
