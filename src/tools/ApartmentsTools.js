const ApartmentCollection = require('../data/ApartmentCollection.json')

class ApartmentsTools {

  // Busca um Apartamento pelo ID cadastrado no JSON (o ID deve estar correto).
  static getApartmentByID(id) {

    try {

      let apartment = ApartmentCollection.apartments.data.find(apto => apto.id == id)

      return apartment

    } catch (error) {
      console.error(error)
    }

  }

  // Pega o menor e o maior Piso de Apartamento cadastrado.
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

  // Pega o menor e o maior Número de Apartamento cadastrado.
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