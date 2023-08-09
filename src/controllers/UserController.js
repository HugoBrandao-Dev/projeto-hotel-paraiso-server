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
          let passportNumberResult = await Analyzer.analyzeUserPassportNumber(req.body.passportNumber, countryCode)
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
      const { 
        id,
        name,
        email,
        password,
        role,
        cpf,
        passportNumber,
        phoneCode,
        phoneNumber,
        birthDate,
        country,
        state,
        city,
        cep,
        neighborhood,
        road,
        house_number,
        information
      } = req.body
      let errorFields = []
      let fields = {}
      let userRegistred = null

      let idResult = await Analyzer.analyzeUserID(id)
      if (idResult.hasError.value) {
        errorFields.push(idResult)
        if (idResult.hasError.type == 3) {
          res.status(404)
          res.json({
            RestException: {
              "Code": "3",
              "Message": idResult.hasError.error,
              "Status": "404",
              "MoreInfo": "/docs/erros/3"
            }
          })
          return
        }
      } else {
        fields.id = id

        // Busca pelo usuário que tem o mesmo ID informado.
        userRegistred = await User.findOne(id)
      }

      /* ############ CAMPOS OBRIGATÓRIOS ############ */

      let nameResult = Analyzer.analyzeUserName(name)
      if (nameResult.hasError.value) {
        errorFields.push(nameResult)
      } else {
        fields.name = name
      }

      if (birthDate) {
        let birthDateResult = Analyzer.analyzeUserBirthDate(birthDate)
        if (birthDateResult.hasError.value) {
          errorFields.push(birthDateResult)
        } else {
          fields.birthDate = birthDate
        }
      }

      if (email) {
        let emailResult = await Analyzer.analyzeUserEmail(email)
        if (emailResult.hasError.value) {
          if (emailResult.hasError.type == 4) {

            // Verifica se o usuário que quer atualizar é o mesmo que já possui o Email.
            let isTheSameUser = userRegistred.id == id

            // Impede que o usuário atualize com um Email já cadastrado e que não pertença a ele.
            if (!isTheSameUser) {
              errorFields.push(emailResult)
            }
          }
        } else {
          fields.email = email
        }
      } else {
        fields.email = email
      }

      if (password) {
        let passwordResult = Analyzer.analyzeUserPassword(password)
        if (passwordResult.hasError.value) {
          errorFields.push(passwordResult)
        } else {
          fields.password = password
        }
      }

      // O campo de Role não é obrigatório ser passado, mas é necessário para o banco de dados.
      let roleValue = role == undefined ? '0' : role
      let roleResult = Analyzer.analyzeUserRole(roleValue)
      if (roleResult.hasError.value) {
        errorFields.push(roleResult)
      } else {
        fields.role = role
      }

      if (phoneCode) {
        let phoneCodeResult = Analyzer.analyzeUserPhoneCode(phoneCode)
        if (phoneCodeResult.hasError.value) {
          errorFields.push(phoneCodeResult)
        } else {
          fields.phoneCode = phoneCode
        }
      }

      if (phoneNumber) {
        let phoneNumberResult = Analyzer.analyzeUserPhoneNumber(phoneCode, phoneNumber)
        if (phoneNumberResult.hasError.value) {
          errorFields.push(phoneNumberResult)
        } else {
          fields.phoneNumber = phoneNumber
        }
      }      

      if (country) {
        let countryResult = Analyzer.analyzeUserCountry(country)
        if (countryResult.hasError.value) {
          errorFields.push(countryResult)
        } else {
          fields.country = country
        }
      }

      if (cpf) {
        if (country == 'BR' || userRegistred.country == 'BR') {
          let cpfResult = await Analyzer.analyzeUserCPF(cpf)
          if (cpfResult.hasError.value) {

            // Type 4 indica que um usuário já está cadastrado com esse CPF.
            if (cpfResult.hasError.type == 4) {

              // Verifica se o usuário que quer atualizar é o mesmo que já possui o CPF.
              let isTheSameUser = userRegistred.id == id

              // Impede que o usuário atualize com um CPF já cadastrado e que não pertença a ele.
              if (!isTheSameUser) {
                errorFields.push(cpfResult)
              }
            }
          } else {
            fields.passportNumber = ''
            fields.cpf = cpf
          }
        } else {
          let countryResult = Analyzer.analyzeUserCountry('')
          errorFields.push(countryResult)
        }
      }

      if (passportNumber) {
        if ((country && country != 'BR') || (userRegistred.country && userRegistred.country != 'BR')) {
          let countryCode = country || userRegistred.country
          let passportNumberResult = await Analyzer.analyzeUserPassportNumber(passportNumber, countryCode)
          if (passportNumberResult.hasError.value) {

            // Type 4 indica que um usuário já está cadastrado com esse Número de Passaporte.
            if (passportNumberResult.hasError.type == 4) {

              // Verifica se o usuário que quer atualizar é o mesmo que já possui o Número do Passaporte.
              let isTheSameUser = userRegistred.id == id

              // Impede que o usuário atualize com um Número do Passaporte já cadastrado e que não pertença a ele.
              if (!isTheSameUser) {
                errorFields.push(passportNumberResult)
              }
            }
          } else {
            fields.cpf = ''
            fields.passportNumber = passportNumber
          }
        } else {
          let countryResult = Analyzer.analyzeUserCountry('')
          errorFields.push(countryResult)
        }
      }

      if (state) {
        let stateResult = await Analyzer.analyzeUserState(country, state)
        if (stateResult.hasError.value) {
          errorFields.push(stateResult)
        } else {
          fields.state = state
        }
      }

      if (city) {
        let cityResult = await Analyzer.analyzeUserCity(country, state, city)
        if (cityResult.hasError.value) {
          errorFields.push(cityResult)
        } else {
          fields.city = city
        }
      }

      if (neighborhood) {
        let neighborhoodResult = Analyzer.analyzeUserNeighborhood(neighborhood)
        if (neighborhoodResult.hasError.value) {
          errorFields.push(neighborhoodResult)
        } else {
          fields.neighborhood = neighborhood
        }
      }
      
      if (road) {
        let roadResult = Analyzer.analyzeUserRoad(road)
        if (roadResult.hasError.value) {
          errorFields.push(roadResult)
        } else {
          fields.road = road
        }
      }      

      if (house_number) {
        let houseNumberResult = Analyzer.analyzeUserHouseNumber(house_number)
        if (houseNumberResult.hasError.value) {
          errorFields.push(houseNumberResult)
        } else {
          fields.house_number = house_number
        }
      }      

      if (information) {
        let informationsResult = Analyzer.analyzeUserAdditionalInformation(information)
        if (informationsResult.hasError.value) {
          errorFields.push(informationsResult.hasError.error)
        } else {
          fields.information = information
        }
      }      

      if (errorFields.length) {
        console.log(`[${ id }] - Foram encontrados ${ errorFields.length } erros.`)
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
      await User.edit(fields)
      res.sendStatus(200)
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