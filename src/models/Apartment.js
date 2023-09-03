let ApartmentCollection = require('../data/ApartmentCollection.json')
let DateFormated = require('../tools/DateFormated')
let uuid = require('uuid')

// Gera um ID (hardcoded) em Hexadecimal
function genID() {
  return [...Array(24)].map(() => Math.floor(Math.random() * 24).toString(24)).join('')
}

const date = new DateFormated('mongodb')

class Apartment {
  async save(apartment) {
    try {
      apartment.id = await genID()

      apartment.reserve = {
        status: "livre",
        user_id: "",
        date: "",
        start: "",
        end: ""
      }

      apartment.created = {
        createdAt: date.getDateTime(),
        createdBy: genID()
      }
      
      await ApartmentCollection.apartments.data.push(apartment)
      return
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

  async findMany(skip = 0, limit = 20) {
    try {
      let apartments = await ApartmentCollection.apartments.data.slice(skip, limit)
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
      apartment.updated = {
        updatedAt: date.getDateTime(),
        updatedBy: genID()
      }

      let apartmentIndex = await ApartmentCollection.apartments.data.findIndex(doc => doc.id == apartment.id)
      let infos = Object.keys(apartment)
      for (let info of infos) {
        if (info != 'id') {
          ApartmentCollection.apartments.data[apartmentIndex][info] = apartment[info]
        }
      }
      return
    } catch (error) {
      console.log(error)
      return
    }
  }

  async delete(id) {
    try {
      let apartmentIndex = await ApartmentCollection.apartments.data.findIndex(apto => apto.id == id)
      if (apartmentIndex == -1) {
        return 
      } else {
        let apartment = await ApartmentCollection.apartments.data.splice(apartmentIndex, 1)
        return apartment
      }
    } catch (error) {
      console.log(error)
      return
    }
  }
}

module.exports = new Apartment()