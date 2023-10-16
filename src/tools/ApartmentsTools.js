const ApartmentCollection = require('../data/ApartmentCollection.json')
const fileSystem = require('fs')
const path = require('path')

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

  // Pega as imagens de um apartamento, utilizando o Número informado.
  static getPictures(apartment_number) {

    return new Promise((resolve, reject) => {

      fileSystem.readdir(path.resolve(__dirname, `../tmp/uploads/apartments/${ apartment_number }`), (error, response) => {
        if (error)
          reject(error)
        else
          resolve(response)
      })

    })

  }

  static getApartments(_offset = 0, _limit = 20) {

    try {

      let offset = parseInt(_offset)
      let limit = parseInt(_limit)

      let result = ApartmentCollection.apartments.data.slice(offset, (offset + limit + 1))

      const hasNext = result.length > limit
      if (hasNext)
        result.pop()

      return {
        result,
        hasNext
      }

    } catch (error) {
      console.log(error)
    }

  }

}

module.exports = ApartmentsTools