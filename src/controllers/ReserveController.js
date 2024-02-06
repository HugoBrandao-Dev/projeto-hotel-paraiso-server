const Generator = require('../tools/Generator')
const Token = require('../tools/TokenTools')
const jwt = require('jsonwebtoken')
const _ = require('lodash')

const DateFormated = require('../tools/DateFormated')
const date = new DateFormated('mongodb')

const Analyzer = require('../tools/Analyzer')

// Models
const Reserve = require('../models/Reserve')
const User = require('../models/User')

class ReserveController {

  async create(req, res, next) {

    try {

      const decodedToken = Token.getDecodedToken(req.headers['authorization'])

      const { apartment_id, start, end } = req.body
      let { status, client_id } = req.body

      let errorFields = []

      const idResult = await Analyzer.analyzeApartmentID(apartment_id)
      if (idResult.hasError.value) {
        if (idResult.hasError.type != 4) {
          errorFields.push(idResult)
        }
      }

      if (decodedToken.role == 0) {
        status = 'reservado'
        client_id = decodedToken.id
      }

      const statusResult = await Analyzer.analyzeApartmentStatus(status, apartment_id)
      if (statusResult.hasError.value) {
        errorFields.push(statusResult)
      }

      const clientResult = await Analyzer.analyzeUserID(client_id)
      if (clientResult.hasError.value) {
        if (clientResult.hasError.type != 4) {
          errorFields.push(clientResult)
        }
      }

      let startDateResult = Analyzer.analyzeReserveStartDate(start)
      if (startDateResult.hasError.value) {
        errorFields.push(startDateResult)
      }

      let endDateResult = Analyzer.analyzeReserveEndDate(end, start)
        if (endDateResult.hasError.value) {
          errorFields.push(endDateResult)
        }

      if (errorFields.length) {
        const RestException = Generator.genRestException(errorFields)
        res.status(parseInt(RestException.Status))
        res.json({ RestException })
        return
      }

      const apartment = {
        reserve: {
          status,
          client_id,
          start,
          end,
          reserved: {
            reservedAt: date.getDateTime(),
            reservedBy: decodedToken.id
          }
        }
      }

      await Reserve.save(apartment_id, apartment)

      let HATEOAS = Generator.genHATEOAS(apartment_id, 'reserve', 'reserves', true)

      res.status(201)
      res.json({ _links: HATEOAS })

    } catch (error) {
      next(error)
    }

  }

  async read(req, res, next) {

    try {

      const { id } = req.params

      const decodedToken = Token.getDecodedToken(req.headers['authorization'])

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

      let reserve = await Reserve.findOne(id)

      delete reserve.reserve.client_id
      delete reserve.reserve.reserved.reservedBy

      let HATEOAS = Generator.genHATEOAS(id, 'reserve', 'reserves', true)
      reserve._links = HATEOAS

      res.status(200)
      res.json(reserve)

    } catch (error) {
      console.log(error)
      next(error)
    }

  }

