const admin = require('firebase-admin')

const getUserByPhoneNumber = async phoneNumber => {
  return await admin.auth().getUserByPhoneNumber(phoneNumber)
}

const verifyIdToken = async token => {
  let {
    name,
    phone_number: phoneNumber,
    uid
  } = await admin.auth().verifyIdToken(token)

  if (!name) {
    const user = await admin.auth().getUserByPhoneNumber(phoneNumber)
    name = user.displayName
  }

  return {
    name,
    phoneNumber,
    uid
  }
}

module.exports = {
  getUserByPhoneNumber,
  verifyIdToken
}
