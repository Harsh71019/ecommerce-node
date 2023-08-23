import jwt from "jsonwebtoken";

const resetToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_RESET || "", {
    expiresIn: "20m",
  });
};

export default resetToken;
