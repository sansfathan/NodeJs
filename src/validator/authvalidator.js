const { check } = require("express-valdator");
const UserModel = require("../models").user;


const createAuthValidator = [
    check("nama")
      .isLength({
        min: 1,
      })
      .withMessage("Nama Wajib Di Isi !!!"),
    check("email")
      .isEmail()
      .withMessage("Gunakan Format Email")
      .custom((value) => {
        return UserModel.findOne({
          where: {
            email: value,
          },
        }).then((user) => {
          if (user) {
            return Promise.reject("E-mail Sudah di pakai");
          }
        });
      }),
  ];

  module.exports = {createAuthValidator}