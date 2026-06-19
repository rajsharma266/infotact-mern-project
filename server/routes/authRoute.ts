import express from 'express';

const router = express.Router();


import { createUser,getAllUsers,getUserById , updateUser,
  deleteUser,registerUser,loginUser} from "../controllers/authController";

import { authMiddleware } from "../middleware/authMiddleware";

router.post("/create", createUser);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/", getAllUsers);

router.get("/profile", authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Protected Route Accessed",
  });
});

router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;






