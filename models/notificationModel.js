const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A notification must have a title!"],
  },
  body: {
    type: String,
    required: [true, "A notification must have a body!"],
  },
  sentTime: {
    type: Number,
    default: new Date().getTime(),
  },
  data: {
    type: Object,
    default: {},
  },
  isReaded: {
    type: Boolean,
    default: false,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
module.exports = notificationSchema;
