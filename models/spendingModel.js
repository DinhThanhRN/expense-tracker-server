const mongoose = require('mongoose');

const spendingScheme = new mongoose.Schema({
  income: {
    type: Number,
    require: [true, 'You must have income'],
  },
  saving: {
    type: Number,
    default: 0,
  },
  month: {
    type: String,
    require: true,
  },
});

const Spending = mongoose.model('Spending', spendingScheme);

module.exports = {Spending, spendingScheme};
