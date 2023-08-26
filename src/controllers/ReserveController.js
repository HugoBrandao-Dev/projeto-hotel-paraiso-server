const Analyzer = require('../tools/Analyzer')

let baseURL = 'http://localhost:4000'
const projectLinks = {
  errors: 'https://projetohotelparaiso.dev/docs/erros'
}

// Models
const Reserve = require('../models/Reserve')

class ReserveController {
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
      let reserves = await Reserve.findMany()

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

      await Reserve.edit(reserve)
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new ReserveController()