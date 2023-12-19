const mongoose = require('mongoose')

const ApartmentSchema = new mongoose.Schema({
  floor: String,
  number: String,
  rooms: Array,
  daily_price: Number,
  accepts_animals: Boolean,
  reserve: {
    status: String,
    clientId: mongoose.Schema.Types.ObjectId,
    reserved: {
      reservedAt: Date,
      reservedBy: mongoose.Schema.Types.ObjectId
    },
    start: Date,
    end: Date
  },
  created: {
    createdAt: Date,
    createdBy: mongoose.Schema.Types.ObjectId
  },
  updated: {
    updatedAt: Date,
    updatedBy: mongoose.Schema.Types.ObjectId
  }
}, {
  timestamps: {
    createdAt: "created.createdAt",
    updatedAt: "updated.updatedAt"
  }
})

module.exports = ApartmentSchema