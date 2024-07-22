const app = require('./src/app')
require('dotenv').config()

const PORT = process.env.PORT || 3050

const server = app.listen(PORT, () => {
  console.log(`eCommerce server liStening on port ${PORT}`)
})

// process.on('SIGINT', () => {
//   server.close(() => {
//     console.log('Exit server express')
//   })
// })
