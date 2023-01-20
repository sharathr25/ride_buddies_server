const { getTripByCode } = require('../controllers/trips.controller')

const handleSocket = socket => {
  console.log('A user connected')

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })

  socket.on('join', async (room, ackFn) => {
    socket.join(room)
    const [_, tripCode] = room.split(':')
    const trip = await getTripByCode(tripCode)
    ackFn(trip)
  })
}

module.exports = handleSocket
