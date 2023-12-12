const Analyzer = require('../tools/Analyzer')
const Generator = require('../tools/Generator')
const jwt = require('jsonwebtoken')
const _ = require('lodash')

const User = require('../models/User')

let baseURL = 'http://localhost:4000'

function getDecodedToken(bearerToken) {

  const secret = 'k372gkhcfmhg6l9nj19i51ng'
  let token = bearerToken.split(' ')[1]
  let decodedToken = null
  jwt.verify(token, secret, function(error, decoded) {

    if (error) {
      console.log(error)
      return ''
    } else {
      decodedToken = decoded
    }

  })

  return decodedToken

}

// Models
const Apartment = require('../models/Apartment')

class ApartmentController {

  async create(req, res, next) {

    try {

      let floor = null
      let number = null
      let rooms = null
      let daily_price = null
      let accepts_animals = null

      if (req.body.apartment) {
        let parsedApartment = JSON.parse(req.body.apartment)
        floor = parsedApartment.floor
        number = parsedApartment.number
        rooms = parsedApartment.rooms
        daily_price = parsedApartment.daily_price
        accepts_animals = parsedApartment.accepts_animals
      } else {
        floor = req.body.floor
        number = req.body.number
        rooms = req.body.rooms
        daily_price = req.body.daily_price
        accepts_animals = req.body.accepts_animals
      }

      let errorFields = []

      const floorResult = Analyzer.analyzeApartmentFloor(floor)
      if (floorResult.hasError.value) {
        errorFields.push(floorResult)
      }

      const numberResult = await Analyzer.analyzeApartmentNumber(number)
      if (numberResult.hasError.value) {
        errorFields.push(numberResult)
      }

      const roomsResult = Analyzer.analyzeApartmentRooms(rooms)
      if (roomsResult.hasError.value) {
        errorFields.push(roomsResult)
      }

      const dailyPriceResult = Analyzer.analyzeApartmentDailyPrice(daily_price)
      if (dailyPriceResult.hasError.value) {
        errorFields.push(dailyPriceResult)
      }

      const acceptsAnimalsResult = Analyzer.analyzeApartmentAcceptsAnimals(accepts_animals)
      if (acceptsAnimalsResult.hasError.value) {
        errorFields.push(acceptsAnimalsResult)
      }

      if (errorFields.length) {
        const RestException = Generator.genRestException(errorFields)
        res.status(parseInt(RestException.Status))
        res.json({ RestException })
        return
      }

      const decodedToken = getDecodedToken(req.headers['authorization'])

      let apartment = {}
      apartment.id = Generator.genID()
      apartment.floor = floor
      apartment.number = number
      apartment.rooms = rooms
      apartment.pictures = await Apartment.findPictures(apartment.number)
      apartment.daily_price = daily_price
      apartment.accepts_animals = accepts_animals
      apartment.reserve = {
        status: "livre",
        client_id: "",
        reserved: {
          reservedAt: "",
          reservedBy: "",
        },
        start: "",
        end: "",
      }
      
      await Apartment.save(apartment, decodedToken.id)
      const savedApartment = await Apartment.findByNumber(number)

      let HATEOAS = Generator.genHATEOAS(savedApartment.id, 'apartment', 'apartments', true)

      res.status(201)
      res.json({ _links: HATEOAS })

    } catch(error) {
      next(error)
    }

  }

