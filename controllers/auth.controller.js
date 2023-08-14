import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import createError from "../utils/createError.js";
export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) return next(createError(404, "User not found"));

    const isCorrect = bcrypt.compareSync(req.body.password, user.password);
    if (!isCorrect)
      return next(createError(400, 'wrong password or username"'));

    const token = jwt.sign(
      {
        id: user._id,
        isSeller: user.isSeller,
        username:user.username
      },
      process.env.JWT_KEY
    );

    const { password, ...info } = user._doc;
    res.cookie("acessToken", token, {
        httpOnly: true,
      })
      .status(200)
      .send(info);
  } catch (error) {
    next(err);
  }
};
export const register = async (req, res, next) => {
  try {
    const hashedPassword = bcrypt.hashSync(req.body.password, 5);
    const newUser = new User({ ...req.body, password: hashedPassword });

    await newUser.save();
    res.status(201).send("Created");
  } catch (error) {
    console.log(error);
    next(createError(500, 'An  error ocured"'));
  }
};
export const logout = async (req, res) => {
  res
    .clearCookie("acessToken", {
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .send("user has been logged out ");
};
