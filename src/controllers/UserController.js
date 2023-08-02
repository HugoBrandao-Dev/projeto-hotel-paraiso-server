const Analyzer = require('../tools/Analyzer')
const uuid = require('uuid')

// Models
const User = require('../models/User')

class UserController {
  async create(req, res, next) {
    try {
      let errorFields = []

      /* ##### CAMPOS OBRIGATÓRIOS ##### */

      let nameResult = Analyzer.analyzeUserName(req.body.name)
      if (nameResult.hasError.value) {
        errorFields.push(nameResult)
      }

      let emailResult = await Analyzer.analyzeUserEmail(req.body.email)
      if (emailResult.hasError.value) {
        errorFields.push(emailResult)
      }

      let birthDateResult = Analyzer.analyzeUserBirthDate(req.body.birthDate)
      if (birthDateResult.hasError.value) {
        errorFields.push(birthDateResult)
      }

      // O campo de Role não é obrigatório ser passado, mas é necessário para o banco de dados.
      let role = req.body.role == undefined ? '0' : req.body.role
      let roleResult = Analyzer.analyzeUserRole(role)
      if (roleResult.hasError.value) {
        errorFields.push(roleResult)
      }

      let passwordResult = Analyzer.analyzeUserPassword(req.body.password)
      if (passwordResult.hasError.value) {
        errorFields.push(passwordResult)
      }

      let phoneCodeResult = Analyzer.analyzeUserPhoneCode(req.body.phoneCode)
      if (phoneCodeResult.hasError.value) {
        errorFields.push(phoneCodeResult)
      } else {
        let phoneCode = req.body.phoneCode

        let phoneNumberResult = Analyzer.analyzeUserPhoneNumber(phoneCode, req.body.phoneNumber)
        if (phoneNumberResult.hasError.value) {
          errorFields.push(phoneNumberResult)
        }
      }

      let countryResult = Analyzer.analyzeUserCountry(req.body.country)
      if (countryResult.hasError.value) {
        errorFields.push(countryResult)
      } else {
        let countryCode = req.body.country

        // Validação das localidades (estado e cidade) do usuário.
        let stateResult = await Analyzer.analyzeUserState(countryCode, req.body.state)
        if (stateResult.hasError.value) {
          errorFields.push(stateResult)
        } else {
          let state = req.body.state

          let cityResult = await Analyzer.analyzeUserCity(countryCode, state, req.body.city)
          if (cityResult.hasError.value) {
            errorFields.push(cityResult)
          }
        }

        // Validação da documentação do usuário.
        if (countryCode == 'BR') {
          let cpfResult = await Analyzer.analyzeUserCPF(req.body.cpf)
          if (cpfResult.hasError.value) {
            errorFields.push(cpfResult)
          }

          // O CEP é um campo opcional e somente para Brasileiros.
          let cepResult = await Analyzer.analyzeUserCEP(req.body.cep)
          if (cepResult.hasError.value) {
            errorFields.push(cepResult)
          }
        } else {
          let passportNumberResult = await Analyzer.analyzeUserPassportNumber(countryCode, req.body.passportNumber)
          if (passportNumberResult.hasError.value) {
            errorFields.push(passportNumberResult)
          }
        }
      }

      /* ##### CAMPOS OPCIONAIS ##### */

      let neighborhoodResult = Analyzer.analyzeUserNeighborhood(req.body.neighborhood)
      if (neighborhoodResult.hasError.value) {
        errorFields.push(neighborhoodResult)
      }

      let roadResult = Analyzer.analyzeUserRoad(req.body.road)
      if (roadResult.hasError.value) {
        errorFields.push(roadResult)
      }

      let houseNumberResult = Analyzer.analyzeUserHouseNumber(req.body.house_number)
      if (houseNumberResult.hasError.value) {
        errorFields.push(houseNumberResult)
      }

      let informationsResult = Analyzer.analyzeUserAdditionalInformation(req.body.information)
      if (informationsResult.hasError.value) {
        errorFields.push(informationsResult)
      }

      if (errorFields.length) {
        let messages = errorFields.map(item => item.hasError.error)
        res.status(400)
        res.json({ 
          RestException: {
            "Code": "1",
            "Message": messages.length > 1 ? messages.join(';') : messages.toString(),
            "Status": "400",
            "MoreInfo": "/docs/erros/1",
            "ErrorFields": errorFields
          }
        })
        return
      } else {
        let user = {}

        // OBRIGATÓRIOS
        user.id = uuid.v4()
        user.name = req.body.name
        user.email = req.body.email
        user.password = req.body.password
        user.role = req.body.role
        user.phoneCode = req.body.phoneCode
        user.phoneNumber = req.body.phoneNumber
        user.birthDate = req.body.birthDate
        user.country = req.body.country
        user.state = req.body.state
        user.city = req.body.city
        if (req.body.cpf) {
          user.cpf = req.body.cpf
        } else {
          user.passportNumber = req.body.passportNumber
        }

        // OPCIONAIS/CONDICINAIS
        if (req.body.cep) {
          user.cep = req.body.cep
        }
        if (req.body.neighborhood) {
          user.neighborhood = req.body.neighborhood
        }
        if (req.body.road) {
          user.road = req.body.road
        }
        if (req.body.house_number) {
          user.house_number = req.body.house_number
        }
        if (req.body.information) {
          user.information = req.body.information
        }

        await User.save(user)
        res.status(201)
        res.json({ msg: 'Cadastrado com sucesso!'})
      }
    } catch (error) {
      throw new Error(error)
      res.statusCode(500)
    }
  }

