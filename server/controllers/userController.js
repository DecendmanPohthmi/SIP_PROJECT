import bcrypt from "bcrypt";

import { findUserByEmail, createUser } from "../models/userModel.js";

export const registerUser = async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser(
      full_name,
      email,
      phone,
      hashedPassword
    );

    // Remove password before sending response
    delete user.password;

    res.status(201).json({
      message: "User Registered Successfully",
      user,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

export const loginUser = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid password"
      });
    }

    delete user.password;

    res.status(200).json({
      message: "Login Successful",
      user
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });

  }
};