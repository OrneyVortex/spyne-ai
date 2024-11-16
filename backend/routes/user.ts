import { Request, Response, Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../model/User";

const router = Router();
// Register a new user

router.post("/signup", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(400).json({ error: "Username already exists" });
      return;
    }

    const newUser = new User({ username, password });
    await newUser.save();

    console.log(newUser);

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Login user
router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;  
  try {
    const user = await User.findOne({ username });
    if (!user) {
      res.status(400).json({ error: "Invalid username or password" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user!.password);
    if (!isMatch) {
      res.status(400).json({ error: "Invalid username or password" });
      return;
    }
    const privateKey = process.env.PRIVATE_KEY;
    const payload:  jwt.JwtPayload = { id: user!._id };
    const token = jwt.sign(payload, privateKey!, {
      expiresIn: "1h",
      algorithm: 'RS256'

    });
    res.cookie("accessToken", token, {
      expires: new Date(Date.now() + 3600000),
      httpOnly: true,
      secure: true,
    }).json({ token });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ error: "Server error" });
  }
});

export const userRoute = router;
