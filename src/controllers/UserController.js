// const { use } = require("../routes/routers");

const { where } = require("sequelize");

const UserModel = require("../models").user;

async function getListUser(req, res) {
  try {
    const users = await UserModel.findAll();
    res.json({
      status: "Success",
      msg: "Data user Di temukan",
      data: users,
    });
  } catch (error) {
    res.status(403).json({
      status: "Fail",
      msg: "Ada Kesalahan",
    });
  }
}

//create data ke database

async function createUser(req, res) {
  try {
    const payload = req.body;
    const { nama, email, tempatLahir, tanggalLahir } = payload;
    await UserModel.create({
      nama: nama,
      email: email,
      isActive: true,
      tempatLahir: tempatLahir,
      tanggallahir: tanggalLahir,
    });
    res.status(201).json({
      status: "Success",
      msg: "Berhasil Disimpan",
    });
  } catch (error) {
    res.status(403).json({
      status: "Fail",
      msg: "Ada Kesalahan",
    });
  }
}

async function getDetailUserById(req, res) {
  try {
    const { id } = req.params;
    const users = await UserModel.findByPk(id);
    if (users === null) {
      res.status(404).json({
        status: "Fail",
        msg: "User tidak Ditemukan",
      });
    }
    res.json({
      status: "success",
      msg: "User Berhasil",
      data: users,
    });
  } catch (err) {
    res.status(403).json({
      status: "Fail",
      msg: "Ada Kesalahan",
      err: err,
    });
  }
}

async function getDetailUserByParams(req, res) {
  try {
    const { email } = req.params;
    const users = await UserModel.findOne({
      where: {
        tempatLahir: email,
      },
    });
    if (users === null) {
      res.status(404).json({
        status: "Fail",
        msg: "User tidak Ditemukan",
      });
    }
    res.json({
      status: "success",
      msg: "User Berhasil ditemukan",
      data: users,
    });
  } catch (err) {
    res.status(403).json({
      status: "Fail",
      msg: "Ada Kesalahan",
      err: err,
    });
  }
}
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const users = await UserModel.findByPk(id);
    const payload = req.body;
    const { nama, tempatLahir, tanggalLahir } = payload;
    if (users === null) {
      res.status(404).json({
        status: "Fail",
        msg: "User tidak Ditemukan",
        id: id,
        users: users,
      });
    }

    // await UserModel.update(
    //   {
    //     nama : nama,
    //     tempatLahir : tempatLahir,
    //     tanggalLahir : tanggalLahir,
    //   },
    //   {
    //     where: {
    //       id: id,
    //     },
    //   }
    // );

    await UserModel.update(
      {
        nama,
        tempatLahir,
        tanggalLahir,
      },
      {
        where: {
          id: id,
        },
      }
    );

    res.json({
      status: "success",
      msg: "Update User Berhasil",
      id: id,
    });
  } catch (err) {
    res.status(403).json({
      status: "Fail",
      msg: "Ada Kesalahan",
      err: err,
    });
  }
}
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const users = await UserModel.findByPk(id);
    const payload = req.body;

    if (users === null) {
      res.status(404).json({
        status: "Fail",
        msg: "User tidak Ditemukan",
        id: id,
        users: users,
      });
    }

    // await UserModel.update(
    //   {
    //     nama : nama,
    //     tempatLahir : tempatLahir,
    //     tanggalLahir : tanggalLahir,
    //   },
    //   {
    //     where: {
    //       id: id,
    //     },
    //   }
    // );

    await UserModel.destroy({
      where: {
        id: id,
      },
    });

    res.json({
      status: "success",
      msg: "Delete User Berhasil",
      id: id,
    });
  } catch (err) {
    res.status(403).json({
      status: "Fail",
      msg: "Ada Kesalahan",
      err: err,
    });
  }
}

// async function deleteUser(req, res) {
//   try {
//     const {id} = req.params
//     const users = await UserModel.findByPk(id);
//     if (user === null) {
//       return res.status(404).json({
//         status: "Fail",
//         msg: "User tidak Ditemukan",
//       });
//     }
//     await UserModel.destroy({
//       where: {
//         id: id,
//       },
//     });
//     res.json({
//       status: "success",
//       msg: "berhasil di hapus",
//     });
//   } catch (err) {
//     res.status(403).json({
//       status: "Fail",
//       msg: "Ada Kesalahan",
//       err : err
//     });
//   }
// }

async function updatePassword(req, res) {
  const payload = req.body;
  const { email, old_password, new_password } = payload;

  try {
    const users = await UserModel.findOne({
      where: {
        email: req.email,
      },
    });
    const verify = await bcrypt.compareSync(old_password.users.password);
    if (users === null) {
      return res.json({
        status: 400,
        msg: "email not found",
      });
    }
    if (verify) {
      let hashPassword = await bcrypt.hash(new_password, 10);
      await UserModel.update(
        { password: hashPassword },
        {
          where: {
            id: users.id,
          },
        }
      );
      res.json({
        status: "200",
        msg: "passwoed updated",
      });
    } else {
      res.json({
        msg: "password lama tidak sesuai",
      });
    }
  } catch (err) {
    console.log("err", err);
    res.status(403).json({
      status: "failed",
      msg: "ada kesalahan update password",
      err: err,
    });
  }
}

const index = async (req, res) => {
  try {
    let { keyword, page, pageSize, orderBy, sortBy, pageActive } = req.query;
    const users = await UserModel.findAndCountAll({
      attributes: ["id", ["name", "nama"], "status", "jenisKelamin"],
      where: {
        ...(keyword !== undefined && {
          [Op.or]: [
            {
              name: {
                [Op.like]: `%${keyword}%`,
              },
            },
            {
              email: {
                [Op.like]: `%${keyword}%`,
              },
            },
            {
              jenisKelamin: {
                [Op.like]: `%${keyword}%`,
              },
            },
          ],
        }),
      },
      order: [[sortBy,orderBy]],
      offset: page,
      limit:pageSize
    });
    console.log('========== page =============', page);
    console.log('========= pageSize ===============', pageSize);
    return res.json({
      status: "Success",
      msg: "Daftar ser Ditemukan",
      data: users,
      pagination: {
        page: pageActive,
        nextPage: page + 1,
        previousPage: pageSize + 1,
        pageSize: pageSize,
        jumlah: users.rows.length,
        total: users.count
      }
    });

  } catch (error) {
    console.log("err", err);
    res.status(403).json({
      status: "error 403",
      msg: "ada error",
      err: err,
      // token: currentToken
    });
  }
};

module.exports = {
  updateUser,
  getListUser,
  createUser,
  getDetailUserById,
  getDetailUserByParams,
  deleteUser,
  updatePassword,
};
