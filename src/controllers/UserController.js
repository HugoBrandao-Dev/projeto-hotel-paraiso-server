const Analyzer = require('../tools/Analyzer')
const uuid = require('uuid')

// Models
const User = require('../models/User')

class UserController {
  async create(req, res, next) {
    try {
      let errorFields = []
      let user = {}

      user.id = uuid.v4()

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
      let idResult = Analyzer.analyzeUserID(req.params.id)

      if (idResult.hasError.value) {
        res.status(400)
        res.json({
          RestException: {
            "Code": "2",
            "Message": idResult.hasError.error,
            "Status": "400",
            "MoreInfo": "/docs/erros/2"
          }
        })
      } else {
        let user = await User.findOne(req.params.id)
        if (user) {
          res.status(200)
          res.json(user)
        } else {
          res.status(404)
          res.json({
            RestException: {
              "Code": "2",
              "Message": "Nenhum usuário com o ID informado está cadastrado",
              "Status": "404",
              "MoreInfo": "/docs/erros/2"
            }
          })
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
      let result = await User.update(user)
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