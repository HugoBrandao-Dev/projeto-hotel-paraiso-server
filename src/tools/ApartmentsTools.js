const ApartmentCollection = require('../data/ApartmentCollection.json')
const UserCollection = require('../data/UserCollection.json')

const fileSystem = require('fs')
const path = require('path')
const _ = require('lodash')

class ApartmentsTools {

  // Busca um Apartamento pelo ID cadastrado no JSON (o ID deve estar correto).
  static getApartmentByID(id) {

    try {

      let result = ApartmentCollection.apartments.data.find(apto => apto.id == id)

      let apartment = _.cloneDeep(result)
      delete apartment.created
      delete apartment.updated

      let userWhoCreated = UserCollection.users.data.find(user => user.id == result.created.createdBy)
      apartment.created = {
        createdAt: result.created.createdAt,
        createdBy: {
          id: userWhoCreated.id,
          name: userWhoCreated.name,
        }
      }

      if (result.updated.updatedBy) {
        let userWhoUpdated = UserCollection.users.data.find(user => user.id == result.updated.updatedBy)
        apartment.updated = {
          updatedAt: result.updated.updatedAt,
          updatedBy: {
            id: userWhoUpdated.id,
            name: userWhoUpdated.name,
          }
        }
      } else {
        apartment.updated = {
          updatedAt: "",
          updatedBy: {
            id: "",
            name: "",
          }
        }
      }

      if (result.reserve.reserved.reservedBy) {
        let reservedBy = result.reserve.reserved.reservedBy
        let userWhoReserved = UserCollection.users.data.find(user => user.id == reservedBy)

        delete apartment.reserve.reserved.reservedBy

        apartment.reserve.reserved.reservedBy = {
          id: userWhoReserved.id,
          name: userWhoReserved.name,
        }
      } else {
        apartment.reserve.reserved.reservedBy = {
          id: "",
          name: "",
        }
      }

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

    let src = path.resolve(__dirname, `../tmp/uploads/apartments/${ apartment_number }`)

    let hasFolder = fileSystem.existsSync(src) ? true : false

    if (hasFolder) {
      let result = fileSystem.readdirSync(src).map(picture => {
        return picture.slice(picture.indexOf('&') + 1)
      })
      return result
    } else {
      return []
    }

  }

  static getApartments(isClient, _offset = 0, _limit = 20) {

    try {

      let offset = parseInt(_offset)
      let limit = parseInt(_limit)

      let apartmentsForClient = ApartmentCollection.apartments.data.filter(apto => apto.reserve.status == 'livre')

      let result = null

      if (isClient) {
        result = apartmentsForClient.slice(_offset, limit)
      } else {
        result = ApartmentCollection.apartments.data.slice(_offset, limit + 1)
      }

      let apartments = []

      for (let apto of result) {
        apartments.push(_.cloneDeep(apto))
      }

      const hasNext = apartments.length > limit
      if (hasNext)
        apartments.pop()

      return {
        apartments,
        hasNext
      }

    } catch (error) {
      console.log(error)
    }

  }

}

module.exports = ApartmentsTools