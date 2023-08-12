import jwt from 'jsonwebtoken';

const generateResetToken = (user) => {
  const jwtPayload = {
    id: user._id,
    email: user.email,
    reset: true,
  };

  const jwtOptions = {
    expiresIn: '1h', // Token expires in 1 hour
  };

  return jwt.sign(jwtPayload, process.env.JWT_SECRET, jwtOptions);
};

export default generateResetToken;
