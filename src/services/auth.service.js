const admin = require('firebase-admin')

const getUserByPhoneNumber = async phoneNumber => {
  return await admin.auth().getUserByPhoneNumber(phoneNumber)
}

const verifyIdToken = async token => {
  let {
    name,
    phone_number: phoneNumber,
    uid,
    picture: color
  } = await admin.auth().verifyIdToken(token)

  if (!name || !color) {
    const user = await admin.auth().getUserByPhoneNumber(phoneNumber)
    color = user.photoURL
    name = user.displayName
  }

  return {
    name,
    phoneNumber,
    color, // stored color as picture while sign up
    uid
  }
}

module.exports = {
  getUserByPhoneNumber,
  verifyIdToken
}
