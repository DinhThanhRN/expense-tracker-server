const mongoose = require('mongoose');

const expenseScheme = new mongoose.Schema({
  userID: {
    type: String,
    select: false,
  },
  paidFor: {
    type: String,
    required: [true, 'An expense must have the purpose of paying'],
  },
  price: {
    type: Number,
    required: [true, 'Must have price'],
  },
  category: {
    type: String,
    required: [true, 'An expense must have category'],
  },
  paidAt: {
    type: Date,
    default: Date.now(),
  },
});

// expenseScheme.post(/^find/, function (next) {
//   next();
// });

const Expense = mongoose.model('Expense', expenseScheme);

module.exports = Expense;
