const mongoose = require('mongoose')

/*
Por padrão, mongoose coloca o valor do updateAt o mesmo do createAt, mesmo durante a CRIAÇÃO do 
objeto.
*/

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: Number,
  phoneCode: String,
  phoneNumber: String,
  birthDate: Date,
  cpf: String,
  passportNumber: String,
  address: {
    country: String,
    state: String,
    cep: String,
    city: String,
    neighborhood: String,
    road: String,
    houseNumber: String,
    information: String,
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
    createdAt: 'created.createdAt',
    updatedAt: 'updated.updatedAt'
  }
})

module.exports = UserSchema