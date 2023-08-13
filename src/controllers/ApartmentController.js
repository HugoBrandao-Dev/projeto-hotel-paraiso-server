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
        status,
        user_id,
        start,
        end
      } = req.body

      const floorResult = Analyzer.analyzeApartmentFloor(floor)
      if (floorResult.hasError.value) {
        errorFields.push(floorResult)
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
    } catch(error) {
      next(error)
    }
  }

  async read(req, res, next) {
    try {

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