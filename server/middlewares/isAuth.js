import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    let token = req.cookies.token;

    if (!token) {
      return res.status(400).json({ message: "User does not have a Token" });
    }

    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!verifyToken) {
      return res
        .status(400)
        .json({ message: "User does not have a Valid Token" });
    }

    req.userId = verifyToken.userId;
    next();
  } catch (error) {
    return res.status(500).json({ message: `isAuth Auth Error ${error}` });
  }
};

export default isAuth;
