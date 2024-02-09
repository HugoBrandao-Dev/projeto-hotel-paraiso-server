const Analyzer = require('../tools/Analyzer')
const Generator = require('../tools/Generator')
const Token = require('../tools/TokenTools')

const ApartmentPictures = require('../tools/ApartmentPictures')

// Models
const Apartment = require('../models/Apartment')

class ApartmentController {

  async create(req, res, next) {

    /*
      
      Uma vez que é utilizada a ferramenta/middleware Multer para manipulação das imagens dos aptos,
      o código que salva as imagens está no arquivo "multerConfig.js", na pasta "middleware".

    */

    try {

      let floor = null
      let number = null
      let rooms = null
      let daily_price = null
      let accepts_animals = false

      if (req.body.apartment) {
        let parsedApartment = JSON.parse(req.body.apartment)
        floor = parsedApartment.floor
        number = parsedApartment.number
        rooms = parsedApartment.rooms
        daily_price = parsedApartment.daily_price
        accepts_animals = parsedApartment.accepts_animals
      } else {
        floor = req.body.floor
        number = req.body.number
        rooms = req.body.rooms
        daily_price = req.body.daily_price
        accepts_animals = req.body.accepts_animals
      }

      let errorFields = []

      const floorResult = Analyzer.analyzeApartmentFloor((floor).toString())
      if (floorResult.hasError.value) {
        errorFields.push(floorResult)
      }

      const numberResult = await Analyzer.analyzeApartmentNumber((number).toString())
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

      const acceptsAnimalsResult = Analyzer.analyzeApartmentAcceptsAnimals(accepts_animals)
      if (acceptsAnimalsResult.hasError.value) {
        errorFields.push(acceptsAnimalsResult)
      }

      if (errorFields.length) {
        const RestException = Generator.genRestException(errorFields)
        res.status(parseInt(RestException.Status))
        res.json({ RestException })
        return
      }

      let apartment = { created: {} }
      apartment.floor = floor
      apartment.number = number
      apartment.rooms = rooms
      apartment.daily_price = daily_price
      apartment.accepts_animals = accepts_animals
      apartment.reserve = {
        status: "livre"
      }

      const token = req.headers['authorization']
      const decodedToken = Token.getDecodedToken(token)
      apartment.created.createdBy = decodedToken.id
      
      let apartmentRegistred = await Apartment.save(apartment)

      // Em caso de sucesso de cadastro do apto.
      if (apartmentRegistred) {

        // Verifica se foram passadas imagens do apto.
        if (req.files) {

          // Copia as fotos da pasta tmp para a pasta do apto de forma definitiva.
          let pictures = req.files.map(file => file.filename)
          ApartmentPictures.movePicturesFromTempToApartmentFolder(pictures, apartmentRegistred.number)
        }

        let HATEOAS = Generator.genHATEOAS(apartmentRegistred._id, 'apartment', 'apartments', true)

        res.status(201)
        res.json({ _links: HATEOAS })
        return

      }

      res.sendStatus(500)

    } catch(error) {
      next(error)
    } finally {
      if (req.files)
        ApartmentPictures.deletePicturesFromTemp(req.files.map(file => file.filename))
    }

  }

  async read(req, res, next) {

    try {

      let id = req.params.id

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
      
      let apartment = await Apartment.findOne(id)
      apartment.pictures = ApartmentPictures.readPicturesFromApartment(apartment.number)
      if (req.headers['authorization']) {
        const token = req.headers['authorization']
        const decodedToken = Token.getDecodedToken(token)
        if (decodedToken.role > 0) {

          const createdBy = apartment.CREATED_BY.length ? apartment.CREATED_BY[0] : {}
          const updatedBy = apartment.UPDATED_BY.length ? apartment.UPDATED_BY[0] : {}

          /* Modificação da estrutura do CREATED. */

          // Transforma o formato da data de criação do apto em um formato mais inteligível.
          apartment.created.createdAt = new Date(apartment.created.createdAt).toLocaleString()

          apartment.created.createdBy = {
            id: createdBy._id,
            name: createdBy.name
          }

          /* Modificação da estrutura do UPDATED. */

          // Transforma o formato da data de atualização de um apto em um formato mais inteligível.
          apartment.updated.updatedAt = new Date(apartment.updated.updatedAt).toLocaleString()

          apartment.updated.updatedBy = {
            id: updatedBy._id,
            name: updatedBy.name
          }

        // Para cliente logado.
        } else {
          delete apartment.reserve
        }

      // Para usuário que acessam o site.
      } else {
        delete apartment.reserve
      }

      delete apartment.CREATED_BY
      delete apartment.UPDATED_BY

      let HATEOAS = Generator.genHATEOAS(id, 'apartment', 'apartments', true)
      apartment._links = HATEOAS

      res.status(200)
      res.json(apartment)

    } catch(error) {
      console.log(error)
      next(error)
    }

  }

