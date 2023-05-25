import express from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';
import config from '../utils/config.js';
import { validateAuthSignup, validateAuthLogin } from '../utils/validator.js';
import { Account, comparePassword, createAccount, getAccountByEmail, getAccountByUsername } from '../models/account.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    // Validate body
    if (!validateAuthSignup(req.body)) {
      return res.status(400).json({
        message: 'Invalid request body'
      })
    }

    // Get parameters
    const body = req.body;
    const email = body.email.toLowerCase();
    const password = body.password;
    const display_name = body.username;
    const username = display_name.toLowerCase();

    // Check if account exists with this email
    const emailExists = await getAccountByEmail(email);
    if (emailExists) {
      logger.warn('User tried to create an account, but the email was taken', {
        email: email
      })

      return res.status(400).json({
        message: 'An account with this email already exists'
      })
    }

    // Check if account exists with this email
    const nameExists = await getAccountByUsername(username);
    if (nameExists) {
      logger.warn('User tried to create an account, but the username was taken', {
        username: username
      })

      return res.status(400).json({
        message: 'An account with this username already exists'
      })
    }

    // Create an account and insert it
    const newAccount = await createAccount(new Account({ email, username, display_name, password }));
    logger.info('Successfully created new account', {
      email: newAccount.email,
      username: newAccount.username
    });

    // Return token
    return res.status(200).json({
      message: 'Account was successfully created',
      token: getSessionToken(newAccount, 31)
    })

  } catch (err) {
    logger.error('An internal error occurred during /auth/signup', {
      error: err.message
    })

    return res.status(500).json({
      message: 'An internal error occurred. Please try again later.'
    })
  }
})

router.post('/login', async (req, res) => {
  try {
    // Validate body
    if (!validateAuthLogin(req.body)) {
      return res.status(400).json({
        message: 'Invalid request body'
      })
    }

    // Get parameters
    const body = req.body;
    const email = body.email.toLowerCase();
    const password = body.password;

    // Get account with this email
    const account = await getAccountByEmail(email);
    if (account == null) {
      logger.warn('User tried to login to account, but email did not exist', {
        email: email
      })

      return res.status(400).json({
        message: 'An account with this email does not exist'
      })
    }

    const isMatch = await comparePassword(password, account.password);
    if (!isMatch) {
      logger.warn('User tried to login to account, but password was incorrect', {
        email: email
      })

      return res.status(400).json({
        message: 'Incorrect login credentials'
      })
    }

    // Return token
    return res.status(200).json({
      message: 'Successfully logged in',
      token: getSessionToken(account, 31)
    })

  } catch (err) {
    logger.error('An internal error occurred during /auth/login', {
      error: err.message
    })

    return res.status(500).json({
      message: 'An internal error occurred. Please try again later.'
    })
  }
})

function getSessionToken(account, expiresInDays) {
  return jwt.sign({ id: account._id, hash: account.password }, config('JWT_SECRET', 'ExampleSecret'), {
    expiresIn: expiresInDays + 'd'
  });
}

export default router;