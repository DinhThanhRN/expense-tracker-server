const admin = require("firebase-admin");
const { getMessaging } = require("firebase-admin/messaging");
const serviceAccount = require("../serviceAccount.json");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const Spending = require("../models/spendingModel");
const AppError = require("../utils/AppError");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

exports.sendMessage = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userID)
    .select("+deviceTokens")
    .select("+notifications");
  if (!user) return next(new AppError("Not found that userID", 404));

  if (!req.body.title || !req.body.body)
    return next(new AppError("Missing title or body of the message!", 404));

  await getMessaging().sendEachForMulticast({
    ...req.body,
    tokens: user.deviceTokens,
  });

  user.notifications.push(req.body);
  await user.save();

  res.status(200).json({
    status: "success",
    sentTime: new Date().getTime(),
    message: user.notifications[user.notifications.length - 1],
  });
});

exports.getAllNotifications = catchAsync(async (req, res, next) => {
  const notifications = await User.findById(req.params.userID).select(
    "notifications"
  );
  if (!notifications) return next(new AppError("Not found that user!", 404));

  res.status(200).json({
    status: "success",
    result: notifications.length,
    notifications,
  });
});

// exports.deleteNotification = catchAsync(async (req, res, next) => {
//   try {
//     const user = await User.updateMany(
//       {},
//       { $pull: { notifications: { id: req.params.id } } }
//     );
//   } catch (err) {
//     console.log(err);
//   }
//   res.status(200).json({
//     status: "success",
//   });
// });

exports.sendMonthlyMessage = catchAsync(async (req, res, next) => {
  const users = await User.find()
    .select("+deviceTokens")
    .select("+notifications");
  const lastMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() - 1
  );

  users.forEach(async (item) => {
    const spending = await Spending.findOne({
      userID: item.id,
      month: lastMonth.getMonth() + 1,
      year: lastMonth.getFullYear(),
    });

    if (item.deviceTokens.length) {
      const message = {
        notification: {
          title: `Monthly Report: ${new Intl.DateTimeFormat("vi-VN", {
            month: "long",
            year: "numeric",
          }).format(lastMonth)}`,
          body: `In this month, your income is ${new Intl.NumberFormat(
            "vi-VN",
            { style: "currency", currency: "VND" }
          ).format(spending.income)}, your expense is ${new Intl.NumberFormat(
            "vi-VN",
            { style: "currency", currency: "VND" }
          ).format(spending.expense)}`,
        },
        android: {
          notification: {
            icon: "stock_ticker_update",
            color: "#7e55c3",
          },
        },
        tokens: item.deviceTokens,
      };
      item.notifications.push({ ...message.notification, message });
      await item.save();

      await getMessaging().sendEachForMulticast(message);
    }
  });
  res.status(200).json({
    status: "success",
    sentTime: new Date(),
    successCount: users.length,
  });
});
