import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import passport from 'passport';
import passportConfig from './config/passportConfig.js';
import session from 'express-session';
import morgan from 'morgan';
import productRoutes from './routes/productRoutes.js'; // Import the productRoutes
import userRoutes from './routes/userRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishListRoutes from './routes/wishListRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

dotenv.config();
connectDB();
export const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Adjust the limit as needed

app.use(cookieParser());

app.use(mongoSanitize());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(xss());

const limiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 1000 });
app.use(limiter);

app.use(hpp());

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: true,
    saveUninitialized: true,
  })
); // Configure express-session
app.use(passport.initialize()); // Initialize passport
app.use(passport.session()); // Enable session-based
app.use(passport.initialize());
passportConfig(passport); // New: Initialize Passport and configure strategies

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishListRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/contact', contactRoutes);

app.get('/', (req, res) => {
  res.send('API IS RUNNING');
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(
    `"Server Running in ${process.env.NODE_ENV} on Port ${PORT}"`.yellow.bold
  )
);
