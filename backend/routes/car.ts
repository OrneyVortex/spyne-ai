import { Request, Response, Router } from "express";
import authMiddleware from "../middleware/jwt.strategy";
import { Car } from "../model/Car";
import upload from "../middleware/upload";

const router = Router();
interface AuthRequest extends Request {
  userId?: string;
}

router.post(
  "/",
  authMiddleware,
  upload.array("images", 10),
  async (req: AuthRequest, res: Response) => {
    try {
      const { title, description, tags, username } = req.body;
      const images = req.files
        ? (req.files as Express.Multer.File[]).map((file) => file.path)
        : [];

      console.log("Uploaded Images: ", images); // Log the image paths to confirm they are being returned

      const car = new Car({
        user: req.userId,
        title,
        description,
        tags: tags ? tags.split(",") : [],
        images, // Store image URLs from Cloudinary
        username, // Store username with the car data
      });

      await car.save();
      res.status(201).json(car);
    } catch (error) {
      console.log("Error uploading car data:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);


// List Cars
// List Cars
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const cars = await Car.find(); 
    res.send(cars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});


// Get Car Details
router.get("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  const car = await Car.findOne({ _id: req.params.id, user: req.userId });
  if (!car) res.status(404).send("Car not found");
  res.send(car);
});

// Update Car
router.patch(
  "/:id",
  authMiddleware,
  upload.array("images", 10),
  async (req: AuthRequest, res: Response) => {
    try {
      const { title, description, tags, username } = req.body;
      const images = req.files
        ? (req.files as Express.Multer.File[]).map((file) => file.path)
        : [];

      const updatedCar = await Car.findOneAndUpdate(
        { _id: req.params.id, user: req.userId },
        { title, description, tags: tags ? tags.split(",") : [], images, username },
        { new: true }
      );

      if (!updatedCar) res.status(404).json({ error: "Car not found" });
      res.json(updatedCar);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Delete Car
router.delete(
  "/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    await Car.deleteOne({ _id: req.params.id, user: req.userId });
    res.status(204).send();
  }
);

export const carRoute = router;
