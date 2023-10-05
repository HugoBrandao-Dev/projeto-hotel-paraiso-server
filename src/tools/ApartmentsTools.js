const ApartmentCollection = require('../data/ApartmentCollection.json')

class ApartmentsTools {

  static getMinMaxFloor() {

    try {

      let floors = ApartmentCollection.apartments.data.map(apartment => parseInt(apartment.floor))
      let min = floors.reduce((now, next) => Math.min(now, next))
      let max = floors.reduce((now, next) => Math.max(now, next))

      return { min, max }

    } catch (error) {
      console.error(error)
    }

  }

  static getMinMaxNumber() {

    try {

      let numbers = ApartmentCollection.apartments.data.map(apartment => parseInt(apartment.number))
      let min = numbers.reduce((now, next) => Math.min(now, next))
      let max = numbers.reduce((now, next) => Math.max(now, next))

      return { min, max }

    } catch (error) {
      console.error(error)
    }

  }

}

module.exports = ApartmentsTools