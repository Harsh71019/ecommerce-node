declare module 'express-async-handler' {
  import { RequestHandler } from 'express';
  function asyncHandler(handler: RequestHandler): RequestHandler;
  export = asyncHandler;
}