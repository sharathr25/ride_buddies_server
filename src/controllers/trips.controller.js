const {
  create,
  findByCode,
  getTripsByUserId,
  getExpensesByTripId,
  getEventssByTripId,
  getRidersByTripId,
  addRiderToTrip,
  getTripOverviewByCode,
  saveNewExpense,
  deleteExpense,
  updateTripExpense,
  saveNewEvent,
  updateTripEvent,
  deleteEvent,
  updateRiderLocation
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

async function getEvents (tripId) {
  return await getEventssByTripId(tripId)
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

async function getTripByCode (tripCode) {
  return await getTripOverviewByCode(tripCode)
}

async function joinTrip ({ tripCode, user }) {
  return await addRiderToTrip({ tripCode, user })
}

async function addExpense ({ expense, tripCode, socket }) {
  const uid = socket.user.uid
  return await saveNewExpense({ expense, tripCode, uid })
}

async function updateExpense ({ expense, tripCode }) {
  return await updateTripExpense({ expense, tripCode })
}

async function removeExpense ({ _id: expenseId, tripCode }) {
  return await deleteExpense({ expenseId, tripCode })
}

async function addEvent ({ event, tripCode, socket }) {
  const uid = socket.user.uid
  return await saveNewEvent({ event, tripCode, uid })
}

async function updateEvent ({ event, tripCode }) {
  return await updateTripEvent({ event, tripCode })
}

async function removeEvent ({ expenseId, tripCode }) {
  return await deleteEvent({ expenseId, tripCode })
}

async function updateLocation ({ location, tripCode, socket }) {
  const uid = socket.user.uid
  return await updateRiderLocation({ location, tripCode, uid })
}

module.exports = {
  createTrip,
  getMyTrips,
  getRiders,
  getExpenses,
  getEvents,
  joinTrip,
  getTripByCode,
  addExpense,
  updateExpense,
  removeExpense,
  addEvent,
  updateEvent,
  removeEvent,
  updateLocation
}
