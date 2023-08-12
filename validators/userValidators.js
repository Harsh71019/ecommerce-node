import { body, validationResult } from 'express-validator';

// Validation rules for registering a new user
export const registerUserValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('mobile').notEmpty().withMessage('Mobile number is required'),
  body('username').notEmpty().withMessage('Username is required'),
];

// Middleware to handle validation errors
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