  async list(req, res, next) {

    try {

      const decodedToken = Token.getDecodedToken(req.headers['authorization'])

      const status = req.query.status
      let { offset: skip, limit } = req.query
      let query = {}

      let hasNext = false

      let RestException = null
      let errorParams = []

      let reserves = []

      // Se o usuário logado for um cliente, só retornará as reservas dele próprio.
      if (decodedToken.role == 0) {
        query.client_id = decodedToken.id
        reserves = await Reserve.findMany(query)

        for (let reserve of reserves) {

          /*
            FORMATAR AS DATAS DE INÍCIO E TÉRMINO DA RESERVA.
          */

          delete reserve.reserve.reserved
          delete reserve.reserve.client_id

          let HATEOAS = Generator.genHATEOAS(reserve._id, 'reserve', 'reserves', decodedToken.role > 0)
          reserve._links = HATEOAS

        }
      } else {
        if (req.query) {
          let queryList = Object.keys(req.query)

          let queryStringResult = Analyzer.analyzeQueryList(queryList, 'reserves')
          if (queryStringResult.hasError.value) {
            errorParams.push(queryStringResult)

            RestException = Generator.genRestException(errorParams)
            res.status(parseInt(RestException.Status))
            res.json({ RestException })
            return
          } else {

            // Verifica se o valor passado no Status é valido.
            let statusResult = await Analyzer.analyzeApartmentStatus(status)
            if (statusResult.hasError.value) {
              if (statusResult.hasError.type != 4 && statusResult.hasError.type != 1)
                errorParams.push(statusResult)
              else
                query.status = status
            } else {
              query.status = status
            }

            if ((skip || skip == 0) && limit) {
              let skipResult = Analyzer.analyzeFilterSkip(skip)
              if (skipResult.hasError.value)
                errorParams.push(skipResult)
              else
                query.skip = parseInt(skip)

              let limitResult = Analyzer.analyzeFilterLimit(limit)
              if (limitResult.hasError.value)
                errorParams.push(limitResult)
              else
                query.limit = parseInt(limit) + 1
            } else {
              query.skip = 0
              query.limit = 20 + 1
            }

            if (errorParams.length) {
              RestException = Generator.genRestException(errorParams)
              res.status(parseInt(RestException.Status))
              res.json({ RestException })
              return
            } else {

              reserves = await Reserve.findMany(query)

              for (let reserve of reserves) {

                delete reserve.reserve.reserved.reservedBy
                delete reserve.reserve.client_id

                reserve.reserve.reserved.reservedAt = new Date(reserve.reserve.reserved.reservedAt).toLocaleString()

                let HATEOAS = Generator.genHATEOAS(reserve._id, 'reserve', 'reserves', decodedToken.role > 0)
                reserve._links = HATEOAS

              }

              if (reserves.length) {
                hasNext = reserves.length > limit

                // Retira o dado extra para cálculo do hasNext.
                if (hasNext) {
                  reserves.pop()
                }
              }

            }

          }
        }

        res.status(200)
        res.json({ reserves, hasNext })
        return
      }

      res.sendStatus(404)

    } catch (error) {
      console.log(error)
      next(error)
    }

  }

  async update(req, res, next) {

    try {

      const decodedToken = Token.getDecodedToken(req.headers['authorization'])

      const {
        apartment_id,
        status,
        client_id,
        start,
        end
      } = req.body

      let errorFields = []
      let reserve = {}

      let apartmentIDResult = await Analyzer.analyzeApartmentID(apartment_id)
      if (apartmentIDResult.hasError.value) {
        errorFields.push(apartmentIDResult)
      }

      if (status) {
        let statusResult = await Analyzer.analyzeApartmentStatus(status, apartment_id, true)
        if (statusResult.hasError.value) {
          if (statusResult.hasError.type != 4) {
            errorFields.push(statusResult)
          } else {
            reserve.status = status
          }
        } else {
          reserve.status = status
        }
      }

      if (client_id) {
        let clientResult = await Analyzer.analyzeUserID(client_id)
        if (clientResult.hasError.value) {
          errorFields.push(clientResult)
        } else {
          reserve.client_id = client_id
        }
      }

      if (start) {
        let startDateResult = Analyzer.analyzeReserveStartDate(start)
        if (startDateResult.hasError.value) {
          errorFields.push(startDateResult)
        } else {
          reserve.start = start
          if (end) {
            let endDateResult = Analyzer.analyzeReserveEndDate(end, start)
            if (endDateResult.hasError.value) {
              errorFields.push(endDateResult)
            } else {
              reserve.end = end
            }
          }
        }
      }

      if (errorFields.length) {
        const RestException = Generator.genRestException(errorFields)
        res.status(parseInt(RestException.Status))
        res.json({ RestException })
        return
      }

      reserve.reserved = {
        reservedAt: date.getDateTime(),
        reservedBy: decodedToken.id
      }

      let apartment = { reserve }

      await Reserve.edit(apartment_id, apartment)

      let HATEOAS = Generator.genHATEOAS(apartment_id, 'reserve', 'reserves', true)

      res.status(200)
      res.json({ _links: HATEOAS })

    } catch (error) {
      next(error)
    }

  }

  async remove(req, res, next) {

    try {

      let id = req.params.id

      let errorFields = []

      let idResult = await Analyzer.analyzeApartmentID(id)
      if (idResult.hasError.value) {
        if (idResult.hasError.type != 4)
          errorFields.push(idResult)
      }

      if (errorFields.length) {
        const RestException = Generator.genRestException(errorFields)
        res.status(parseInt(RestException.Status))
        res.json({ RestException })
        return
      }

      await Reserve.delete(id)
      res.sendStatus(200)

    } catch (error) {
      next(error)
    }

  }

}

module.exports = new ReserveController()