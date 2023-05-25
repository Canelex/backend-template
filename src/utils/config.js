import dotenv from 'dotenv'

dotenv.config()

export default (key, def) => {
  return process.env[key] || def;
}