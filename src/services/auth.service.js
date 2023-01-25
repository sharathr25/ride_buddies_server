const admin = require('firebase-admin')

const getUserByPhoneNumber = async phoneNumber => {
  return await admin.auth().getUserByPhoneNumber(phoneNumber)
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
