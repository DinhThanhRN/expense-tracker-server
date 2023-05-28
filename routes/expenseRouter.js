const express = require("express");
const expenseController = require("../controllers/expenseController");
const authController = require("../controllers/authController");

const router = express.Router();

// router.param('id', checkID);

router
  .route("/:userID")
  .get(authController.protect, expenseController.getAllExpenses)
  .post(authController.protect, expenseController.createExpense);

router
  .route("/stastitic/:userID")
  .get(authController.protect, expenseController.stastiticExpenses);

router
  .route("/expense/:id")
  .get(authController.protect, expenseController.getExpense)
  .patch(authController.protect, expenseController.updateExpense)
  .delete(authController.protect, expenseController.deleteExpense);

module.exports = router;
