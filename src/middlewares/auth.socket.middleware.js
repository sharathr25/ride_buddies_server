const { verifyIdToken } = require('../services/auth.service')

const authSocketMiddleware = async (socket, next) => {
  const token = socket.handshake.auth.token._j
  try {
    const user = await verifyIdToken(token)
    socket.user = user
    next()
  } catch (error) {
    next(new Error('Unauthorized'))
  }
}

module.exports = authSocketMiddleware
