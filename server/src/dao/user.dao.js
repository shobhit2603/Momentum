import User from "../models/user.model.js";

export async function getUser(email) {
  const user = await User.findOne({ email });
  return user;
}

export async function createNewUser(name, email) {
  const newUser = await User.create({ name, email });
  return newUser;
}
