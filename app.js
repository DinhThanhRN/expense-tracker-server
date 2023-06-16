const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cron = require("node-cron");

const userRouter = require("./routes/userRouter");
const expenseRouter = require("./routes/expenseRouter");
const categoryRouter = require("./routes/categoryRouter");
const spendingRouter = require("./routes/spendingRouter");
const notificationRouter = require("./routes/notificationRouter");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/AppError");
const { sendMonthlyReport } = require("./utils/notification");

const app = express();

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit requests from same API
// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: "Too many request from this id. Please try again in an hour!",
// });
// app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: ["price"],
  })
);

// Schedule time to send monthly report.
cron.schedule("0 0 7 * *", () => {
  sendMonthlyReport();
});

// Test middlerware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/expenses", expenseRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/spendings", spendingRouter);
app.use("/api/v1/notifications", notificationRouter);
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
