const express = require('express')
const { getUserByPhoneNumber } = require('../services/auth.service')

const router = express.Router()

router.get('/:phoneNumber', async (req, res, next) => {
  try {
    await getUserByPhoneNumber(req.params.phoneNumber)
    res.json({ message: 'FOUND' })
  } catch (error) {
    console.error('Error while getting user by phone number', error.message)
    next({ statusCode: 404, message: 'NOT_FOUND' })
  }
})

module.exports = router
