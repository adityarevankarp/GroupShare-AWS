import { createUser, getUserByEmail } from "../services/userService.js";

const registerUser = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    let existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(200).json({ message: "User already exists", user: existingUser });
    }

    const newUser = await createUser(email);
    return res.status(201).json({ message: "User registered", user: newUser });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export { registerUser };
