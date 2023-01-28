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
  updateRiderLocation,
  getEventsCount,
  getRiderIdsAndExpenses
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

async function getExpensesDetails (tripCode) {
  const {
    ridersUids,
    expensesGrouped,
    expensesForCertainRiders,
    commonExpensesForAll
  } = await getRiderIdsAndExpenses(tripCode)

  const commonExpensesPerRider = Math.floor(
    commonExpensesForAll / ridersUids.length
  )

  const totalExpenditure = ridersUids.reduce(
    (acc, cur) => ({ ...acc, [cur.uid]: commonExpensesPerRider }),
    {}
  )

  expensesForCertainRiders.forEach(e => {
    const perRider = e.amount / e.for.length
    e.for.forEach(uid => {
      totalExpenditure[uid] += perRider
    })
  })

  const ridersOwned = []
  const ridersDued = []

  const ridersBalance = ridersUids.reduce((acc, cur) => {
    const balance =
      (cur.uid in expensesGrouped ? expensesGrouped[cur.uid] : 0) -
      totalExpenditure[cur.uid]
    if (balance > 0) {
      ridersOwned.push({ uid: cur.uid, amount: balance })
    } else if (balance < 0) {
      ridersDued.push({ uid: cur.uid, amount: balance * -1 })
    }
    return {
      ...acc,
      [cur.uid]: balance
    }
  }, {})

  const suggestedPayments = []
  let i = 0
  let j = 0

  while (i < ridersOwned.length && j < ridersDued.length) {
    const balance = ridersOwned[i].amount - ridersDued[j].amount
    if (balance > 0) {
      ridersOwned[i].amount = balance
      suggestedPayments.push({
        from: ridersDued[j].uid,
        to: ridersOwned[i].uid,
        amount: ridersDued[j].amount
      })
      j++
    } else {
      ridersDued[j].amount = balance
      suggestedPayments.push({
        from: ridersDued[j].uid,
        to: ridersOwned[i].uid,
        amount: ridersOwned[i].amount
      })
      i++
    }
  }

  return { suggestedPayments, ridersBalance, totalExpenditure }
}

async function getTripByCode (tripCode) {
  const { _id, name, code, creation, riders, events, expenses } =
    await getTripOverviewByCode(tripCode)

  const { totalExpenditure, ridersBalance, suggestedPayments } =
    await getExpensesDetails(tripCode)

  const eventsCount = await getEventsCount(tripCode)

  return {
    _id,
    name,
    code,
    creation,
    riders,
    events,
    expenses,
    eventsCount,
    totalExpenditure,
    ridersBalance,
    suggestedPayments
  }
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
