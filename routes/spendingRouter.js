const express = require("express");

const spendingController = require("../controllers/spendingController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/:userID")
  .get(authController.protect, spendingController.getAllSpendings)
  .post(authController.protect, spendingController.createSpending);
router
  .route("/getStatistic/:userID")
  .get(authController.protect, spendingController.getStatistic);
router
  .route("/:id")
  .patch(authController.protect, spendingController.updateSpending)
  .delete(authController.protect, spendingController.deleteSpending);

module.exports = router;