  async read(req, res, next) {

    try {

      let id = req.params.id

      let errorFields = []

      let idResult = await Analyzer.analyzeApartmentID(id)
      if (idResult.hasError.value)
        errorFields.push(idResult)

      if (errorFields.length) {
        const RestException = Generator.genRestException(errorFields)
        res.status(parseInt(RestException.Status))
        res.json({ RestException })
        return
      }
      
      let result = await Apartment.findOne(id)

      let apartment = _.cloneDeep(result)

      delete apartment.created
      delete apartment.updated

      if (req.headers['authorization']) {
        const decodedToken = getDecodedToken(req.headers['authorization'])
        if (decodedToken.role > 0) {
          const userWhoCreated = await User.findOne(result.created.createdBy)

          // Setta os valores do CREATED.
          apartment.created = {
            createdAt: result.created.createdAt,
            createdBy: {
              id: userWhoCreated.id,
              name: userWhoCreated.name
            }
          }

          if (result.updated.updatedBy) {
            const userWhoUpdated = await User.findOne(result.updated.updatedBy)

            // Setta os valores do UPDATED.
            apartment.updated = {
              updatedAt: result.updated.updatedAt,
              updatedBy: {
                id: userWhoUpdated.id,
                name: userWhoUpdated.name
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
        } else {
          delete apartment.reserve
        }
      } else {
        delete apartment.reserve
      }

      let HATEOAS = Generator.genHATEOAS(id, 'apartment', 'apartments', true)

      apartment._links = HATEOAS

      res.status(200)
      res.json(apartment)

    } catch(error) {
      console.log(error)
      next(error)
    }

  }

  async list(req, res, next) {

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
      } = req.query

      let skip = null
      let decodedToken = null
      let hasPrivs = false // Funcionário++
      if (req.headers['authorization']) {
        decodedToken = getDecodedToken(req.headers['authorization'])
        hasPrivs = decodedToken.role > 0
      }
      let query = {}
      let errorFields = []

      let listOfQueryString = Object.keys(req.query)

      if (listOfQueryString.length) {
        let queryStringResult = Analyzer.analyzeQueryList(listOfQueryString, 'apartments', hasPrivs)
        if (queryStringResult.hasError.value) {
          errorFields.push(queryStringResult)
        } else {

          // Array de todas as Query String que foram passadas, com ou sem valor.
          let queryStringArray = Object.keys(req.query)

          if (queryStringArray.includes('status')) {
            let statusResult = await Analyzer.analyzeApartmentFilterStatus(status)
            if (statusResult.hasError.value)
              errorFields.push(statusResult)
            else
              query.status = status
          }

          if (queryStringArray.includes('rooms')) {
            let roomsResult = await Analyzer.analyzeApartmentFilterRooms(rooms)
            if (roomsResult.hasError.value)
              errorFields.push(roomsResult)
            else
              query.rooms = rooms
          }

          if (queryStringArray.includes('lowest_daily_price')) {
            let lowestDailyPriceResult = await Analyzer.analyzeApartmentFilterLowestDailyPrice(lowest_daily_price)
            if (lowestDailyPriceResult.hasError.value)
              errorFields.push(lowestDailyPriceResult)
            else
              query.lowest_daily_price = lowest_daily_price
          }

          if (queryStringArray.includes('highest_daily_price')) {
            let highestDailyPriceResult = await Analyzer.analyzeApartmentFilterHighestDailyPrice(highest_daily_price, lowest_daily_price)
            if (highestDailyPriceResult.hasError.value)
              errorFields.push(highestDailyPriceResult)
            else
              query.highest_daily_price = highest_daily_price
          }

          if (queryStringArray.includes('accepts_animals')) {
            let acceptsAnimalsResult = await Analyzer.analyzeApartmentFilterAcceptsAnimals(accepts_animals)
            if (acceptsAnimalsResult.hasError.value)
              errorFields.push(acceptsAnimalsResult)
            else
              query.accepts_animals = accepts_animals
          }

          if (queryStringArray.includes('offset')) {
            let offsetResult = await Analyzer.analyzeFilterSkip(offset, hasPrivs)
            if (offsetResult.hasError.value) {
              errorFields.push(offsetResult)
            } else {
              // Skip é equivalente ao offset, no mongodb.
              query.skip = Number.parseInt(offset)

              let limitResult = Analyzer.analyzeFilterLimit(limit)
              if (limitResult.hasError.value)
                errorFields.push(limitResult)
              else
                query.limit = Number.parseInt(limit) + 1
            }
          } else {
            query.skip = 0
            query.limit = 20 + 1
          }

          if (queryStringArray.includes('sort')) {
            let sortResult = await Analyzer.analyzeApartmentFilterSort(sort)
            if (sortResult.hasError.value)
              errorFields.push(sortResult)
            else
              query.sort = sort
          }

        }
      } else {
        query.skip = 0
        query.limit = 20 + 1
      }

      if (errorFields.length) {
        const RestException = Generator.genRestException(errorFields)
        res.status(parseInt(RestException.Status))
        res.json({ RestException })
        return
      }

      let results = await Apartment.findMany(query, hasPrivs)
      let apartments = []

      for (let item of results) {

        let apartment = _.cloneDeep(item)

        delete apartment.created
        delete apartment.updated

        if (decodedToken && decodedToken.role > 0) {
          const userWhoCreated = await User.findOne(item.created.createdBy)

          // Setta os valores do CREATED.
          apartment.created = {
            createdAt: item.created.createdAt,
            createdBy: {
              id: userWhoCreated.id,
              name: userWhoCreated.name
            }
          }

          if (item.updated.updatedBy) {
            const userWhoUpdated = await User.findOne(item.updated.updatedBy)

            // Setta os valores do UPDATED.
            apartment.updated = {
              updatedAt: item.updated.updatedAt,
              updatedBy: {
                id: userWhoUpdated.id,
                name: userWhoUpdated.name
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
        } else {
          delete apartment.reserve
        }
        
        let HATEOAS = Generator.genHATEOAS(apartment.id, 'apartment', 'apartments', false)
        apartment._links = HATEOAS

        apartments.push(apartment)
      }

      let hasNext = apartments.length > query.limit - 1

      // Retira o dado extra para cálculo do hasNext.
      if (hasNext)
        apartments.pop()

      if (apartments.length) {
        res.status(200)
        res.json({ apartments, hasNext })
      } else {
        res.sendStatus(404)
      }

    } catch(error) {
      throw new Error(error)
      next(error)
    }

  }

  async update(req, res, next) {

    try {

      let id = null
      let floor = null
      let number = null
      let rooms = null
      let picturesToBeDeleted = []
      let daily_price = null

      if (req.body.apartment) {
        let parsedApartment = JSON.parse(req.body.apartment)
        id = parsedApartment.id
        floor = parsedApartment.floor
        number = parsedApartment.number
        rooms = parsedApartment.rooms
        if (parsedApartment.picturesToBeDeleted && parsedApartment.picturesToBeDeleted.length) {
          picturesToBeDeleted = parsedApartment.picturesToBeDeleted
        }
        daily_price = parsedApartment.daily_price
      } else {
        id = req.body.id
        floor = req.body.floor
        number = req.body.number
        rooms = req.body.rooms
        if (req.body.picturesToBeDeleted && req.body.picturesToBeDeleted.length) {
          picturesToBeDeleted = req.body.picturesToBeDeleted
        }
        daily_price = req.body.daily_price
      }

      let errorFields = []
      let apartment = {}

      const idResult = await Analyzer.analyzeApartmentID(id)
      if (idResult.hasError.value) {
        if (idResult.hasError.value != 4)
          errorFields.push(idResult)
      } else {
        apartment.id = id
      }

      let apartmentRegistred = await Apartment.findByNumber(number)

      if (floor) {
        const floorResult = Analyzer.analyzeApartmentFloor(floor)
        if (floorResult.hasError.value) {
          errorFields.push(floorResult)
        } else {
          apartment.floor = floor
        }
      }
      
      if (number) {
        const numberResult = await Analyzer.analyzeApartmentNumber(number)
        if (numberResult.hasError.value) {

          // Verifica se está tentando atualizar com um número de apartamento que já está cadastrado.
          if (numberResult.hasError.type == 4) {

            // Verifica se o número do apartamento já pertence a ele próprio.
            let isTheSameApartment = apartmentRegistred.id == id

            if (!isTheSameApartment) {
              errorFields.push(numberResult)
            }
          }
        } else {
          apartment.number = number
        }
      }
      
      if (rooms) {
        const roomsResult = Analyzer.analyzeApartmentRooms(rooms)
        if (roomsResult.hasError.value) {
          errorFields.push(roomsResult)
        } else {
          apartment.rooms = rooms
        }
      }

      if (picturesToBeDeleted.length)
        apartment.picturesToBeDeleted = picturesToBeDeleted
      else
        apartment.picturesToBeDeleted = []
      
      if (daily_price) {
        const dailyPriceResult = Analyzer.analyzeApartmentDailyPrice(daily_price)
        if (dailyPriceResult.hasError.value) {
          errorFields.push(dailyPriceResult)
        } else {
          apartment.daily_price = daily_price        
        }
      }
      
      if (errorFields.length) {
        const RestException = Generator.genRestException(errorFields)
        res.status(parseInt(RestException.Status))
        res.json({ RestException })
        return
      }

      let HATEOAS = Generator.genHATEOAS(id, 'apartment', 'apartments', true)

      const decodedToken = getDecodedToken(req.headers['authorization'])

      await Apartment.edit(apartment, decodedToken.id)

      res.status(200)
      res.json({ _links: HATEOAS })

    } catch(error) {
      next(error)
    }

  }

  async remove(req, res, next) {

    try {

      let id = req.params.id

      let RestException = {}

      let errorFields = []

      let idResult = await Analyzer.analyzeApartmentID(id)
      if (idResult.hasError.value)
        errorFields.push(idResult)

      if (errorFields.length) {
        const RestException = Generator.genRestException(errorFields)
        res.status(parseInt(RestException.Status))
        res.json({ RestException })
        result
      }

      await Apartment.delete(id)
      res.sendStatus(200)

    } catch(error) {
      next(error)
    }

  }

}

module.exports = new ApartmentController()