  async read(req, res) {
    try {
      let idResult = await Analyzer.analyzeUserID(req.params.id)

      if (idResult.hasError.value) {

        let RestException = {
          Code: `${ idResult.hasError.type }`,
          Message: idResult.hasError.error,
          Status: null,
          MoreInfo: `/docs/erros/${ idResult.hasError.type }`
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
      } else {
        let user = await User.findOne(req.params.id)
        if (user) {
          res.status(200)
          res.json(user)
        }
      }
    } catch (error) {
      throw new Error(error)
      res.sendStatus(500)
    }
  }

  async readMany(req, res) {
    try {
      let users = []

      // No mongodb, skip = offset
      if ((req.query.offset || req.query.offset == 0) && req.query.limit) {
        let skip = req.query.offset
        let limit = req.query.limit
        users = await User.findMany(skip, limit)
      } else {
        users = await User.findMany()
      }
      res.status(200)
      res.json({ users })
    } catch (error) {
      throw new Error(error)
      res.sendStatus(500)
    }
  }

  async readByDoc(req, res) {
    try {
      let type = req.body
      let user = await User.findByDoc(type)
      if (user) {
        res.status(200)
        res.json({user})
      } else {
        res.sendStatus(404)
      }
    } catch (error) {
      throw new Error(error)
      res.sendStatus(500)
    }
  }

  async update(req, res) {
    try {
      let user = req.body.user
      let errorFields = []

      let idResult = await Analyzer.analyzeUserID(user.id)
      if (idResult.hasError.value) {
        errorFields.push(idResult.hasError.error)
      }

      /* ############ CAMPOS OBRIGATÓRIOS ############ */

      let nameResult = Analyzer.analyzeUserName(user.name)
      if (nameResult.hasError.value) {
        errorFields.push(nameResult.hasError.error)
      }

      let birthDateResult = Analyzer.analyzeUserBirthDate(user.birthDate)
      if (birthDateResult.hasError.value) {
        errorFields.push(birthDateResult.hasError.error)
      }

      if (user.country == 'BR') {
        let cpfResult = await Analyzer.analyzeUserCPF(user.cpf)
        if (cpfResult.hasError.value) {
          errorFields.push(cpfResult.hasError.error)
        }

        let cepResult = await Analyzer.analyzeUserCEP(user.cep)
        if (cepResult.hasError.value) {
          errorFields.push(cepResult.hasError.error)
        }
      } else {
        let passportNumberResult = await Analyzer.analyzeUserPassportNumber(user.country, user.passportNumber)
        if (passportNumberResult.hasError.value) {
          errorFields.push(passportNumberResult.hasError.error)
        }
      }

      let emailResult = await Analyzer.analyzeUserEmail(user.email)
      if (emailResult.hasError.value) {
        errorFields.push(emailResult.hasError.error)
      }

      let passwordResult = Analyzer.analyzeUserPassword(user.password)
      if (passwordResult.hasError.value) {
        errorFields.push(passwordResult.hasError.error)
      }

      // O campo de Role não é obrigatório ser passado, mas é necessário para o banco de dados.
      let role = user.role == undefined ? '0' : user.role
      let roleResult = Analyzer.analyzeUserRole(role)
      if (roleResult.hasError.value) {
        errorFields.push(roleResult)
      }

      let phoneCodeResult = Analyzer.analyzeUserPhoneCode(user.phoneCode)
      if (phoneCodeResult.hasError.value) {
        errorFields.push(phoneCodeResult.hasError.error)
      }

      let phoneNumberResult = Analyzer.analyzeUserPhoneNumber(user.phoneCode, user.phoneNumber)
      if (phoneNumberResult.hasError.value) {
        errorFields.push(phoneNumberResult.hasError.error)
      }

      let countryResult = Analyzer.analyzeUserCountry(user.country)
      if (countryResult.hasError.value) {
        errorFields.push(countryResult.hasError.error)
      }

      let stateResult = await Analyzer.analyzeUserState(user.country, user.state)
      if (stateResult.hasError.value) {
        errorFields.push(stateResult.hasError.error)
      }

      let cityResult = await Analyzer.analyzeUserCity(user.country, user.state, user.city)
      if (cityResult.hasError.value) {
        errorFields.push(cityResult.hasError.error)
      }

      if (errorFields.length) {
        console.log(errorFields)
        let messages = errorFields.map(item => item.hasError.error)
        res.status(400)
        res.json({ 
          RestException: {
            "Code": "1",
            "Message": messages.length > 1 ? messages.join(';') : messages.toString(),
            "Status": "400",
            "MoreInfo": "/docs/erros/1",
            "ErrorFields": errorFields
          }
        })
        return
      }
      let result = await User.edit(user)
      if (result.password) {
        delete result.password
      }
      res.status(200)
      res.json({ user: result })
    } catch (error) {
      throw new Error(error)
      res.sendStatus(500)
    }
  }

  async delete(req, res) {
    try {
      let id = req.params.id
      let user = await User.delete(id)
      if (user)  {
        res.status(200)
        res.json({})
      } else {
        res.sendStatus(404)
      }
    } catch (error) {
      throw new Error(error)
      res.sendStatus(500)
    }
  }
}

module.exports = new UserController()