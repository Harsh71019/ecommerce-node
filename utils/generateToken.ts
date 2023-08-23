import jwt from "jsonwebtoken";
import crypto from "crypto";

const generateToken = (user: {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}) => {
  const jwtPayload = {
    id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
  };

  const jwtOptions = {
    expiresIn: "30d",
    jwtid: crypto.randomBytes(16).toString("hex"), // Generate a unique JWT ID
  };

  return jwt.sign(jwtPayload, process.env.JWT_SECRET || "", jwtOptions);
};

export default generateToken;
