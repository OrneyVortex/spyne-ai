import { Request, Response, Router } from "express";
import authMiddleware from "../middleware/jwt.strategy";
import { Car } from "../model/Car";
import upload from "../middleware/upload";

const router = Router();
interface AuthRequest extends Request {
  userId?: string;
}

// Create Car
router.post(
  "/",
  authMiddleware, // Keep this so only authenticated users can create cars
  upload.array("images", 10),
  async (req: AuthRequest, res: Response) => {
    try {
      const { title, description, tags } = req.body;
      const images = req.files
        ? (req.files as Express.Multer.File[]).map((file) => file.path)
        : [];

      const car = new Car({
        user: req.userId, // Associate car with the authenticated user
        title,
        description,
        tags: tags ? tags.split(",") : [],
        images, // Store image URLs from Cloudinary
      });

      await car.save();
      res.status(201).json(car);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// List Cars - Make all cars visible to everyone (remove user-based filtering)
router.get("/", async (req: Request, res: Response) => {
  try {
    const cars = await Car.find(); // No user filter, making it public
    res.json(cars);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get Car Details - Make car details visible to everyone (remove user-based filtering)
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const car = await Car.findOne({ _id: req.params.id }); // No user filter, just by car ID
    if (!car) return res.status(404).send("Car not found");
    res.json(car);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update Car - Restrict to the owner of the car (same logic as before)
router.patch(
  "/:id",
  authMiddleware, // Ensure that only authenticated users can update their own car
  upload.array("images", 10),
  async (req: AuthRequest, res: Response) => {
    try {
      const { title, description, tags } = req.body;
      const images = req.files
        ? (req.files as Express.Multer.File[]).map((file) => file.path)
        : [];

      const updatedCar = await Car.findOneAndUpdate(
        { _id: req.params.id, user: req.userId }, // Ensure the owner can update only their own car
        { title, description, tags: tags ? tags.split(",") : [], images },
        { new: true }
      );

      if (!updatedCar) return res.status(404).json({ error: "Car not found" });
      res.json(updatedCar);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Delete Car - Restrict to the owner of the car (same logic as before)
router.delete(
  "/:id",
  authMiddleware, // Ensure that only authenticated users can delete their own car
  async (req: AuthRequest, res: Response) => {
    try {
      const deletedCar = await Car.deleteOne({ _id: req.params.id, user: req.userId }); // Ensure the owner can delete only their own car
      if (!deletedCar.deletedCount) return res.status(404).send("Car not found");
      res.status(204).send();
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export const carRoute = router;
