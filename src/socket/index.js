const { Server } = require('socket.io')
const {
  getTripByCode,
  addExpense,
  removeExpense,
  updateExpense
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
        sendResponse({ msg: 'New expense added' })
      } catch (error) {
        console.log(error)
        sendResponse({ error: "Couldn't add expense, try again" })
      }
    })

    socket.on('UPDATE_EXPENSE', async (request, sendResponse) => {
      try {
        const { expense, tripCode } = request
        const updatedExpense = await updateExpense({ expense, tripCode })
        io.in(`trip:${tripCode}`).emit('EXPENSE_UPDATED', updatedExpense)
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
        sendResponse({ msg: 'expense deleted' })
      } catch (error) {
        console.log(error)
        sendResponse({ error: "Couldn't delete expense, try again" })
      }
    })
  })
}

module.exports = initSocket