  async list(req, res, next) {

    try {

      let {
        status,
        rooms,
        lowest_daily_price,
        highest_daily_price,
        accepts_animals,
        offset,
        limit,
        sort
      } = req.query

      let query = {}
      let decodedToken = { role: 0 }
      if (req.headers['authorization']) {
        let token = req.headers['authorization']
        decodedToken = Token.getDecodedToken(token)
        if (decodedToken.role == 0)
          query.status = 'livre'
      }

      let errorFields = []

      let listOfQueryString = Object.keys(req.query)

      if (listOfQueryString.length) {
        let queryStringResult = Analyzer.analyzeQueryList(listOfQueryString, 'apartments', decodedToken.role > 0)
        if (queryStringResult.hasError.value) {
          errorFields.push(queryStringResult)
        } else {

          // Array de todas as Query String que foram passadas, com ou sem valor.
          let queryStringArray = Object.keys(req.query)

          if (queryStringArray.includes('status')) {
            let statusResult = await Analyzer.analyzeApartmentFilterStatus(status)
            if (statusResult.hasError.value)
              errorFields.push(statusResult)
            else
              query.status = status
          }

          if (queryStringArray.includes('rooms')) {
            let roomsResult = await Analyzer.analyzeApartmentFilterRooms(rooms)
            if (roomsResult.hasError.value)
              errorFields.push(roomsResult)
            else
              query.rooms = parseInt(rooms)
          }

          if (queryStringArray.includes('lowest_daily_price')) {
            let lowestDailyPriceResult = await Analyzer.analyzeApartmentFilterLowestDailyPrice(lowest_daily_price)
            if (lowestDailyPriceResult.hasError.value)
              errorFields.push(lowestDailyPriceResult)
            else
              query.lowest_daily_price = parseFloat(lowest_daily_price)
          }

          if (queryStringArray.includes('highest_daily_price')) {
            let highestDailyPriceResult = await Analyzer.analyzeApartmentFilterHighestDailyPrice(highest_daily_price, lowest_daily_price)
            if (highestDailyPriceResult.hasError.value)
              errorFields.push(highestDailyPriceResult)
            else
              query.highest_daily_price = parseFloat(highest_daily_price)
          }

          if (queryStringArray.includes('accepts_animals')) {
            let acceptsAnimalsResult = await Analyzer.analyzeApartmentFilterAcceptsAnimals(accepts_animals)
            if (acceptsAnimalsResult.hasError.value)
              errorFields.push(acceptsAnimalsResult)
            else
              query.accepts_animals = accepts_animals == 1
          }

          if (queryStringArray.includes('offset')) {
            let offsetResult = await Analyzer.analyzeFilterSkip(offset, decodedToken.role > 0)
            if (offsetResult.hasError.value) {
              errorFields.push(offsetResult)
            } else {
              // Skip é equivalente ao offset, no mongodb.
              query.skip = Number.parseInt(offset)

              let limitResult = Analyzer.analyzeFilterLimit(limit)
              if (limitResult.hasError.value)
                errorFields.push(limitResult)
              else
                query.limit = Number.parseInt(limit) + 1
            }
          } else {
            query.skip = 0
            query.limit = 20 + 1
          }

          if (queryStringArray.includes('sort')) {
            let sortResult = await Analyzer.analyzeApartmentFilterSort(sort)
            if (sortResult.hasError.value) {
              errorFields.push(sortResult)
            } else {
              query.sort = {}

              // Separa todos os parâmetros de ordenamento.
              let toSort = sort.split(',')

              /*
              Estrutura os parâmetros em um único objeto, para que seja passado diretamente para o Mongo.
              { $sort: { <field_1>: <value_1>, <field_2>: <value_2>, ... } }
              */ 
              for (let item of toSort) {
                let field = item.split(':')[0]
                let sortOrder = item.split(':')[1]

                // No mongo, 1 é ASC e -1 é DESC.
                query.sort[field] = sortOrder == 'asc' ? 1 : -1
              }

            }
          } else {

            // Valor PADRÃO de ordenamento (Obrigatório para o Mongo DB).
            query.sort = { 'daily_price': 1 }

          }

        }
      } else {
        query.skip = 0
        query.limit = 20 + 1
      }

      if (errorFields.length) {
        const RestException = Generator.genRestException(errorFields)
        res.status(parseInt(RestException.Status))
        res.json({ RestException })
        return
      }

      let apartments = await Apartment.findMany(query)

      for (let apartment of apartments) {
        apartment.pictures = ApartmentPictures.readPicturesFromApartment(apartment.number)
        const createdBy = apartment.CREATED_BY.length ? apartment.CREATED_BY[0] : {}
        const updatedBy = apartment.UPDATED_BY.length ? apartment.UPDATED_BY[0] : {}

        if (decodedToken.role > 0) {

          /* Modificação da estrutura do CREATED. */

          // Transforma o formato da data de criação do apto em um formato mais inteligível.
          apartment.created.createdAt = new Date(apartment.created.createdAt).toLocaleString()

          apartment.created.createdBy = {
            id: createdBy._id,
            name: createdBy.name
          }

          /* Modificação da estrutura do UPDATED. */

          // Transforma o formato da data de atualização de um apto em um formato mais inteligível.
          apartment.updated.updatedAt = new Date(apartment.updated.updatedAt).toLocaleString()

          apartment.updated.updatedBy = {
            id: updatedBy._id,
            name: updatedBy.name
          }

        } else {
          delete apartment.reserve
          delete apartment.created
          delete apartment.updated
        }

        delete apartment.CREATED_BY
        delete apartment.UPDATED_BY
        
        let HATEOAS = Generator.genHATEOAS(apartment._id, 'apartment', 'apartments', false)
        apartment._links = HATEOAS
      }

      let hasNext = apartments.length > query.limit - 1

      // Retira o dado extra para cálculo do hasNext.
      if (hasNext)
        apartments.pop()

      res.status(200)
      res.json({ apartments, hasNext })

    } catch(error) {
      next(error)
    }

  }

