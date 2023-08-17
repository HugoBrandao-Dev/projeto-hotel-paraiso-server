let ApartmentCollection = require('../data/ApartmentCollection.json')
let DateFormated = require('../tools/DateFormated')
let uuid = require('uuid')

class Apartment {
  async save(apartment) {
    try {

    } catch (error) {
      console.log(error)
      return
    }
  }

  async findOne(id) {
    try {
      let apartment = await ApartmentCollection.apartments.data.find(ap => ap.id == id)
      return apartment
    } catch (error) {
      console.log(error)
      return []
    }
  }

  async findMany() {
    try {
      let apartments = ApartmentCollection.apartments.data.map(apartment => apartment)
      return apartments
    } catch (error) {
      console.log(error)
      return []
    }
  }

  // Busca por um apartamento pelo seu Número
  async findByNumber(number) {
    try {
      let apartment = await ApartmentCollection.apartments.data.find(ap => ap.number == number)
      return apartment
    } catch (error) {
      console.log(error)
      return []
    }
  }

  async edit(apartment) {
    try {

    } catch (error) {
      console.log(error)
      return
    }
  }

  async delete(id) {
    try {

    } catch (error) {
      console.log(error)
      return
    }
  }
}

module.exports = new Apartment()