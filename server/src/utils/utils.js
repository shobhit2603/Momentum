import jwt from "jsonwebtoken";
import config from "../config/config.js";

export function generateJWT(data) {
  const token = jwt.sign(data, config.JWT_SECRET, {
    expiresIn: "7d",
  });
  return token;
}

export function verifyJWT(token) {
  if (!token) return null;

  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch (error) {
    return null;
  }
}
