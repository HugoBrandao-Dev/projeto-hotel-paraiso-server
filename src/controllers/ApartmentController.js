const Analyzer = require('../tools/Analyzer')
const uuid = require('uuid')

let baseURL = 'http://localhost:4000'
const projectLinks = {
  errors: 'https://projetohotelparaiso.dev/docs/erros'
}

// Models
const Apartment = require('../models/Apartment')

class ApartmentController {
  async create(req, res, next) {
    try {
      let errorFields = []
      const {
        floor,
        number,
        rooms,
        daily_price
      } = req.body

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

      let apartment = {}
      apartment.floor = floor
      apartment.number = number
      apartment.rooms = rooms
      apartment.daily_price = daily_price
      
      await Apartment.save(apartment)
      res.sendStatus(201)
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
      let HATEOAS = [
        {
          href: `${ baseURL }/apartments/${ req.params.id }`,
          method: 'GET',
          rel: 'self_apartment'
        },
        {
          href: `${ baseURL }/apartments/${ req.params.id }`,
          method: 'PUT',
          rel: 'edit_apartment'
        },
        {
          href: `${ baseURL }/apartments/${ req.params.id }`,
          method: 'DELETE',
          rel: 'delete_apartment'
        },
        {
          href: `${ baseURL }/apartments`,
          method: 'GET',
          rel: 'apartment_list'
        }
      ]

      apartment._links = HATEOAS

      res.status(200)
      res.json(apartment)
    } catch(error) {
      next(error)
    }
  }

  async list(req, res, next) {
    try {
      let apartments = await Apartment.findMany()
      if (apartments) {
        for (let apartment of apartments) {
          let HATEOAS = [
            {
              href: `${ baseURL }/apartments/${ apartment.id }`,
              method: 'GET',
              rel: 'self_apartment'
            },
            {
              href: `${ baseURL }/apartments/${ apartment.id }`,
              method: 'PUT',
              rel: 'edit_apartment'
            },
            {
              href: `${ baseURL }/apartments/${ apartment.id }`,
              method: 'DELETE',
              rel: 'delete_apartment'
            },
          ]
          apartment._links = HATEOAS
        }
        res.status(200)
        res.json({ apartments })
      }
    } catch(error) {
      next(error)
    }
  }

  async update(req, res, next) {
    try {
      const {
        id,
        floor,
        number,
        rooms,
        daily_price
      } = req.body

      let errorFields = []
      let apartment = {}

      if (id) {
        const idResult = await Analyzer.analyzeID(id, 'apartment')
        if (idResult.hasError.value) {
          errorFields.push(idResult)
        } else {
          apartment.id = id
        }
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

      await Apartment.edit(apartment)
      res.status(200)
      res.json({})
    } catch(error) {
      next(error)
    }
  }

  async delete(req, res, next) {
    try {

    } catch(error) {
      next(error)
    }
  }
}

module.exports = new ApartmentController()