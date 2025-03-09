const express = require("express");
const router = express.Router();
const permissionController = require("../controllers/permissionController");

router.get("/", permissionController.getAllPermissions);
router.get("/:id", permissionController.getPermissionById);
router.post("/", permissionController.createPermission);
router.put("/:id", permissionController.updatePermission);
router.delete("/:id", permissionController.deletePermission);

module.exports = router;