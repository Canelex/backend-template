import Ajv from 'ajv';
import addFormats from 'ajv-formats';
const ajv = new Ajv();
addFormats(ajv);

export const validateAuthSignup = ajv.compile({
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email'
    },
    username: {
      type: 'string',
      pattern: '^[a-zA-Z0-9_]{3,24}$'
    },
    password: {
      type: 'string',
      minLength: 7
    }
  },
  required: ['email', 'password'],
  additionalProperties: false
});

export const validateAuthLogin = ajv.compile({
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email'
    },
    password: {
      type: 'string'
    }
  },
  required: ['email', 'password'],
  additionalProperties: false
});