const Analyzer = require('../tools/Analyzer')

let baseURL = 'http://localhost:4000'
const projectLinks = {
  errors: 'https://projetohotelparaiso.dev/docs/erros'
}

// Models
const Apartment = require('../models/Apartment')

class ReserveController {
  async list(req, res, next) {
    try {

    } catch (error) {
      next(error)
    }
  }

  async update(req, res, next) {
    try {
      const {
        apartment_id,
        status,
        user_id,
        date,
        start,
        end
      } = req.body

      let errorFields = []

      let apartmentIDResult = await Analyzer.analyzeID(apartment_id, 'apartment')
      if (apartmentIDResult.hasError.value) {
        errorFields.push(apartmentIDResult)
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

      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new ReserveController()