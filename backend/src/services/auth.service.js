import { prisma } from "../config/db.js";
import { comparePassword, hashPassword } from "../utils/hash.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/token.js";

export async function loginUser(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw { status: 401, message: "Invalid credentials" };
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw { status: 401, message: "Invalid credentials" };
  }

  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } };
}

export async function logoutUser(token) {
  if (!token) return;
  try {
    const decoded = verifyRefreshToken(token);
    await prisma.user.update({
      where: { id: decoded.id },
      data: { refreshToken: null },
    });
  } catch (error) {
    // Ignore invalid tokens
  }
}

export async function refreshUserToken(oldToken) {
  if (!oldToken) throw { status: 401, message: "No refresh token" };

  try {
    const decoded = verifyRefreshToken(oldToken);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || user.refreshToken !== oldToken) {
      throw { status: 403, message: "Invalid refresh token" };
    }

    const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user.id });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    return { accessToken, newRefreshToken };
  } catch (error) {
    throw { status: 403, message: "Session expired" };
  }
}

export async function resetPasswordByEmail(email, newPassword) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw { status: 404, message: "Email not registered" };

  const hashedPassword = await hashPassword(newPassword);
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });
}

export async function getUserProfile(userId) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true, createdAt: true },
  });
}
