const Generator = require('../tools/Generator')
const jwt = require('jsonwebtoken')

const Analyzer = require('../tools/Analyzer')

let baseURL = 'http://localhost:4000'
const projectLinks = {
  errors: 'https://projetohotelparaiso.dev/docs/erros'
}

// Models
const Reserve = require('../models/Reserve')

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

class ReserveController {
  async create(req, res, next) {
    try {
      const decodedToken = getDecodedToken(req.headers['authorization'])

      const { apartment_id, start, end } = req.body
      let { status, user_id } = req.body

      let errorFields = []

      const idResult = await Analyzer.analyzeID(apartment_id, 'apartment')
      if (idResult.hasError.value) {
        if (idResult.hasError.type != 4) {
          errorFields.push(idResult)
        }
      }

      if (decodedToken.role == 0) {
        status = 'reservado'
        user_id = decodedToken.id
      }

      const statusResult = await Analyzer.analyzeApartmentStatus(status, apartment_id)
      if (statusResult.hasError.value) {
        errorFields.push(statusResult)
      }

      const clientResult = await Analyzer.analyzeID(user_id)
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
        let codes = errorFields.map(item => item.hasError.type)

        // Cria um array contendo os Status codes dos erros encontrados.
        let statusCodes = codes.map(code => {
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
        res.status(parseInt(statusCodes))
        res.json({ 
          RestException: {
            "Code": codes.length > 1 ? codes.join(';') : codes.toString(),
            "Message": messages.length > 1 ? messages.join(';') : messages.toString(),
            "Status": statusCodes.length > 1 ? statusCodes.join(';') : statusCodes.toString(),
            "MoreInfo": moreinfos.length > 1 ? moreinfos.join(';') : moreinfos.toString(),
            "ErrorFields": errorFields
          }
        })
        return
      }

      const reserve = {
        apartment_id,
        status,
        user_id,
        start,
        end
      }

      await Reserve.save(reserve)

      let HATEOAS = Generator.genHATEOAS(apartment_id, 'reserves', 'reserve', decodedToken.role > 0)

      res.status(201)
      res.json({ _links: HATEOAS })
    } catch (error) {
      next(error)
    }
  }

  async read(req, res, next) {
    try {
      const { id } = req.params

      const decodedToken = getDecodedToken(req.headers['authorization'])
      let idResult = await Analyzer.analyzeID(id, 'apartment')

      if (idResult.hasError.value) {
        let RestException = {
          Code: `${ idResult.hasError.type }`,
          Message: idResult.hasError.error,
          Status: null,
          MoreInfo: `${ projectLinks.errors }/${ idResult.hasError.type }`
        }

        switch (idResult.hasError.type) {
          case 3:
            RestException.Status = '404'
            break
          default:
            RestException.Status = '400'
        }

        res.status(parseInt(RestException.Status))
        res.json({ RestException })
        return
      }

      let reserve = await Reserve.findOne(id)

      let HATEOAS = Generator.genHATEOAS(id, 'reserves', 'reserve', decodedToken.role > 0)
      reserve._links = HATEOAS

      res.status(200)
      res.json(reserve)
    } catch (error) {
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

      if (req.query) {

        let queryStringResult = Analyzer.analyzeQueryList(req.query, 'reserves')
        if (queryStringResult.hasError.value) {
          res.status(400)
          res.json({ 
            RestException: {
              "Code": `${ queryStringResult.hasError.type }`,
              "Message": queryStringResult.hasError.error,
              "Status": "400",
              "MoreInfo": `${ projectLinks.errors }/${ queryStringResult.hasError.type }`
            }
          })
          return
        } else {

          let errorParams = []

          // Verifica se o valor passado no Status é valido.
          let statusResult = await Analyzer.analyzeApartmentStatus(status)
          if (statusResult.hasError.value) {
            if (statusResult.hasError.type != 4 && statusResult.hasError.type != 1) {
              errorParams.push(statusResult)
            }
          }

          if ((skip || skip == 0) && limit) {
            let skipResult = Analyzer.analyzeReserveListSkip(skip)
            if (skipResult.hasError.value) {
              errorParams.push(skipResult)
            } else {
              skip = parseInt(skip)
            }

            let limitResult = Analyzer.analyzeReserveListLimit(limit)
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
            let codes = errorParams.map(item => item.hasError.type)

            let messages = errorParams.map(item => item.hasError.error)
            let moreinfos = errorParams.map(item => `${ projectLinks.errors }/${ item.hasError.type }`)
            res.status(400)
            res.json({ 
              RestException: {
                "Code": codes.length > 1 ? codes.join(';') : codes.toString(),
                "Message": messages.length > 1 ? messages.join(';') : messages.toString(),
                "Status": "400",
                "MoreInfo": moreinfos.length > 1 ? moreinfos.join(';') : moreinfos.toString(),
                "ErrorParams": errorParams
              }
            })
            return
          } else {

            if (decodedToken.role > 0) {

              // + 1 é para verificar se há mais item(s) a serem exibidos (para usar no hasNext).
              reserves = await Reserve.findMany(status, skip, limit + 1)

            } else {

              // + 1 é para verificar se há mais item(s) a serem exibidos (para usar no hasNext).
              reserves = await Reserve.findManyByUserID(decodedToken.id, status, skip, limit + 1)

            }

            if (reserves.length) {
              hasNext = reserves.length > limit

              // Retira o dado extra para cálculo do hasNext.
              if (hasNext) {
                reserves.pop()
              }
            }

            for (let reserve of reserves) {
              let HATEOAS = Generator.genHATEOAS(reserve.apartment_id, 'reserves', 'reserve', decodedToken.role > 0)
              reserve._links = HATEOAS
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
        user_id,
        date,
        start,
        end
      } = req.body

      let errorFields = []
      let fieldsToBeUpdated = {}

      let apartmentIDResult = await Analyzer.analyzeID(apartment_id, 'apartment')
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

      if (user_id) {
        let clientResult = await Analyzer.analyzeID(user_id)
        if (clientResult.hasError.value) {
          errorFields.push(clientResult)
        } else {
          fieldsToBeUpdated.user_id = user_id
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
        let codes = errorFields.map(item => item.hasError.type)

        // Cria um array contendo os Status codes dos erros encontrados.
        let statusCodes = codes.map(code => {
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
        res.status(parseInt(statusCodes))
        res.json({ 
          RestException: {
            "Code": codes.length > 1 ? codes.join(';') : codes.toString(),
            "Message": messages.length > 1 ? messages.join(';') : messages.toString(),
            "Status": statusCodes.length > 1 ? statusCodes.join(';') : statusCodes.toString(),
            "MoreInfo": moreinfos.length > 1 ? moreinfos.join(';') : moreinfos.toString(),
            "ErrorFields": errorFields
          }
        })
        return
      }

      if (status == 'indisponível') {
        fieldsToBeUpdated = {
          apartment_id,
          status: 'indisponível',
          user_id: '',
          start: '',
          end: '',
          reservedIn: ''
        }
      }

      await Reserve.edit(fieldsToBeUpdated)

      let HATEOAS = Generator.genHATEOAS(fieldsToBeUpdated.apartment_id, 'reserves', 'reserve', decodedToken.role > 0)
      
      res.status(200)
      res.json({ _links: HATEOAS })
    } catch (error) {
      next(error)
    }
  }

  async remove(req, res, next) {
    try {
      let RestException = {}

      let id = req.params.id

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

      await Reserve.delete(id)
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new ReserveController()