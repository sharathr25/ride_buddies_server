const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = {
  name: String,
  phoneNumber: String,
  color: String,
  uid: { type: String, index: true }
}

const tripSchema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, minLength: 6, maxLength: 6 },
  creation: {
    by: {
      type: userSchema
    },
    on: { type: Date, default: Date.now }
  },
  riders: [
    {
      ...userSchema,
      location: {
        type: [Number]
      },
      on: { type: Date, default: Date.now }
    }
  ],
  events: [
    {
      by: {
        type: userSchema
      },
      type: { type: String, enum: ['CUSTOM'] },
      title: String,
      on: { type: Date, default: Date.now }
    }
  ],
  expenses: [{}]
})

const Trip = mongoose.model('Trip', tripSchema)

module.exports = Trip
