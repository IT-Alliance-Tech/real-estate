const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName: { type: String },
  lastName: { type: String },
  name: { type: String }, // optional full name (backward compatibility)
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String },
  accessKey: { type: String }, // For admin secure access
  verified: { type: Boolean, default: false },
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

// Encrypt password and accessKey using bcrypt
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  if (this.isModified('accessKey')) {
    const salt = await bcrypt.genSalt(10);
    this.accessKey = await bcrypt.hash(this.accessKey, salt);
  }

  next();
});

// Match password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Match accessKey
userSchema.methods.compareAccessKey = async function (enteredAccessKey) {
  if (!this.accessKey) return false;
  return await bcrypt.compare(enteredAccessKey, this.accessKey);
};

module.exports = mongoose.model('User', userSchema);