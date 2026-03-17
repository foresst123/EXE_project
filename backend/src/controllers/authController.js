import { loginUser, registerUser } from "../services/authService.js";

export const register = async (req, res) => {
  const data = await registerUser(req.body);
  res.status(201).json(data);
};

export const login = async (req, res) => {
  const data = await loginUser(req.body);
  res.json(data);
};

