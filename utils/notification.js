const { getMessaging } = require("firebase-admin/messaging");
const User = require("../models/userModel");
const Spending = require("../models/spendingModel");
const AppError = require("./AppError");

exports.sendMonthlyReport = async () => {
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
    if (!spending) return;

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
};
