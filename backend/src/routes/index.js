const express = require("express");
const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");
const customerRoutes = require("./customer.routes");
const ownerRoutes = require("./owner.routes");
const driverRoutes = require("./driver.routes");
const adminRoutes = require("./admin.routes");

const router = express.Router();

router.use("/", healthRoutes);
router.use("/auth", authRoutes);
router.use("/customer", customerRoutes);
router.use("/owner", ownerRoutes);
router.use("/driver", driverRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
