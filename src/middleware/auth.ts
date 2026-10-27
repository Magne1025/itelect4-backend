import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Express's Request type has no userId field, because Express does
// not know this app exists. This block adds one, for this project
// only, so req.userId type-checks everywhere below.
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// What we put inside the token when we sign it, and therefore what we
// get back out when we verify it.
export interface TokenPayload {
  userId: string;
}

// Guards protected routes by verifying the Bearer token in the Authorization header
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Browsers and Postman both send this as:
  //   Authorization: Bearer <token>
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({
      message: "No token. Send Authorization: Bearer <token>",
    });
    return;
  }

  const token = header.slice("Bearer ".length);
  const secret = process.env.JWT_SECRET!;

  try {
    // verify does two things: checks the signature was made with our
    // secret, and checks the token has not expired. Either failure
    // throws, which is why this is inside a try.
    const payload = jwt.verify(token, secret) as TokenPayload;
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({
      message: "Token is invalid or has expired",
    });
  }
}

// Optional auth middleware: populates req.userId if a valid token is present, but allows requests to proceed without one
export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;

  if (header?.startsWith("Bearer ")) {
    const token = header.slice("Bearer ".length);
    const secret = process.env.JWT_SECRET || "lost-and-found-super-secret-jwt-key-2026";
    try {
      const payload = jwt.verify(token, secret) as TokenPayload;
      req.userId = payload.userId;
    } catch {
      // Invalid/expired token ignored for optional routes
    }
  }

  next();
}
