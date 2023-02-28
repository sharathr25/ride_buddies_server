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
  getRiderIds,
  getCommonExpenseForAll,
  getExpensesForCertainRiders,
  getAmountSpentByRiders,
  getSettledAmountsForRiders
} = require('../services/trips.service')
const { randomCode } = require('../utils')

const COLORS = [
  '#DB3E00',
  '#1273DE',
  '#004DCF',
  '#5300EB',
  '#417505',
  '#BD10E0',
  '#9013FE',
  '#50E3C2',
  '#9400D3',
  '#4B0082',
  '#0000FF',
  '#00FF00',
  '#FF7F00',
  '#FF0000'
]

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
  const ridersUids = await getRiderIds(tripCode)
  const commonExpensesForAll = await getCommonExpenseForAll(tripCode)
  const expensesForCertainRiders = await getExpensesForCertainRiders(tripCode)
  const amountSpentByRiders = await getAmountSpentByRiders(tripCode)
  const settlementAmountForRiders = await getSettledAmountsForRiders(tripCode)

  const commonExpensesPerRider = Math.floor(
    commonExpensesForAll / ridersUids.length
  )
  const adjustment = commonExpensesForAll % ridersUids.length

  const totalExpenditure = ridersUids.reduce(
    (acc, cur, i) => ({
      ...acc,
      [cur.uid]: commonExpensesPerRider + (i === 0 ? adjustment : 0)
    }),
    {}
  )

  expensesForCertainRiders.forEach(e => {
    const perRider = Math.floor(e.amount / e.for.length)
    const adjustment = e.amount % e.for.length
    e.for.forEach((uid, i) => {
      totalExpenditure[uid] =
        totalExpenditure[uid] + perRider + (i === 0 ? adjustment : 0)
    })
  })

  const ridersOwned = []
  const ridersDued = []

  const ridersBalance = ridersUids.reduce((acc, cur) => {
    const balance =
      (amountSpentByRiders[cur.uid] || 0) -
      (settlementAmountForRiders[cur.uid] || 0) -
      totalExpenditure[cur.uid]
    if (balance > 0) {
      ridersOwned.push({ uid: cur.uid, amount: balance })
    } else if (balance < 0) {
      ridersDued.push({ uid: cur.uid, amount: Math.abs(balance) })
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
        amount: Math.abs(ridersDued[j].amount)
      })
      j++
    } else {
      ridersDued[j].amount = balance
      suggestedPayments.push({
        from: ridersDued[j].uid,
        to: ridersOwned[i].uid,
        amount: Math.abs(ridersOwned[i].amount)
      })
      i++
    }
  }

  return { suggestedPayments, ridersBalance, totalExpenditure }
}

async function getTripByCode (tripCode) {
  const { _id, name, code, creation, riders, events, expenses } =
    await getTripOverviewByCode(tripCode)

  const expensesWithoutSettlement = expenses.filter(e => e.type === 'EXPENSE')

  const numberOfExpenses = expensesWithoutSettlement.length
  const totalAmountForExpenses = expensesWithoutSettlement.reduce(
    (a, c) => a + c.amount,
    0
  )

  return {
    _id,
    name,
    code,
    creation,
    riders,
    events,
    expenses,
    numberOfExpenses,
    totalAmountForExpenses
  }
}

async function joinTrip ({ tripCode, user }) {
  user.color = COLORS[Math.floor(Math.random() * COLORS.length)]
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
  updateLocation,
  getExpensesDetails,
  getEventsCount
}
