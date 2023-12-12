const mongoose = require('mongoose')

const ApartmentSchema = new mongoose.Schema({
  floor: String,
  number: String,
  rooms: Array,
  pictures: Array,
  daily_price: Number,
  accepts_animals: Boolean,
  reserve: {
    status: String,
    client_id: String,
    reserved: {
      reservedAt: String,
      reservedBy: String
    },
    start: Date,
    end: Date
  },
  created: {
    createdBy: String
  },
  updated: {
    updatedBy: String
  }
}, {
  timestamps: {
    createdAt: "created",
    updatedAt: "updated"
  }
})

module.exports = ApartmentSchema