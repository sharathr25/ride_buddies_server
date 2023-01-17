const express = require('express')
const router = express.Router()
const {
  createTrip,
  getMyTrips,
  getRiders,
  getExpenses,
  getEvents,
  joinTrip
} = require('../controllers/trips.controller')

router.get('/mine', async (req, res, next) => {
  try {
    const trips = await getMyTrips({ user: req.user })
    res.json(trips)
  } catch (error) {
    console.error(`Error while getting users`, error.message)
    next(error)
  }
})

router.get('/:tripId/riders', async (req, res, next) => {
  try {
    const tripWithRiders = await getRiders(req.params.tripId)
    res.json(tripWithRiders)
  } catch (error) {
    console.error(`Error while getting users`, error.message)
    next(error)
  }
})

router.get('/:tripId/expenses', async (req, res, next) => {
  try {
    const tripWithExpenses = await getExpenses(req.params.tripId)
    res.json(tripWithExpenses)
  } catch (error) {
    console.error(`Error while getting users`, error.message)
    next(error)
  }
})

router.get('/:tripId/events', async (req, res, next) => {
  try {
    const tripWithMessages = await getEvents(req.params.tripId)
    res.json(tripWithMessages)
  } catch (error) {
    console.error(`Error while getting users`, error.message)
    next(error)
  }
})

router.put('/:tripCode/join', async (req, res, next) => {
  try {
    const trip = await joinTrip({
      user: req.user,
      tripCode: req.params.tripCode
    })
    if (trip === null) throw { message: 'NOT_FOUND', statusCode: 404 }
    return res.json(trip)
  } catch (error) {
    console.error(`Error while joining user`, error.message)
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const trip = await createTrip({ ...req.body, user: req.user })
    res.json(trip)
  } catch (error) {
    console.error(`Error while getting users`, error.message)
    next(error)
  }
})

module.exports = router
