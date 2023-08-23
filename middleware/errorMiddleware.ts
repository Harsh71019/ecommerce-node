import morgan from "morgan";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { NextFunction } from "express";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const notFound = (req: Request, res: Response, next: NextFunction) => {
  // @ts-expect-error TS(2339): Property 'originalUrl' does not exist on type 'Request'.
  const error = new Error(`Not found - ${req.originalUrl}`);
  // @ts-expect-error TS(2349): This expression is not callable.
  res.status(404);
  next(error);
};

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // @ts-expect-error TS(2339): Property 'statusCode' does not exist on type 'Response'.
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const errorResponse = {
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  };

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  // @ts-expect-error TS(2349): This expression is not callable.
  res.status(statusCode).json(errorResponse);
};

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" },
);
const errorLogStream = fs.createWriteStream(path.join(__dirname, "error.log"), {
  flags: "a",
});

const customLogFormat =
  ":method :url :status :response-time ms - :res[content-length]";

const requestLogger = morgan(customLogFormat, {
  stream: accessLogStream,
});

const errorLogger = morgan(customLogFormat, {
  skip: (req, res) => res.statusCode < 500,
  stream: errorLogStream,
});

export { notFound, errorHandler, requestLogger, errorLogger };
