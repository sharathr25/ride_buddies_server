const express = require('express')
const bodyParser = require('body-parser')
const { createServer } = require('http')
const mongoose = require('mongoose')
const admin = require('firebase-admin')

const { DB_URL } = require('./src/configs/db.config')

const authMiddleware = require('./src/middlewares/auth.middleware')

const tripsRouter = require('./src/routes/trips.route')
const authRouter = require('./src/routes/auth.route')
const healthRouter = require('./src/routes/health.route')

const initSocket = require('./src/socket')

admin.initializeApp({ projectId: process.env.RIDE_BUDDIES_PROJECT_ID })

const app = express()

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true
  })
)

app.use('/api/auth', authRouter)
app.use('/api/trips', authMiddleware, tripsRouter)
app.use('/api/health', healthRouter)

// error handler
app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || 500
  console.error(err.message, err.stack)
  res.status(statusCode).json({ message: err.message })

  return
})

const httpServer = createServer(app)
initSocket(httpServer)
const port = process.env.PORT || 3000

mongoose.set('strictQuery', false)
mongoose
  .connect(process.env.RIDE_BUDDIES_MONGO_URL)
  .then(() => {
    console.log('Database connected')
    httpServer.listen(port, () => {
      console.log(`Server started and listening on ${port}`)
    })
  })
  .catch(e => console.log(e))
