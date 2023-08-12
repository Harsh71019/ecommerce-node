import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/userModel.js';
import asyncHandler from 'express-async-handler';
import dotenv from 'dotenv';

dotenv.config();

// Configure Passport to use JWT for authentication
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.id).select('-password');

        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Middleware to protect routes
const protect = passport.authenticate('jwt', { session: false });

// Middleware to check admin role
const admin = asyncHandler(async (req, res, next) => {
  console.log(req.user.isAdmin);
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized. You are not an admin.');
  }
});

export { protect, admin };
