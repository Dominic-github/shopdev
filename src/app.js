const express = require('express')
const morgan = require('morgan')
const compression = require('compression')
const { default: helmet } = require('helmet')
const app = express()

// init middleware
app.use(morgan('dev'))

// app.use(morgan('compile'));
// app.use(morgan('common'));
// app.use(morgan('short'));
// app.use(morgan('tiny'));


app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(
  express.urlencoded({
    extended: true
  })
)

// init database
require('./databases/init.mongodb')
// const { checkOverLoad } = require('./helpers/check.connect')
// checkOverLoad()

// init route
app.use('/', require('./routes/'))

// handling error
app.use((req, res, next) => {
  const error = new Error('Not Found')
  error.stust = 404
  next(error)
})

app.use((error, req, res, next) => {
  const statusCode = error.status || 500
  return res.status(statusCode).json({
    status: 'error',
    code: statusCode,
    stack: error.stack,
    message: error.message || 'Internal Server Error'
  })
  next(error)
})

module.exports = app
