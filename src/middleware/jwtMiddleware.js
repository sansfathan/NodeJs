const jwt = require("jsonwebtoken");
require("dotenv").config();

const jwtValidateMidlleWare = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization)
    return res.status(401).json({
      msg: "Unauthorized",
    });
  const bearerHeader = authorization.split(" ");
  //ngambil token
  const token = bearerHeader[1];
  //jika error maka mereturn ini
  jwt.verify(token, process.env.JWT_SECRET, function (err, decode) {
    if (err) {
      return res.status(401).json({
        status: "fail",
        err: err,
      });
      //jika bener nambah id
    } else {
      req.id = decode.id;
      req.role = decode.role;
      req.nama = decode.nama;
      req.email = decode.email;
      //masuk ke tahap selanjutnya
      next();
    }
  });
};

module.exports = jwtValidateMidlleWare;