import jwt from "jsonwebtoken";
import config from "../config/config.js";

export function generateAccessToken(payload) {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: "15m",
  });
}

export function generateRefreshToken(payload) {
  return jwt.sign(payload, config.refreshSecret, {
    expiresIn: "7d",
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, config.refreshSecret);
}
