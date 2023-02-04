const { Server } = require('socket.io')
const {
  getTripByCode,
  addExpense,
  removeExpense,
  updateExpense,
  addEvent,
  updateEvent,
  removeEvent,
  updateLocation
} = require('../controllers/trips.controller')
const authSocketMiddleware = require('../middlewares/auth.socket.middleware')

let io = null

const initSocket = httpServer => {
  io = new Server(httpServer, {})

  io.use(authSocketMiddleware)

  io.on('connection', socket => {
    console.log('A user connected')

    socket.on('disconnect', () => {
      console.log('user disconnected')
    })

    socket.on('join', async (tripCode, sendResponse) => {
      socket.join(`trip:${tripCode}`)
      const trip = await getTripByCode(tripCode)
      sendResponse(trip)
    })

    socket.on('ADD_EXPENSE', async (request, sendResponse) => {
      try {
        const { expense, tripCode } = request
        const newExpense = await addExpense({ expense, tripCode, socket })
        io.in(`trip:${tripCode}`).emit('EXPENSE_ADDED', newExpense)
        console.log('Broadcasting event EXPENSE_ADDED')
        sendResponse({ msg: 'Expense added' })
      } catch (error) {
        console.log(error)
        sendResponse({ error: "Couldn't add expense, try again" })
      }
    })

    socket.on('ADD_SETTLEMENT', async (request, sendResponse) => {
      try {
        const { expense, tripCode } = request
        const newExpense = await addExpense({ expense, tripCode, socket })
        io.in(`trip:${tripCode}`).emit('SETTLEMENT_ADDED', newExpense)
        console.log('Broadcasting event SETTLEMENT_ADDED')
        sendResponse({ msg: 'Settlement done' })
      } catch (error) {
        console.log(error)
        sendResponse({ error: "Couldn't settle, try again" })
      }
    })

    socket.on('UPDATE_EXPENSE', async (request, sendResponse) => {
      try {
        const { expense, tripCode } = request
        const updatedExpense = await updateExpense({ expense, tripCode })
        io.in(`trip:${tripCode}`).emit('EXPENSE_UPDATED', updatedExpense)
        console.log('Broadcasting event EXPENSE_UPDATED')
        sendResponse({ msg: 'Expense updated' })
      } catch (error) {
        console.log(error)
        sendResponse({ error: "Couldn't update expense, try again" })
      }
    })

    socket.on('DELETE_EXPENSE', async (request, sendResponse) => {
      try {
        const { _id, tripCode } = request
        await removeExpense({ _id, tripCode })
        io.in(`trip:${tripCode}`).emit('EXPENSE_DELETED', _id)
        console.log('Broadcasting event EXPENSE_DELETED')
        sendResponse({ msg: 'Expense deleted' })
      } catch (error) {
        console.log(error)
        sendResponse({ error: "Couldn't delete expense, try again" })
      }
    })

    socket.on('ADD_EVENT', async (request, sendResponse) => {
      try {
        const { event, tripCode } = request
        const newEvent = await addEvent({ event, tripCode, socket })
        io.in(`trip:${tripCode}`).emit('EVENT_ADDED', newEvent)
        console.log('Broadcasting event EVENT_ADDED')
        sendResponse({ msg: 'Event added' })
      } catch (error) {
        console.log(error)
        sendResponse({ error: "Couldn't add evet, try again" })
      }
    })

    socket.on('UPDATE_EVENT', async (request, sendResponse) => {
      try {
        const { event, tripCode } = request
        const updatedEvent = await updateEvent({ event, tripCode })
        io.in(`trip:${tripCode}`).emit('EVENT_UPDATED', updatedEvent)
        console.log('Broadcasting event EVENT_UPDATED')
        sendResponse({ msg: 'Event updated' })
      } catch (error) {
        console.log(error)
        sendResponse({ error: "Couldn't update event, try again" })
      }
    })

    socket.on('DELETE_EVENT', async (request, sendResponse) => {
      try {
        const { eventId, tripCode } = request
        await removeEvent({ eventId, tripCode })
        io.in(`trip:${tripCode}`).emit('EVENT_DELETED', eventId)
        console.log('Broadcasting event EVENT_DELETED')
        sendResponse({ msg: 'Event deleted' })
      } catch (error) {
        console.log(error)
        sendResponse({ error: "Couldn't delete event, try again" })
      }
    })

    socket.on('UPDATE_LOCATION', async (request, sendResponse) => {
      try {
        const { location, tripCode } = request
        const updatedLocation = await updateLocation({
          location,
          socket,
          tripCode
        })
        io.in(`trip:${tripCode}`).emit('LOCATION_UPDATED', updatedLocation)
        console.log('Broadcasting event LOCATION_UPDATED')
        sendResponse({ msg: 'Event updated' })
      } catch (error) {
        console.log(error)
        sendResponse({ error: "Couldn't update location, try again" })
      }
    })
  })
}

module.exports = initSocket
