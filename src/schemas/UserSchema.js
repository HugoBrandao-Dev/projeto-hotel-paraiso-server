const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: Number,
  phoneCode: String,
  phoneNumber: String,
  birthDate: Date,
  cpf: String,
  address: {
    country: String,
    state: String,
    cep: String,
    city: String,
    passportNumber: String,
    neighborhood: String,
    road: String,
    house_number: String,
    information: String
  },
  created: {
    createdBy: String
  },
  updated: {
    updatedBy: String
  }
}, 
{
  timestamps: {
    createdAt: "created",
    updatedAt: "updated"
  }
})

module.exports = UserSchema