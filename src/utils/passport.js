import passport from 'passport';
import passportJwt from 'passport-jwt';
import { getAccountById } from '../models/account.js';
import config from './config.js';

// Setup options
const opts = {
  jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config('JWT_SECRET', 'ExampleSecret') // JWT secret for decoding
};

// Use strategy
passport.use(new passportJwt.Strategy(opts, async (payload, done) => {
  const accountId = payload.id;
  const password = payload.hash;

  if (accountId && password) {
    try {
      const account = await getAccountById(accountId);

      if (!account) {
        return done(null, false);
      }

      if (account.password != password) {
        return done(null, false);
      }

      return done(null, account);

    } catch (err) { }

    done(null, false);
  }
}));