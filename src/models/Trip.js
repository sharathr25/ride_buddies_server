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
      by: { type: String, required: true }, // uid
      type: {
        type: String,
        enum: [
          'CUSTOM',
          'SIGHTSEEING',
          'REFUELING',
          'COFEE_BREAK',
          'REPAIR',
          'GOT_LOST',
          'PULL_OVER'
        ]
      },
      title: String,
      on: { type: Date, default: Date.now },
      location: {
        type: [Number]
      }
    }
  ],
  expenses: [
    {
      creation: {
        by: String, // uid,
        on: { type: Date, default: Date.now }
      },
      type: {
        type: String,
        default: 'EXPENSE',
        enum: ['EXPENSE', 'SETTLEMENT']
      },
      location: {
        type: [Number]
      },
      by: { type: String, required: true }, // uid
      title: { type: String, required: true }, // String
      amount: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
      for: [String] // uids - if empty means everyone shares this expense
    }
  ]
})

const Trip = mongoose.model('Trip', tripSchema)

module.exports = Trip
