const admin = require('firebase-admin')

const authMiddleware = async (req, res, next) => {
  const [_, token] = req.headers.authorization.split(' ')
  try {
    const data = await admin.auth().verifyIdToken(token)
    const { name, phone_number, uid, picture } = data
    req.user = {
      name,
      phoneNumber: phone_number,
      color: picture, // stored color as picture while sign up
      uid
    }
    next()
  } catch (error) {
    console.error(error)
    res.status(401).json({ msg: 'Unauthorized' })
  }
}

module.exports = authMiddleware
