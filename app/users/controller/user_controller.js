const bcrypt = require('bcryptjs');
const { registerSchema, loginSchema } = require('../model/user_schema');
const { createUser, findByEmail } = require('../model/user_repo');
const { generateToken } = require('../validators/tokenization');

async function registerUser(req, res) {
  try {
    const { error, value } = registerSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const existingUser = await findByEmail(value.email.trim().toLowerCase());

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(value.password, 10);
    const user = await createUser({
      email: value.email.trim().toLowerCase(),
      passwordHash,
      role: value.role,
    });

    const token = generateToken(user);

    return res.status(201).json({
      message: 'User registered successfully',
      user,
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Registration failed' });
  }
}

async function loginUser(req, res) {
  try {
    const { error, value } = loginSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const user = await findByEmail(value.email.trim().toLowerCase());

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(value.password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Login failed' });
  }
}

async function getCurrentUser(req, res) {
  try {
    return res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to fetch user' });
  }
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};
