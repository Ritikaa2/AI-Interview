import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    let token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "User does not have a Token" });
    }

    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!verifyToken) {
      return res
        .status(401)
        .json({ message: "User does not have a Valid Token" });
    }

    req.userId = verifyToken.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "User does not have a Valid Token" });
  }
};

export default isAuth;