  async update(req, res, next) {

    /*
      
      Uma vez que é utilizada a ferramenta/middleware Multer para manipulação das imagens dos aptos,
      o código que salva as imagens está no arquivo "multerConfig.js", na pasta "middleware".

    */

    try {

      let id = null
      let floor = null
      let number = null
      let rooms = null
      let picturesToBeDeleted = []
      let daily_price = null
      let accepts_animals = null
      let declaredFields = null

      if (req.body.apartment) {
        let parsedApartment = JSON.parse(req.body.apartment)
        declaredFields = Object.keys(parsedApartment)
        id = parsedApartment.id
        floor = parsedApartment.floor
        number = parsedApartment.number
        rooms = parsedApartment.rooms
        if (declaredFields.includes('picturesToBeDeleted') && parsedApartment.picturesToBeDeleted.length) {
          picturesToBeDeleted = parsedApartment.picturesToBeDeleted
        }
        daily_price = parsedApartment.daily_price
        accepts_animals = parsedApartment.accepts_animals
      } else {
        declaredFields = Object.keys(req.body)
        id = req.body.id
        floor = req.body.floor
        number = req.body.number
        rooms = req.body.rooms
        if (declaredFields.includes('picturesToBeDeleted') && req.body.picturesToBeDeleted.length) {
          picturesToBeDeleted = req.body.picturesToBeDeleted
        }
        daily_price = req.body.daily_price
        accepts_animals = req.body.accepts_animals
      }

      let errorFields = []
      let apartment = {}

      const idResult = await Analyzer.analyzeApartmentID(id)
      if (idResult.hasError.value) {
        if (idResult.hasError.value != 4)
          errorFields.push(idResult)
      }

      let apartmentFound = await Apartment.findByNumber(number)

      if (floor) {
        const floorResult = Analyzer.analyzeApartmentFloor((floor).toString())
        if (floorResult.hasError.value)
          errorFields.push(floorResult)
        else
          apartment.floor = floor
      }
      
      if (number) {
        const numberResult = await Analyzer.analyzeApartmentNumber((number).toString())
        if (numberResult.hasError.value) {

          // Verifica se está tentando atualizar com um número de apartamento que já está cadastrado.
          if (numberResult.hasError.type == 4) {

            // Verifica se o número do apartamento já pertence a ele próprio.
            let isTheSameApartment = apartmentFound._id == id

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
        if (roomsResult.hasError.value)
          errorFields.push(roomsResult)
        else
          apartment.rooms = rooms
      }
      
      if (daily_price) {
        const dailyPriceResult = Analyzer.analyzeApartmentDailyPrice((daily_price).toString())
        if (dailyPriceResult.hasError.value)
          errorFields.push(dailyPriceResult)
        else
          apartment.daily_price = daily_price
      }

      if (accepts_animals || accepts_animals == 0) {
        const acceptsAnimalsResult = Analyzer.analyzeApartmentAcceptsAnimals((accepts_animals).toString())
        if (acceptsAnimalsResult.hasError.value)
          errorFields.push(acceptsAnimalsResult)
        else
          apartment.accepts_animals = accepts_animals
      }
      
      if (errorFields.length) {
        const RestException = Generator.genRestException(errorFields)
        res.status(parseInt(RestException.Status))
        res.json({ RestException })
        return
      }

      const token = req.headers['authorization']
      const decodedToken = Token.getDecodedToken(token)

      apartment.updated = {
        updatedBy: decodedToken.id
      }

      let registred = await Apartment.findOne(id)

      let apartmentBeforeModified = await Apartment.edit(id, apartment)

      // Em caso de sucesso da atualização dos dados do apto.
      if (apartmentBeforeModified) {

        // Verifica se foi informado um número de apto.
        if (apartment.number) {

          // Verifica se o número informado é DIFERENTE do cadastrado.
          if (apartmentBeforeModified.number != apartment.number)
            ApartmentPictures.changeApartmentNumber(apartmentBeforeModified.number, apartment.number)
        }

        // Verifica se foram passadas imagens do apto.
        if (req.files) {

          let pictures = req.files.map(file => file.filename)

          // Copia as fotos da pasta tmp para a pasta do apto de forma definitiva.
          ApartmentPictures.movePicturesFromTempToApartmentFolder(pictures, apartment.number)

          // Verifica se há fotos a serem deletadas
          if (picturesToBeDeleted.length)
            ApartmentPictures.deletePicturesFromApartment(apartment.number, picturesToBeDeleted)
        }

        let HATEOAS = Generator.genHATEOAS(apartmentBeforeModified._id, 'apartment', 'apartments', true)

        res.status(200)
        res.json({ _links: HATEOAS })
        return
      }

      res.sendStatus(500)

    } catch(error) {
      next(error)
    } finally {
      if (req.files)
        ApartmentPictures.deletePicturesFromTemp(req.files.map(file => file.filename))
    }

  }

  async remove(req, res, next) {

    try {

      let id = req.params.id

      let RestException = {}

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

      let apartmentDeleted = await Apartment.delete(id)

      if (apartmentDeleted) {
        ApartmentPictures.deleteApartmentFolder(apartmentDeleted.number)
        res.status(200)
        res.json({})
        return
      }

      res.sendStatus(500)

    } catch(error) {
      next(error)
    }

  }

}

module.exports = new ApartmentController()