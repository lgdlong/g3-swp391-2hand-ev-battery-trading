// // import { Injectable, NestMiddleware } from '@nestjs/common';
// // import { Request, Response, NextFunction } from 'express';
//
// @Injectable()
// export class DebugMiddleware implements NestMiddleware {
//   // use(req: Request, res: Response, next: NextFunction) {
//   //   console.log('[DEBUG MIDDLEWARE] Request URL:', req.url);
//   //   console.log('[DEBUG MIDDLEWARE] Request Method:', req.method);
//   //   console.log('[DEBUG MIDDLEWARE] Authorization Header:', req.headers.authorization);
//   //
//   //   if (req.headers.authorization) {
//   //     const token = req.headers.authorization.replace('Bearer ', '');
//   //     try {
//   //       // Decode JWT payload without verification to see what's inside
//   //       const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
//   //       console.log('[DEBUG MIDDLEWARE] JWT Payload:', payload);
//   //       console.log('[DEBUG MIDDLEWARE] Token expiry:', new Date(payload.exp * 1000));
//   //       console.log('[DEBUG MIDDLEWARE] Current time:', new Date());
//   //       console.log('[DEBUG MIDDLEWARE] Is expired?:', payload.exp * 1000 < Date.now());
//   //     } catch (e) {
//   //       console.log('[DEBUG MIDDLEWARE] Error decoding JWT:', e.message);
//   //     }
//   //   }
//   //
//   //   next();
//   // }
// }
