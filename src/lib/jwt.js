import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "5h" });
};

export const signToken1 = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET_ADMIN, { expiresIn: "5h" });
};

export const signToken2 = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET_SELLER, { expiresIn: "5h" });
};

export const signToken3 = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET_SUPERADMIN, { expiresIn: "5h" });
};


export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

export const verifyToken1 = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET_ADMIN);
};

export const verifyToken2 = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET_SELLER);
};

export const verifyToken3 = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET_SUPERADMIN);
};