const admin = require('firebase-admin')
const express = require('express')

const router = express.Router()

router.get('/:phoneNumber', async (req, res, next) => {
  try {
    await admin.auth().getUserByPhoneNumber(req.params.phoneNumber)
    res.json({ message: 'FOUND' })
  } catch (error) {
    console.error('Error while getting user by phone number', error.message)
    next({ statusCode: 404, message: 'NOT_FOUND' })
  }
})

module.exports = router
