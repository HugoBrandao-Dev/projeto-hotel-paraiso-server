const Analyzer = require('../tools/Analyzer')
const uuid = require('uuid')

let baseURL = 'http://localhost:4000'
const projectLinks = {
  errors: 'https://projetohotelparaiso.dev/docs/erros'
}

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

      res.sendStatus(201)
    } catch(error) {
      next(error)
    }
  }

  async read(req, res, next) {
    try {
      let id = req.params.id

      let idResult = await Analyzer.analyzeID(id)
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
      }
      res.sendStatus(200)
    } catch(error) {
      next(error)
    }
  }

  async list(req, res, next) {
    try {

    } catch(error) {
      next(error)
    }
  }

  async update(req, res, next) {
    try {

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