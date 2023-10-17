const Analyzer = require('../tools/Analyzer')
const Generator = require('../tools/Generator')
const jwt = require('jsonwebtoken')

let baseURL = 'http://localhost:4000'
const projectLinks = {
  errors: 'https://projetohotelparaiso.dev/docs/erros'
}

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

      if (req.body.apartment) {
        let parsedApartment = JSON.parse(req.body.apartment)
        floor = parsedApartment.floor
        number = parsedApartment.number
        rooms = parsedApartment.rooms
        daily_price = parsedApartment.daily_price
      } else {
        floor = req.body.floor
        number = req.body.number
        rooms = req.body.rooms
        daily_price = req.body.daily_price
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

      if (errorFields.length) {
        let codes = errorFields.map(item => item.hasError.type)

        // Cria um array contendo os Status codes dos erros encontrados.
        let status = codes.map(code => {
          switch(code) {
            case 3:
              return '404'
              break
            default:
              return '400'
          }
        })
        let messages = errorFields.map(item => item.hasError.error)
        let moreinfos = errorFields.map(item => `${ projectLinks.errors }/${ item.hasError.type }`)
        res.status(400)
        res.json({ 
          RestException: {
            "Code": codes.length > 1 ? codes.join(';') : codes.toString(),
            "Message": messages.length > 1 ? messages.join(';') : messages.toString(),
            "Status": status.length > 1 ? status.join(';') : status.toString(),
            "MoreInfo": moreinfos.length > 1 ? moreinfos.join(';') : moreinfos.toString(),
            "ErrorFields": errorFields
          }
        })
        return
      }

      const decodedToken = getDecodedToken(req.headers['authorization'])

      let apartment = {}
      apartment.floor = floor
      apartment.number = number
      apartment.rooms = rooms
      apartment.daily_price = daily_price
      apartment.reserve = {
        status: "livre",
        user_id: "",
        reservedIn: "",
        start: "",
        end: "",
      }
      apartment.created = {
        createdAt: '',
        createdBy: ''
      }
      apartment.updated = {
        updatedAt: '',
        updatedBy: ''
      }
      
      await Apartment.save(apartment, decodedToken.id)
      const savedApartment = await Apartment.findByNumber(number)

      let HATEOAS = Generator.genHATEOAS(savedApartment.id, 'apartments', 'apartment', true)

      res.status(201)
      res.json({ _links: HATEOAS })
    } catch(error) {
      next(error)
    }
  }

  async read(req, res, next) {
    try {
      let id = req.params.id

      let idResult = await Analyzer.analyzeID(id, 'apartment')
      if (idResult.hasError.value) {
        let RestException = {
          Code: '',
          Message: '',
          Status: '',
          MoreInfo: ''
        }

        switch (idResult.hasError.type) {
          case 3:
            RestException.Status = "404"
            break
          default:
            RestException.Status = "400"
        }
        RestException.Code = `${ idResult.hasError.type }`
        RestException.Message = `${ idResult.hasError.error }`
        RestException.MoreInfo = `${ projectLinks.errors }/${ idResult.hasError.type }`
        res.status(parseInt(RestException.Status))
        res.json({ RestException })
        return
      }
      
      let apartment = await Apartment.findOne(id)
      let pictures = await Apartment.findPictures(apartment.number)
      if (pictures.length)
        apartment.pictures = pictures
      else 
        apartment.pictures = []

      let HATEOAS = Generator.genHATEOAS(id, 'apartments', 'apartment', true)

      apartment._links = HATEOAS

      res.status(200)
      res.json(apartment)
    } catch(error) {
      next(error)
    }
  }

  async list(req, res, next) {
    try {
      let hasNext = false
      let apartments = []

      // Skip é equivalente ao offset, no mongodb.
      let skip = req.query.offset ? parseInt(req.query.offset) : 0

      // A quantidade PADRÃO de itens a serem exibidos por página é 20.
      let limit = req.query.limit ? parseInt(req.query.limit) : 20

      // + 1 é para verificar se há mais item(s) a serem exibidos (para usar no hasNext).
      apartments = await Apartment.findMany(skip, limit + 1)

      if (apartments.length) {
        hasNext = apartments.length > (limit - skip)

        // Retira o dado extra para cálculo do hasNext.
        apartments.pop()

        for (let apartment of apartments) {
          let HATEOAS = Generator.genHATEOAS(apartment.id, 'apartments', 'apartment', false)
          apartment._links = HATEOAS
        }

        res.status(200)
        res.json({ apartments, hasNext })
      }     
    } catch(error) {
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

      const idResult = await Analyzer.analyzeID(id, 'apartment')
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
        let codes = errorFields.map(item => item.hasError.type)

        // Cria um array contendo os Status codes dos erros encontrados.
        let status = codes.map(code => {
          switch(code) {
            case 3:
              return '404'
              break
            default:
              return '400'
          }
        })
        let messages = errorFields.map(item => item.hasError.error)
        let moreinfos = errorFields.map(item => `${ projectLinks.errors }/${ item.hasError.type }`)
        res.status(parseInt(status))
        res.json({ 
          RestException: {
            "Code": codes.length > 1 ? codes.join(';') : codes.toString(),
            "Message": messages.length > 1 ? messages.join(';') : messages.toString(),
            "Status": status.length > 1 ? status.join(';') : status.toString(),
            "MoreInfo": moreinfos.length > 1 ? moreinfos.join(';') : moreinfos.toString(),
            "ErrorFields": errorFields
          }
        })
        return
      }

      let HATEOAS = Generator.genHATEOAS(id, 'apartments', 'apartment', true)

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

      let idResult = await Analyzer.analyzeID(id, 'apartment')
      if (idResult.hasError.value) {
        if (idResult.hasError.type != 4) {
          switch (idResult.hasError.type) {
            case 2:
              RestException.Status = "400"
              break
            default:
              RestException.Status = "404"
          }

          RestException.Code = `${ idResult.hasError.type }`
          RestException.Message = idResult.hasError.error
          RestException.MoreInfo = `${ projectLinks.errors }/${ idResult.hasError.type }`
        }

        res.status(parseInt(RestException.Status))
        res.json({ RestException })
        return
      }

      await Apartment.delete(id)
      res.sendStatus(200)
    } catch(error) {
      next(error)
    }
  }
}

module.exports = new ApartmentController()