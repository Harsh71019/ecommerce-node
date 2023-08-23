import { Strategy as LocalStrategy } from "passport-local";
import User from "../models/userModel.js";
import "dotenv/config";
import { PassportStatic } from "passport";

const passportConfig = (passport: PassportStatic) => {
  // Local Strategy
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        console.log(email, password);
        try {
          const user = await User.findOne({ email });
          if (!user) {
            return done(null, false, { message: "Incorrect email" });
          }
          if (!(await (user as any).matchPasswords(password))) {
            return done(null, false, { message: "Incorrect password" });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      },
    ),
  );

  // Serialize user
  passport.serializeUser((user: any, done: (err: any, user: any) => void) => {
    done(null, user._id); // Store only the user's _id in the session
  });

  // Deserialize user
  passport.deserializeUser(
    async (id: string, done: (err: any, user: any) => void) => {
      try {
        const user = await User.findById(id);
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    },
  );
};

export default passportConfig;
