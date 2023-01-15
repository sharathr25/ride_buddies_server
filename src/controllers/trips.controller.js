const {
  create,
  findByCode,
  getTripsByUserId,
  getExpensesByTripId,
  getMessagesByTripId,
  getRidersByTripId,
  joinByTripCode
} = require('../services/trips.service')
const { randomCode } = require('../utils')

async function getMyTrips (attrs) {
  const { user } = attrs
  const { uid } = user
  return await getTripsByUserId(uid)
}

async function getRiders (tripId) {
  return await getRidersByTripId(tripId)
}

async function getExpenses (tripId) {
  return await getExpensesByTripId(tripId)
}

async function getMessages (tripId) {
  return await getMessagesByTripId(tripId)
}

async function createTrip (attrs) {
  const { name, user } = attrs
  let code
  let maxAttempts = 3
  let currentAttempt = 0
  while (currentAttempt < maxAttempts) {
    code = randomCode()
    if ((await findByCode(code)) === null) break
    currentAttempt++
  }
  return await create({ name, user, code })
}

async function joinTrip (attrs) {
  const { tripCode, user } = attrs
  return await joinByTripCode({ tripCode, user })
}

module.exports = {
  createTrip,
  getMyTrips,
  getRiders,
  getExpenses,
  getMessages,
  joinTrip
}
