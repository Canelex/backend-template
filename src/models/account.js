import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// Create schema
const AccountSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  display_name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date_joined: {
    type: Date,
    default: Date.now
  }
})

// Export the model
const AccountModel = mongoose.model('Account', AccountSchema);
export const Account = AccountModel;

// Export some helper functions
export const getAccountById = async (id) => {
  return await Account.findById(id);
}

export const getAccountByUsername = async (username) => {
  return await Account.findOne({ username: username });
}

export const getAccountByEmail = async (email) => {
  return await Account.findOne({ email });
}

export const createAccount = async (account) => {
  // Generate a salt
  const salt = await bcrypt.genSalt(10);

  // Hash the password
  const hash = await bcrypt.hash(account.password, salt);

  // Set the password and save
  account.password = hash;
  return await account.save();
}

export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
}