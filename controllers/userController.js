const User = require("../models/userModel");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { downloadImageURL, uploadImage } = require("../utils/uploadImage");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    requestedTime: req.requestTime,
    length: users.length,
    data: { user: users },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        "This route is not for password update, please use updateMyPassword",
        400
      )
    );
  // Upload avatar to Cloudinary
  const avatarURL = req.body.avatar;
  // console.log("avatarURL: ", avatarURL);
  if (avatarURL) {
    const url = await uploadImage(avatarURL, req.body.saveAs);
    // console.log("url: ", url);
    req.body.avatar = url;
  } else {
    req.body.avatar = downloadImageURL("default-avatar");
  }
  // console.log("req.body.avatar: ", req.body.avatar);

  // 3) Filtered out unwanted fields names that are not allow to be updated.
  const filteredBody = filterObj(req.body, "name", "email", "avatar");

  // 4) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    runValidators: true,
    new: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError("No user found that ID", 404));

  res.status(200).json({
    status: "success",
    requestedTime: req.requestTime,
    data: { user },
  });
});
exports.createUser = catchAsync(async (req, res) => {
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: "success",
    requestedTime: req.requestTime,
    data: { user: newUser },
  });
});
exports.updateUser = catchAsync(async (req, res, next) => {
  // let user = {};
  let data = { ...req.body };
  if (req.body.spending) {
    const { spending } = await User.findById(req.params.id);
    spending.push(req.body.spending);
    data = { ...data, spending };
  }
  const user = await User.findByIdAndUpdate(req.params.id, data, {
    runValidators: true,
    new: true,
  });

  if (!user) return next(new AppError("No user found that ID", 404));

  res.status(200).json({
    status: "success",
    requestTime: req.requestTime,
    data: {
      user,
    },
  });
});
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return next(new AppError("No user found that ID", 404));

  res.status(200).json({
    status: "success",
    requestTime: req.requestTime,
    data: null,
  });
});
