import jwt from "jsonwebtoken";

// @ts-expect-error TS(2304): Cannot find name 'UserType'.
const generateResetToken = (user: UserType) => {
  const jwtPayload = {
    id: user._id,
    email: user.email,
    reset: true,
  };

  const jwtOptions = {
    expiresIn: "1h", // Token expires in 1 hour
  };

  return jwt.sign(jwtPayload, process.env.JWT_SECRET || "", jwtOptions);
};

export default generateResetToken;
