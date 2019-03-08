const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    const token = req.headers["x-access-token"];
    if (token === undefined) throw Error();
    var decoded = jwt.verify(token, process.env.JWTSECRETKEY);
    if (decoded.type !== "admin") throw Error();
    next();
  } catch (err) {
    res.send({
      status: "error",
      loginAgain: true,
      data: "Invalid token. Please log in again"
    });
  }
};

module.exports = verifyToken;
