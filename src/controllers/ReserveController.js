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

      const { apartment_id } = req.body
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

      if (errorFields.length) {
        let codes = errorFields.map(item => item.hasError.type)

        // Cria um array contendo os Status codes dos erros encontrados.
        let statusCode = codes.map(code => {
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
        res.status(parseInt(statusCode))
        res.json({ 
          RestException: {
            "Code": codes.length > 1 ? codes.join(';') : codes.toString(),
            "Message": messages.length > 1 ? messages.join(';') : messages.toString(),
            "Status": statusCode.length > 1 ? statusCode.join(';') : statusCode.toString(),
            "MoreInfo": moreinfos.length > 1 ? moreinfos.join(';') : moreinfos.toString(),
            "ErrorFields": errorFields
          }
        })
        return
      }

      res.sendStatus(201)
    } catch (error) {
      next(error)
    }
  }

  async read(req, res, next) {
    try {
      const { id } = req.params

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
      let HATEOAS = [
        {
          href: `${ baseURL }/reserves/${ id }`,
          method: 'GET',
          rel: 'self_reserve'
        },
        {
          href: `${ baseURL }/reserves/${ id }`,
          method: 'PUT',
          rel: 'edit_reserve'
        },
        {
          href: `${ baseURL }/reserves/${ id }`,
          method: 'DELETE',
          rel: 'delete_reserve'
        },
        {
          href: `${ baseURL }/reserves`,
          method: 'GET',
          rel: 'reserve_list'
        }
      ]
      reserve._links = HATEOAS
      res.status(200)
      res.json(reserve)
    } catch (error) {
      next(error)
    }
  }

  async list(req, res, next) {
    try {
      let reserves = null

      if (req.query.status) {
        let status = req.query.status
        reserves = await Reserve.findMany(status)
      } else {
        reserves = await Reserve.findMany()
      }

      for (let reserve of reserves) {
        let HATEOAS = [
          {
            href: `${ baseURL }/reserves/${ reserve.apartment_id }`,
            method: 'GET',
            rel: 'self_reserve'
          },
          {
            href: `${ baseURL }/reserves/${ reserve.apartment_id }`,
            method: 'PUT',
            rel: 'edit_reserve'
          },
          {
            href: `${ baseURL }/reserves/${ reserve.apartment_id }`,
            method: 'DELETE',
            rel: 'delete_reserve'
          },
          {
            href: `${ baseURL }/reserves`,
            method: 'GET',
            rel: 'reserve_list'
          }
        ]

        reserve._links = HATEOAS
      }

      res.status(200)
      res.json({ reserves })
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

      let statusResult = await Analyzer.analyzeApartmentStatus(status, apartment_id)
      if (statusResult.hasError.value) {
        errorFields.push(statusResult)
      }

      let clientResult = await Analyzer.analyzeID(user_id)
      if (clientResult.hasError.value) {
        errorFields.push(clientResult)
      }

      let startDateResult = Analyzer.analyzeReserveStartDate(start)
      if (startDateResult.hasError.value) {
        errorFields.push(startDateResult)
      } else {
        let endDateResult = Analyzer.analyzeReserveEndDate(end, start)
        if (endDateResult.hasError.value) {
          errorFields.push(endDateResult)
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

      let reserve = {}
      reserve.apartment_id = apartment_id
      reserve.status = status
      reserve.user_id = user_id
      reserve.date = date
      reserve.start = start
      reserve.end = end

      let HATEOAS = [
        {
          href: `${ baseURL }/reserves/${ apartment_id }`,
          method: 'GET',
          rel: 'self_reserve'
        },
        {
          href: `${ baseURL }/reserves/${ apartment_id }`,
          method: 'PUT',
          rel: 'edit_reserve'
        },
        {
          href: `${ baseURL }/reserves/${ apartment_id }`,
          method: 'DELETE',
          rel: 'delete_reserve'
        },
        {
          href: `${ baseURL }/reserves`,
          method: 'GET',
          rel: 'reserve_list'
        }
      ]


      await Reserve.edit(reserve)
      
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