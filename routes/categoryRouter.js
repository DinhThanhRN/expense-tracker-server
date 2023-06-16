const express = require('express');

const categoryController = require('../controllers/categoryController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(authController.protect, categoryController.getAllCategories)
  .post(authController.protect, categoryController.createCategory);

// router
//   .route('/:userID')
//   .patch(authController.protect, categoryController.createOwnCategory);

router
  .route('/:id')
  .get(authController.protect, categoryController.getCategory)
  .patch(authController.protect, categoryController.updateCategory)
  .delete(authController.protect, categoryController.deleteCategory);

module.exports = router;
