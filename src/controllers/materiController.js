const materi = require("../models/materi");

const materiModel = require("../models").materi;

async function createMateriMulti(req, res) {
  try {
    let { payload } = req.body;
    let success = 0;
    let fail = 0;
    let jumlah = payload.length;

    if (req.role === "Guru") {
      await Promise.all(
        payload.map(async (item, index) => {
          try {
            await materiModel.create({
              mataPelajaran: item.mataPelajaran,
              kelas: item.kelas,
              materi: item.materi,
              userId: req.id,
            });

            success = success + 1;
          } catch (err) {
            fail = fail + 1;
          }
        })
      );

      res.status(201).json({
        status: "201",

        msg: `sukses menambahkan ${success} Materi dari total ${jumlah} Materi dan gagal ${fail} Materi`,
      });
    } else {
      res.status(403).json({
        status: "error",
        msg: "Anda tidak memiliki akses karena role anda adalah siswa",
      });
    }
  } catch (err) {
    res.status(403).json({
      status: "error",
      msg: "error creating",
    });
  }
}

async function updateMateri(req, res) {
  try {
    const payload = req.body;
    let { mataPelajaran, materi, kelas, id } = payload;
    const Materi = await materiModel.findByPk(id);

    if (Materi === null) {
      return res.status(404).json({
        status: 404,
        msg: "Materi not found",
      });
    }

    if (req.role === "Guru") {
      if (req.id === Materi.userId) {
        await materiModel.update(
          { mataPelajaran, materi, kelas },
          {
            where: {
              id: id,
            },
          }
        );
        res.json({
          status: "200 OK",
          msg: "artikel updated",
        });
      } else {
        res.status(403).json({
          status: "error",
          msg: "Anda tidak mengupdate materi ini karena materi ini ditulis oleh guru lain",
        });
      }
    } else {
      res.status(403).json({
        status: "error",
        msg: "Anda tidak memiliki akses karena role anda adalah siswa",
      });
    }
  } catch (err) {
    res.status(403).json({
      status: "failed",
      msg: "ada kesalahan update",
    });
  }
}

async function deleteMateriMulti(req, res) {
  try {
    const { payload } = req.body;
    let jumlah = payload.length;
    let success = 0;
    let fail = 0;

    if (req.role === "Guru") {
      await Promise.all(
        payload.map(async (items, index) => {
          try {
            const materi = await materiModel.findOne({
              where: { id: items.id },
            });
            if (materi.userId !== req.id) {
              return (fail = fail + 1);
            }
            await materiModel.destroy({
              where: { id: items.id },
            });
            success = success + 1;
          } catch (error) {
            fail = fail + 1;
          }
        })
      );
      res.status(200).json({
        status: "Success",
        msg: `Berhasil mendelete ${success} dari ${jumlah} dan gagal mendelete ${fail}`,
      });
    } else {
      res.status(403).json({
        status: "error",
        msg: "Anda tidak memiliki akses karena role anda adalah siswa",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(403).json({
      status: "Fail",
      msg: "Something went wrong",
    });
  }
}

async function getMateriSiswa(req, res) {
  try {
    let {
      keyword,
      page,
      pageSize,
      offset,
      sortBy = "id",
      orderBy = "ASC",
    } = req.query;

    const materi = await materiModel.findAndCountAll({
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      where: {
        [Op.or]: [
          {
            mataPelajaran: {
              [Op.substring]: keyword,
            },
          },
          {
            kelas: {
              [Op.substring]: keyword,
            },
          },
          {
            materi: {
              [Op.substring]: keyword,
            },
          },
        ],
      },

      limit: pageSize,
      offset: offset,
      order: [[sortBy, orderBy]],
    });

    res.json({
      status: 200,
      msg: "Materi was successful",
      pagination: {
        currentPage: page,
        pageSize: pageSize,
        totalData: materi.count,
      },
      data: materi.rows,
    });
  } catch (err) {
    res.status(403).json({
      status: "404 Not Found",
      msg: "Ada Kesalahan",
      err
    });
  }
}

async function getMateriGuru(req, res) {
  try {
    let {
      materiMilik,
      page,
      pageSize,
      offset,
      sortBy = "id",
      orderBy = "ASC",
    } = req.query;

    if (materiMilik == "saya") {
      const materi = await materiModel.findAndCountAll({
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
        where: {
          [Op.or]: [
            {
              userId: req.id,
            },
          ],
        },

        limit: pageSize,
        offset: offset,
        order: [[sortBy, orderBy]],
      });

      res.json({
        status: 200,
        msg: "Materi was successful",
        pagination: {
          currentPage: page,
          pageSize: pageSize,
          totalData: materi.count,
        },
        data: materi.rows,
      });
    } else {
      const materi = await materiModel.findAndCountAll();

      res.json({
        status: 200,
        msg: "Materi was successful",
        pagination: {
          currentPage: page,
          pageSize: pageSize,
          totalData: materi.count,
        },
        data: materi.rows,
      });
    }
  } catch (err) {
    res.status(403).json({
      status: "404 Not Found",
      msg: "Ada Kesalahan",
    });
  }
}
module.exports = {
  createMateriMulti,
  updateMateri,
  deleteMateriMulti,
  getMateriGuru,
  getMateriSiswa,
};
