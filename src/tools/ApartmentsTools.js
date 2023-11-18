const ApartmentCollection = require('../data/ApartmentCollection.json')
const UserCollection = require('../data/UserCollection.json')

const fileSystem = require('fs')
const path = require('path')
const _ = require('lodash')

const Generator = require('./Generator')

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

  static getApartments(query = {}, hasPrivs = false) {

    try {

      let {
        status,
        rooms,
        lowest_daily_price,
        highest_daily_price,
        accepts_animals,
        offset,
        limit,
        sort
      } = query

      if (!offset) {
        offset = 0
      }
      if (!limit) {
        limit = 20
      }

      if (!hasPrivs)
        status = 'livre'

      let result = ApartmentCollection.apartments.data

      if (status)
        result = result.filter(apto => apto.reserve.status == status)

      if (rooms)
        result = result.filter(apto => {
          const roomsAmont = apto.rooms.map(room => parseInt(room.quantity)).reduce((acu, next) => acu + next)
          return roomsAmont == rooms
        })

      if (lowest_daily_price)
        result = result.filter(apto => apto.daily_price >= lowest_daily_price)

      if (highest_daily_price)
        result = result.filter(apto => apto.daily_price <= highest_daily_price)

      if (accepts_animals != undefined)
        result = result.filter(apto => apto.accepts_animals == accepts_animals)

      result = result.slice(offset, (offset + limit + 1))

      let apartments = []

      for (let apto of result) {
        apartments.push(_.cloneDeep(apto))
      }

      for (let apto of apartments) {
        apto._links = Generator.genHATEOAS(apto.id, 'apartments', 'apartment', false)
      }

      // O hasNext é calculado antes, para ficar mais fácil trabalhar com o sort 'DESC'.
      const hasNext = apartments.length > limit
      if (hasNext)
        apartments.pop()

      if (sort) {
        const sortType = sort.split(':')[1]

        if (sortType == 'asc') {
          apartments = apartments.sort((apto1, apto2) => apto1.daily_price - apto2.daily_price)
        } else {

          // O elemento extra (do hasNext) é retirado anteriormente.
          apartments = apartments.sort((apto1, apto2) => apto2.daily_price - apto1.daily_price)
        }
      }

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