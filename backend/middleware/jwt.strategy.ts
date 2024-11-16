import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  userId?: string;
}

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    res.status(401).send("Access denied");
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.PRIVATE_KEY!, {
      algorithms: ["RS256"]
    }) as { id: string };
    req.userId = decoded.id;
    next();
  } catch {
    res.status(400).send("Invalid token");
  }
};

// export default auth;
export default authMiddleware;
