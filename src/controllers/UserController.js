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
        /*
        // Validação do CPF, para usuários Brasileiros.
        if (req.body.country == 'BR') {
          if (req.body.cpf) {
            let cpf = req.body.cpf

            if (!Analyzer.analyzeUserCPF(cpf)) {
              errorFields.push({
                field: 'iptCPF',
                error: 'CPF inválido.'
              })
            } {
              user.cpf = cpf
            }
          } else {
            errorFields.push({
              field: 'iptCPF',
              error: 'Este campo é obrigatório para Brasileiros.'
            })
          }

        // Validação do Passport Numbr, para usuários extrangeiros
        } else {
          if (req.body.passportNumber) {
            let passportNumber = req.body.passportNumber
            let countryCode = req.body.country

            if (!Analyzer.analyzeUserPassportNumber(countryCode, passportNumber)) {
              errorFields.push({
                field: 'iptPassportNumber',
                error: 'Invalid passport number.'
              })
            } else {
              user.passportNumber = passportNumber
            }
          } else {
            errorFields.push({
              field: 'iptPassportNumber',
              error: "This field is mandatory for foreigners."
            })
          }
        }
        */
      }

      /* ##### CAMPOS OPCIONAIS ##### */

      if (req.body.cep) {
        let cep = req.body.cep

        let isValid = await Analyzer.analyzeUserCEP(cep)
        if (!isValid) {
          errorFields.push({
            field: 'iptCEP',
            error: 'O valor do CEP é inválido.'
          })
        } else {
          user.cep = cep
        }
      }

      if (req.body.neighborhood) {
        let neighborhood = req.body.neighborhood

        if (!Analyzer.analyzeUserNeighborhood(neighborhood)) {
          errorFields.push({
            field: 'iptNeighborhood',
            error: 'Este campo tem caracteres inválidos.'
          })
        } else {
          user.neighborhood = neighborhood
        }
      }

      if (req.body.road) {
        let road = req.body.road

        if (!Analyzer.analyzeUserRoad(road)) {
          errorFields.push({
            field: 'iptRoad',
            error: 'Este campo tem caracteres inválidos.'
          })
        } else {
          user.road = road
        }
      }

      if (req.body.house_number) {
        let house_number = req.body.house_number

        if (!Analyzer.analyzeUserHouseNumber(house_number)) {
          errorFields.push({
            field: 'iptHouseNumber',
            error: 'Este campo deve conter somente números.'
          })
        } else {
          user.house_number = house_number
        }
      }

      if (req.body.information) {
        let information = req.body.information

        if (!Analyzer.analyzeUserAdditionalInformation(information)) {
          errorFields.push({
            field: 'iptAddInformation',
            error: 'Este campo contém caracteres inválidos.'
          })
        } else {
          user.information = information
        }
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
      let id = req.params.id

      let user = await User.findOne(id)
      if (user) {
        res.status(200)
        res.json(user)
      } else {
        res.sendStatus(404)
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