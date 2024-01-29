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

      await Reserve.save(apartment_id, apartment, decodedToken.id)

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

      const decodedToken = getDecodedToken(req.headers['authorization'])

      const status = req.query.status
      let { offset: skip, limit } = req.query

      let hasNext = false
      let reserves = []

      let RestException = null
      let errorParams = []

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
            if (statusResult.hasError.type != 4 && statusResult.hasError.type != 1) {
              errorParams.push(statusResult)
            }
          }

          if ((skip || skip == 0) && limit) {
            let skipResult = Analyzer.analyzeFilterSkip(skip)
            if (skipResult.hasError.value) {
              errorParams.push(skipResult)
            } else {
              skip = parseInt(skip)
            }

            let limitResult = Analyzer.analyzeFilterLimit(limit)
            if (limitResult.hasError.value) {
              errorParams.push(limitResult)
            } else {
              limit = parseInt(limit)
            }
          } else {
            skip = 0
            limit = 20
          }

          if (errorParams.length) {
            RestException = Generator.genRestException(errorParams)
            res.status(parseInt(RestException.Status))
            res.json({ RestException })
            return
          } else {

            let results = null

            if (decodedToken.role > 0) {

              // + 1 é para verificar se há mais item(s) a serem exibidos (para usar no hasNext).
              results = await Reserve.findMany(status, skip, limit + 1)

            } else {

              // + 1 é para verificar se há mais item(s) a serem exibidos (para usar no hasNext).
              results = await Reserve.findManyByUserID(decodedToken.id, status, skip, limit + 1)

            }

            let reserves = []

            for (let res of results) {
              let reserve = _.cloneDeep(res)

              let reservedBy = res.reserved.reservedBy
              delete reserve.reserved

              if (decodedToken.role > 0) {

                if (res.reserved.reservedBy) {
                  let userWhoReserved = await User.findOne(reservedBy)

                  reserve.reserved = {
                    reservedAt: res.reserved.reservedAt,
                    reservedBy: {
                      id: userWhoReserved.id,
                      name: userWhoReserved.name,
                    }
                  }
                } else {
                  reserve.reserved = {
                    reservedAt: "",
                    reservedBy: {
                      id: "",
                      name: "",
                    }
                  }
                }

              }

              let HATEOAS = Generator.genHATEOAS(reserve.apartment_id, 'reserve', 'reserves', decodedToken.role > 0)
              reserve._links = HATEOAS

              reserves.push(reserve)
            }

            if (reserves.length) {
              hasNext = reserves.length > limit

              // Retira o dado extra para cálculo do hasNext.
              if (hasNext) {
                reserves.pop()
              }
            }

            res.status(200)
            res.json({ reserves, hasNext })
            return
          }

        }

      }

      res.sendStatus(404)

    } catch (error) {
      console.log(error)
      next(error)
    }

  }

  async update(req, res, next) {

    try {

      const decodedToken = getDecodedToken(req.headers['authorization'])

      const {
        apartment_id,
        status,
        client_id,
        date,
        start,
        end
      } = req.body

      let errorFields = []
      let fieldsToBeUpdated = {}

      let apartmentIDResult = await Analyzer.analyzeApartmentID(apartment_id)
      if (apartmentIDResult.hasError.value) {
        errorFields.push(apartmentIDResult)
      } else {
        fieldsToBeUpdated.apartment_id = apartment_id
      }

      if (status) {
        let statusResult = await Analyzer.analyzeApartmentStatus(status, apartment_id)
        if (statusResult.hasError.value) {
          if (statusResult.hasError.type != 4) {
            errorFields.push(statusResult)
          } else {
            fieldsToBeUpdated.status = status
          }
        } else {
          fieldsToBeUpdated.status = status
        }
      }

      if (client_id) {
        let clientResult = await Analyzer.analyzeUserID(client_id)
        if (clientResult.hasError.value) {
          errorFields.push(clientResult)
        } else {
          fieldsToBeUpdated.client_id = client_id
        }
      }

      if (start) {
        let startDateResult = Analyzer.analyzeReserveStartDate(start)
        if (startDateResult.hasError.value) {
          errorFields.push(startDateResult)
        } else {
          fieldsToBeUpdated.start = start
          if (end) {
            let endDateResult = Analyzer.analyzeReserveEndDate(end, start)
            if (endDateResult.hasError.value) {
              errorFields.push(endDateResult)
            } else {
              fieldsToBeUpdated.end = end
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

      if (status == 'indisponível') {
        fieldsToBeUpdated = {
          apartment_id,
          status: 'indisponível',
          client_id: '',
          start: '',
          end: '',
        }
      }

      await Reserve.edit(fieldsToBeUpdated, decodedToken.id)

      let HATEOAS = Generator.genHATEOAS(fieldsToBeUpdated.apartment_id, 'reserve', 'reserves', true)
      
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