const { promisify } = require("util");
const User = require("../model/userModel");
const catchAsync = require("../utilities/catchAsync");
const handleError = require("./errorController");
const AppError = require("../utilities/appError");
const jwt = require("jsonwebtoken");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    const token = signToken(newUser._id);

    if (!newUser) return new AppError(404, "something went very wrong");

    res.status(201).json({
      status: "success",
      token,
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    // 1) get the email and password
    const { email, password } = req.body;

    // 2) check if user provided any email or password
    if (!email || !password) {
      return new AppError(400, "please provide email and password!");
    }

    // 3) search for that email to find the user
    const user = await User.findOne({ email }).select("+password");

    // 4) check if user exists or password is correct
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError(401, "Incorrect email or password"));
    }

    const token = signToken(user._id);
    console.log(token);
    res.status(200).json({
      status: "success",
      token,
    });
  } catch (err) {
    next(err);
  }
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Geting token and check if it's there
  const { authorization } = req.headers;
  let token;
  if (authorization && authorization.startsWith("Bearer")) {
    token = authorization.split(" ")[1];
  }

  // console.log(token);

  if (!token)
    return next(
      new AppError(
        401,
        "You are not logged in, you have to log in to get access"
      )
    );

  // 2) Verfication token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);
  // 3) check if user still exists

  // 4) check if user changed password after the token was issued

  next();
});
