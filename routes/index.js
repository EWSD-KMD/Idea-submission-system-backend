import express from "express";

import roleRoutes from "./roleRoutes.js";
import menuRoutes from "./menuRoutes.js";
import permissionRoutes from "./permissionRoutes.js";
import userRoutes from "./userRoutes.js";
import authRoutes from "./authRoutes.js";

const router = express.Router();

router.use("/roles", roleRoutes);
router.use("/menus", menuRoutes);
router.use("/permissions", permissionRoutes);
router.use("/users", userRoutes);
router.use("/auth", authRoutes);

router.get("/", (req, res) => {
  res.send("Welcome to the University Ideas System API");
});

export default router;
