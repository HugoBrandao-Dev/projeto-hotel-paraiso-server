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

    } catch (error) {
      next(error)
    }
  }
}

module.exports = new ReserveController()