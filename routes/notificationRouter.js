const express = require("express");
const notificationController = require("../controllers/notificationController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/sendMonthlyReport")
  .post(notificationController.sendMonthlyMessage);

router
  .route("/:userID")
  .post(authController.protect, notificationController.sendMessage)
  .get(authController.protect, notificationController.getAllNotifications);

// router
//   .route("/:id")
//   .delete(authController.protect, notificationController.deleteNotification);

module.exports = router;
