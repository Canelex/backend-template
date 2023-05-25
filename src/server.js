import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import logger from './utils/logger.js'
import config from './utils/config.js'
import './utils/passport.js'

// Create express server
const app = express()

// Setup middleware
app.use(cors())
app.use(express.json())

// Handle invalid request json
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status == 400 && 'body' in err) {
    return res.status(400).json({
      message: err.message
    })
  }
})

// Connect to mongodb
mongoose.connect(config('MONGO_URI', 'mongodb://127.0.0.1/exampledb')).then(() => {
  logger.info(`Connected to mongodb`)

  // Start listening for connections
  app.listen(config('PORT', 8000), () => {
    logger.info(`Server started on port ${8000}`)
  })
  
})