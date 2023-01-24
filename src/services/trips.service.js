const Trip = require('../models/Trip')

async function findByCode (code) {
  return await Trip.findOne({ code })
}

async function getTripOverviewByCode (code) {
  const trip = await findByCode(code)

  const expensesGrouped = await Trip.aggregate([
    { $match: { code: code } },
    { $project: { expenses: 1 } },
    { $unwind: '$expenses' },
    {
      $group: {
        _id: '$expenses.by',
        amount: { $sum: '$expenses.amount' }
      }
    }
  ])

  const eventsGrouped = await Trip.aggregate([
    { $match: { code: code } },
    { $project: { events: 1 } },
    { $unwind: '$events' },
    {
      $group: {
        _id: '$events.type',
        count: { $sum: 1 }
      }
    }
  ])

  return {
    _id: trip._id,
    name: trip.name,
    code: trip.code,
    creation: trip.creation,
    riders: trip.riders,
    events: trip.events,
    expenses: trip.expenses,
    eventsGrouped,
    expensesGrouped
  }
}

async function getTripsByUserId (uid) {
  return await Trip.find({
    $or: [{ 'creation.by.uid': uid }, { riders: { $elemMatch: { uid } } }]
  }).select({
    name: 1,
    code: 1,
    creation: 1
  })
}

async function getRidersByTripId (id) {
  return await Trip.findById(id).select({
    riders: 1
  })
}

async function getExpensesByTripId (id) {
  return await Trip.findById(id).select({
    expenses: 1
  })
}

async function getEventssByTripId (id) {
  return await Trip.findById(id).select({
    events: 1
  })
}

async function create ({ name, code, user }) {
  return await new Trip({
    name,
    code,
    creation: {
      by: user
    },
    riders: [user]
  }).save()
}

async function addRiderToTrip ({ tripCode, user }) {
  let trip = await findByCode(tripCode)
  if (trip) {
    trip.riders.push(user)
    trip = await trip.save()
  }
  return trip
}

async function saveNewExpense ({ tripCode, expense, uid }) {
  const trip = await Trip.findOneAndUpdate(
    { code: tripCode },
    {
      $push: {
        expenses: {
          ...expense,
          creation: {
            by: uid
          }
        }
      }
    },
    {
      new: true
    }
  )
  return trip.expenses[trip.expenses.length - 1]
}

async function updateTripExpense ({ tripCode, expense }) {
  await Trip.findOneAndUpdate(
    { code: tripCode, expenses: { $elemMatch: { _id: expense._id } } },
    {
      $set: {
        'expenses.$.title': expense.title,
        'expenses.$.amount': expense.amount,
        'expenses.$.for': expense.for,
        'expenses.$.by': expense.by
      }
    },
    {
      new: true
    }
  )
  return expense
}

async function deleteExpense ({ expenseId, tripCode }) {
  await Trip.updateOne(
    { code: tripCode },
    { $pullAll: { expenses: [{ _id: expenseId }] } }
  )
  return expenseId
}

async function saveNewEvent ({ tripCode, event, uid }) {
  const trip = await Trip.findOneAndUpdate(
    { code: tripCode },
    {
      $push: {
        events: {
          ...event,
          by: uid
        }
      }
    },
    {
      new: true
    }
  )
  return trip.events[trip.events.length - 1]
}

async function updateTripEvent ({ tripCode, event }) {
  await Trip.findOneAndUpdate(
    { code: tripCode, events: { $elemMatch: { _id: event._id } } },
    {
      $set: {
        'expenses.$.title': event.title,
        'expenses.$.type': event.type
      }
    },
    {
      new: true
    }
  )
  return event
}

async function deleteEvent ({ eventId, tripCode }) {
  await Trip.updateOne(
    { code: tripCode },
    { $pullAll: { events: [{ _id: eventId }] } }
  )
  return eventId
}

module.exports = {
  findByCode,
  create,
  addRiderToTrip,
  getTripsByUserId,
  getRidersByTripId,
  getExpensesByTripId,
  getEventssByTripId,
  getTripOverviewByCode,
  saveNewExpense,
  deleteExpense,
  updateTripExpense,
  saveNewEvent,
  updateTripEvent,
  deleteEvent
}
