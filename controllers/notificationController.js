const admin = require("firebase-admin");
const { getMessaging } = require("firebase-admin/messaging");
const serviceAccount = require("../serviceAccount.json");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const Spending = require("../models/spendingModel");
const AppError = require("../utils/AppError");
const { ObjectId } = require("mongodb");

const credential = {
  type: process.env.ADMIN_TYPE,
  project_id: process.env.ADMIN_PROJECT_ID,
  private_key_id: process.env.ADMIN_PRIVATE_KEY_ID,
  private_key: process.env.ADMIN_PRIVATE_KEY,
  client_email: process.env.ADMIN_CLIENT_EMAIL,
  client_id: process.env.ADMIN_CLIENT_ID,
  auth_uri: process.env.ADMIN_AUTH_URI,
  token_uri: process.env.ADMIN_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.ADMIN_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.ADMIN_CLIENT_x509_CERT_URL,
  universe_domain: process.env.ADMIN_UNIVERSE_DOMAIN,
};

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
    notification: { ...req.body },
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

exports.deleteNotification = catchAsync(async (req, res, next) => {
  const userID = new ObjectId(req.params.id);
  const notificationId = ObjectId(req.query.id);
  try {
    // const user = await User.updateMany(
    //   {},
    //   {
    //     $pull: { notifications: { _id: notificationId } },
    //   }
    // ).select("notifications");
    const user = await User.find({ _id: userID });
    console.log(userID);
    // res.status(200).json({
    //   status: "success",
    //   data: user,
    // });
  } catch (err) {
    console.log(err);
  }
  res.status(200).json({
    status: "fail",
    message: "Delete notification fail",
  });
});

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
