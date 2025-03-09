const express = require("express");
const router = express.Router();

const roleRoutes = require("./roleRoutes");
const menuRoutes = require("./menuRoutes");
const permissionRoutes = require("./permissionRoutes");
const userRoutes = require("./userRoutes");

router.use("/roles", roleRoutes);
router.use("/menus", menuRoutes);
router.use("/permissions", permissionRoutes);
router.use("/users", userRoutes);

router.get("/", (req, res) => {
  res.send("Welcome to the University Ideas System API");
});

module.exports = router;
