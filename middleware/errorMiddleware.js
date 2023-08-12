import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const errorResponse = {
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  };

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(statusCode).json(errorResponse);
};

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);
const errorLogStream = fs.createWriteStream(path.join(__dirname, 'error.log'), {
  flags: 'a',
});

const customLogFormat =
  ':method :url :status :response-time ms - :res[content-length]';

const requestLogger = morgan(customLogFormat, {
  stream: accessLogStream,
});

const errorLogger = morgan(customLogFormat, {
  skip: (req, res) => res.statusCode < 500,
  stream: errorLogStream,
});

export { notFound, errorHandler, requestLogger, errorLogger };
