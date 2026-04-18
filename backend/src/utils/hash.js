import bcrypt from "bcryptjs";

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

export async function hashData(data) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(data, salt);
}

export async function compareData(data, hash) {
  return await bcrypt.compare(data, hash);
}
