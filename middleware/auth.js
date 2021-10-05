const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  if (req.query.user_type == "user") return next();
  const token = req.header("x-auth-token");
  if (!token) {
    deleteUploadedFiles(req.file);
    return res
      .status(401)
      .json({ value: false, msg: "Access denied, No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.user = decoded;
    next();
  } catch (ex) {
    deleteUploadedFiles(req.file);
    return res.status(400).json({ value: false, msg: "invalid Token" });
  }
};

const deleteUploadedFiles = (file) => {
  try {
    if (file) fs.unlinkSync(file.path);
  } catch (error) {
    console.log("Error while deleting the file in user.auth", error);
    return res.status(400).json({
      err: "Error while deleting the file in user.auth",
    });
  }
};
