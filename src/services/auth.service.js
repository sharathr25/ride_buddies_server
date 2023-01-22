const admin = require('firebase-admin')

const getUserByPhoneNumber = async () => {
  return await admin.auth().getUserByPhoneNumber(req.params.phoneNumber)
}

const verifyIdToken = async token => {
  const data = await admin.auth().verifyIdToken(token)
  const { name, phone_number, uid, picture } = data
  return {
    name,
    phoneNumber: phone_number,
    color: picture, // stored color as picture while sign up
    uid
  }
}

module.exports = {
  getUserByPhoneNumber,
  verifyIdToken
}
