function get (_req, res, next) {
  try {
    return res.json({
      uptime: process.uptime(),
      message: 'OK',
      timestamp: Date.now()
    })
  } catch (error) {
    console.error(`Error while getting users`, error.message)
    error.statusCode = 503
    next(error)
  }
}

module.exports = {
  get
}
