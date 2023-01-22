const { verifyIdToken } = require('../services/auth.service')

const authMiddleware = async (req, res, next) => {
  const [_, token] = req.headers.authorization.split(' ')
  try {
    req.user = await verifyIdToken(token)
    next()
  } catch (error) {
    console.error(error)
    res.status(401).json({ msg: 'Unauthorized' })
  }
}

module.exports = authMiddleware
