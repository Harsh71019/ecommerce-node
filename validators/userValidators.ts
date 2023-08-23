// @ts-expect-error TS(2792): Cannot find module 'express-validator'. Did you mean to set the 'moduleResolution' option to 'node', or to add aliases to the 'paths' option?
import { body, validationResult } from "express-validator";

// Validation rules for registering a new user
export const registerUserValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("mobile").notEmpty().withMessage("Mobile number is required"),
  body("username").notEmpty().withMessage("Username is required"),
];

// Middleware to handle validation errors
// @ts-expect-error TS(2552): Cannot find name 'NextFunction'. Did you mean 'Function'?
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // @ts-expect-error TS(2339): Property 'sendStatus' does not exist on type 'Response'.
    return res.sendStatus(400).json({ errors: errors.array() });
  }
  next();
};
