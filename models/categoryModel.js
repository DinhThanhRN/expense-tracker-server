const mongoose = require('mongoose');

const categoryScheme = new mongoose.Schema({
  name: {
    type: String,
    require: [true, 'Category must have a name'],
    unique: true,
  },
  icon: {
    type: String,
    require: [true, 'Category must have '],
    default: 'grid-large',
  },
  createdBy: {
    type: [String],
    default: [],
  },
});

const Category = mongoose.model('Category', categoryScheme);

module.exports = Category;
