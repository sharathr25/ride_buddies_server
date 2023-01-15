const express = require('express')
const router = express.Router()
const { get } = require('../controllers/health.controller')

router.get('/', get)

module.exports = router
