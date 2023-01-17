const Trip = require('../models/Trip')

async function findByCode (code) {
  return await Trip.findOne({ code })
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

async function joinByTripCode ({ tripCode, user }) {
  let trip = await findByCode(tripCode)
  if (trip) {
    trip.riders.push(user)
    trip = await trip.save()
  }
  return trip
}

module.exports = {
  findByCode,
  create,
  joinByTripCode,
  getTripsByUserId,
  getRidersByTripId,
  getExpensesByTripId,
  getEventssByTripId
}
