const bcrypt = require('bcrypt');
const crypto = require('crypto');
const AppError = require('../utils/AppError');
const userRepo = require('../repositories/user.repository');

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

const register = async ({ name, email, password }) => {
  const existing = await userRepo.findByEmail(email);
  if (existing) throw new AppError('Email already registered', 409, 'EMAIL_TAKEN');

  const passwordHash = await bcrypt.hash(password, 12);
  const verificationToken = crypto.randomBytes(32).toString('hex');

  const user = await userRepo.create({
    name,
    email,
    passwordHash,
    emailVerificationTokenHash: sha256(verificationToken),
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  // Stand-in for sending an email (the brief allows logging it to the console)
  console.log(`[email] Verify ${email}: token=${verificationToken}`);

  return { id: user._id, name: user.name, email: user.email };
};

module.exports = { register, sha256 };