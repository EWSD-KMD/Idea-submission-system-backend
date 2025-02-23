const express = require("express");
const router = express.Router();

const roleRoutes = require("./roleRoutes");

router.use("/roles", roleRoutes);

router.get("/", (req, res) => {
  res.send("Welcome to the University Ideas System API");
});

module.exports = router;
