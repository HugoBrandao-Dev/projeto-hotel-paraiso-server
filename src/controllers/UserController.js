const Analyzer = require('../tools/Analyzer')
const Generator = require('../tools/Generator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const _ = require('lodash')

// Models
const User = require('../models/User')

const secret = 'k372gkhcfmhg6l9nj19i51ng'

const roles = {
  cliente: 0,
  funcionário: 1,
  gerente: 2,
  proprietário: 3,
  admin: 4
}

function getDecodedToken(bearerToken) {

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
        if (emailResult.hasError.type != 3) {
          errorFields.push(emailResult)
        }
      }

      let birthDateResult = Analyzer.analyzeUserBirthDate(req.body.birthDate)
      if (birthDateResult.hasError.value) {
        errorFields.push(birthDateResult)
      }

      let passwordResult = await Analyzer.analyzeUserPassword(req.body.password)
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
        const RestException = Generator.genRestException(errorFields)
        res.status(parseInt(RestException.Status))
        res.json({ RestException })
        return
      }

      let salt = bcrypt.genSaltSync(5)
      let hash = bcrypt.hashSync(req.body.password, salt)

      // Busca por usuários com privilégio de Admin.
      const adminUsers = await User.findByRole(roles.admin)

      // Se não houver admin, será criado um, caso contrário será criado uma conta de cliente.
      const role = adminUsers.length > 0 ? '0' : '4'

      let user = { address: {} }

      /* ################## OBRIGATÓRIOS ################## */

      // O nome do cliente é armazenado em MINÚSCULOS.
      user.name = req.body.name.toLowerCase()
      user.email = req.body.email
      user.password = hash
      user.role = role
      user.phoneCode = req.body.phoneCode
      user.phoneNumber = req.body.phoneNumber
      user.birthDate = req.body.birthDate
      user.address.country = req.body.country
      user.address.state = req.body.state
      user.address.city = req.body.city
      if (req.body.cpf) {
        user.address.cpf = req.body.cpf
      } else {
        user.address.passportNumber = req.body.passportNumber
      }

      /* ################## OPCIONAIS/CONDICINAIS ################## */

      if (req.body.cep) {
        user.address.cep = req.body.cep
      }
      if (req.body.neighborhood) {
        user.address.neighborhood = req.body.neighborhood
      }
      if (req.body.road) {
        user.address.road = req.body.road
      }
      if (req.body.house_number) {
        user.address.house_number = req.body.house_number
      }
      if (req.body.information) {
        user.address.information = req.body.information
      }

      let userLogged = req.headers['authorization'] ? getDecodedToken(req.headers['authorization']) : false

      let userIDWhoCreated = userLogged ? userLogged.id : user.id
      const userID = await User.save(user, userIDWhoCreated)
      const HATEOAS = Generator.genHATEOAS(userID, 'user', 'users', userLogged.role > 0)

      res.status(201)
      res.json({ _links: HATEOAS })

    } catch (error) {
      next(error)
    }

  }

  async read(req, res, next) {

    try {

      let id = req.params.id
      const { role } = getDecodedToken(req.headers['authorization'])

      let errorFields = []

      let idResult = await Analyzer.analyzeUserID(id)
      if (idResult.hasError.value)
        errorFields.push(idResult)

      if (errorFields.length) {
        const RestException = Generator.genRestException(errorFields)
        res.status(parseInt(RestException.Status))
        res.json({ RestException })
        return
      }

      let user = await User.findOne(id)

      if (user) {

        // O operador delete NÃO funciona.
        user.password = ''

        const createdAt = user.created.createdAt || ''
        const createdBy = user.created.createdBy || ''
        const updatedAt = user.updated.updatedAt || ''
        const updatedBy = user.updated.updatedBy || ''

        // Os valores do created e updated só são settados em casos onde o usuário logado é um Funcionário++.
        if (role > 0) {
          user.created = {}
          user.updated = {}

          if (createdAt)
            user.created.createdAt = createdAt

          if (createdBy) {
            const userWhoCreated = await User.findOne(createdBy)

            // Setta os valores do CREATED.
            user.created = {
              createdBy: {
                id: userWhoCreated._id,
                name: userWhoCreated.name
              }
            }
          }

          if (updatedAt)
            user.updated.updatedAt = updatedAt

          if (updatedBy) {
            const userWhoUpdated = await User.findOne(updatedBy)

            // Setta os valores do UPDATED.
            user.updated = {
              updatedBy: {
                id: userWhoUpdated._id,
                name: userWhoUpdated.name
              }
            }
          }

        }

        // Role é baseado na Função da pessoa logada (dona do token)
        user._links = await Generator.genHATEOAS(user.id, 'user', 'users', role > 0)
        res.status(200)
        res.json(user)
      }

    } catch (error) {
      next(error)
    }

  }

    // Realiza busca por um usuário, baseado no seu CPF ou Número de Passaporte.
  async readByDoc(req, res, next) {

    try {

      let { name, cpf, passportNumber } = req.body

      let searchBy = {}
      let errorFields = []

      let search = Object.keys(req.body)
      let docResult = Analyzer.analyzeUserDocs(search)
      if (docResult.hasError.value) {
        errorFields.push(docResult)
      } else {
        if (name) {
          let nameResult = await Analyzer.analyzeUserName(name)
          if (nameResult.hasError.type)
            errorFields.push(nameResult)
          else
            searchBy.name = name.toLowerCase()
        } else if (cpf) {
          let cpfResult = await Analyzer.analyzeUserCPF(cpf)

          // 4 indica que o CPF já foi cadastrado (irrelevante para validação).
          if (cpfResult.hasError.value)
            if (cpfResult.hasError.type != 4)
              errorFields.push(cpfResult)
          else
            searchBy.cpf = cpf
        } else if (passportNumber) {
          let passportNumberResult = await Analyzer.analyzeUserPassportNumber(passportNumber)

          // 4 indica que o PASSPORT NUMBER já foi cadastrado (irrelevante para validação).
          if (passportNumberResult.hasError.value)
            if (passportNumberResult.hasError.type != 4)
              errorFields.push(passportNumberResult)
          else
            searchBy.passportNumber = passportNumber
        }
      }

      if (errorFields.length) {
        const RestException = Generator.genRestException(errorFields)
        res.status(parseInt(RestException.Status))
        res.json({ RestException })
        return
      }

      let results = await User.findByDoc(searchBy)

      let users = []

      for (let result of results) {
        users.push(_.cloneDeep(result))
      }

      if (results.length) {

        for (let user of users) {
          const createdAt = user.created.createdAt
          const createdBy = user.created.createdBy
          const updatedAt = user.updated.updatedAt
          const updatedBy = user.updated.updatedBy

          delete user.created
          delete user.updated

          const userWhoCreated = await User.findOne(createdBy)

          // Setta os valores do CREATED.
          user.created = {
            createdAt,
            createdBy: {
              id: userWhoCreated.id,
              name: userWhoCreated.name
            }
          }

          if (updatedBy) {
            const userWhoUpdated = await User.findOne(updatedBy)

            // Setta os valores do UPDATED.
            user.updated = {
              updatedAt,
              updatedBy: {
                id: userWhoUpdated.id,
                name: userWhoUpdated.name
              }
            }
          } else {
            user.updated = {
              updatedAt: "",
              updatedBy: {
                id: "",
                name: "",
              }
            }
          }

          user._links = await Generator.genHATEOAS(user.id, 'user', 'users', true)
        }

        res.status(200)
        res.json(users)
      } else {
        res.sendStatus(404)
      }

    } catch (error) {
      console.error(error)
      next(error)
    }

  }

  async list(req, res, next) {

    try {

      const listOfQueryString = Object.keys(req.query)

      let query = {}
      let errorFields = []

      if (listOfQueryString.length) {

        const queryStringResult = Analyzer.analyzeQueryList(listOfQueryString, 'users', false)

        if (queryStringResult.hasError.value) {
          errorFields.push(queryStringResult)
        } else {

          const { name, offset, limit } = req.query

          if (listOfQueryString.includes('name')) {
            const nameResult = Analyzer.analyzeUserName(name)
            if (nameResult.hasError.value)
              errorFields.push(nameResult)
            else
              query.name = name
          }

          if (listOfQueryString.includes('offset')) {
            const offsetResult = await Analyzer.analyzeFilterSkip(offset)
            if (offsetResult.hasError.value)
              errorFields.push(offsetResult)
            else
              query.skip = offset
          } else {
            query.skip = 0
          }

          if (listOfQueryString.includes('limit')) {
            const limitResult = Analyzer.analyzeFilterLimit(limit)
            if (limitResult.hasError.value)
              errorFields.push(limitResult)
            else
              query.limit = limit
          } else {

            // +1 é para cálculo do hasNext.
            query.limit = 20 + 1
          }
        }
        
      } else {
        query.skip = 0

        // +1 é para cálculo do hasNext.
        query.limit = 20 + 1
      }

      if (errorFields.length) {
        const RestException = Generator.genRestException(errorFields)
        res.status(parseInt(RestException.Status))
        res.json({ RestException })
        return
      }

      const result = await User.findMany(query)
      const hasNext = result.length > query.limit - 1
      if (hasNext)
        result.pop()

      let users = []

      if (result.length) {

        for (let item of result) {

          const createdAt = item.created.createdAt
          const createdBy = item.created.createdBy
          const updatedAt = item.updated.updatedAt
          const updatedBy = item.updated.updatedBy

          item.password = ''

          item.created = {}
          item.updated = {}

          if (createdAt)
            item.created.createdAt = createdAt

          if (createdBy) {
            const userWhoCreated = await User.findOne(createdBy)

            // Setta os valores do CREATED.
            item.created = {
              createdBy: {
                id: userWhoCreated._id,
                name: userWhoCreated.name
              }
            }
          }

          if (updatedAt)
            item.updated.updatedAt = updatedAt

          if (updatedBy) {
            const userWhoUpdated = await User.findOne(updatedBy)

            // Setta os valores do UPDATED.
            item.updated = {
              updatedBy: {
                id: userWhoUpdated._id,
                name: userWhoUpdated.name
              }
            }
          }

          item._links = await Generator.genHATEOAS(item._id, 'user', 'users')

          users.push(item)
        }

      }

      res.status(200)
      res.json({ users, hasNext })

    } catch (error) {
      console.error(error)
      next(error)
    }

  }

  async update(req, res, next) {

    try {

      const { id: userIDWhoUpdated, role: roleToken } = getDecodedToken(req.headers['authorization'])

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

      let RestException = null
      let errorFields = []
      let fields = { address: {} }
      let userRegistred = null

      let idResult = await Analyzer.analyzeUserID(id)
      if (idResult.hasError.value) {
        errorFields.push(idResult)
        RestException = Generator.genRestException(errorFields)
        res.status(parseInt(RestException.Status))
        res.json({ RestException })
        return
      } else {
        // Busca pelo usuário que tem o mesmo ID informado.
        userRegistred = await User.findOne(id)
      }

      if (name) {
        let nameResult = Analyzer.analyzeUserName(name)
        if (nameResult.hasError.value) {
          if (nameResult.hasError.type != 1) {
            errorFields.push(nameResult)
          }
        } else {
          fields.name = name
        }
      }

      if (birthDate) {
        let birthDateResult = Analyzer.analyzeUserBirthDate(birthDate)
        if (birthDateResult.hasError.value) {
          if (birthDateResult.hasError.type != 1) {
            errorFields.push(birthDateResult)
          }
        } else {
          fields.birthDate = birthDate
        }
      }

      if (email) {
        let emailResult = await Analyzer.analyzeUserEmail(email)
        if (emailResult.hasError.value) {
          if (emailResult.hasError.type != 3 && emailResult.hasError.type != 1) {

            // Verifica se o usuário que quer atualizar é o mesmo que já possui o Email.
            let isTheSameUser = userRegistred.email == email

            // Impede que o usuário atualize com um Email já cadastrado e que não pertença a ele.
            if (!isTheSameUser) {
              errorFields.push(emailResult)
            }
          } else {
            fields.email = email
          }
        } else {
          fields.email = email
        }
      }

      if (password) {
        let passwordResult = await Analyzer.analyzeUserPassword(password)
        if (passwordResult.hasError.value) {
          if (passwordResult.hasError.type != 1) {
            errorFields.push(passwordResult)
          }
        } else {

          let salt = bcrypt.genSaltSync(5)
          let hash = bcrypt.hashSync(req.body.password, salt)

          fields.password = hash
        }
      }

      // O campo de Role não é obrigatório ser passado, mas é necessário para o banco de dados.
      if (role) {
        let roleResult = Analyzer.analyzeUserRole(role)
        if (roleResult.hasError.value) {
          if (roleResult.hasError.type != 1) {
            errorFields.push(roleResult)
          }
        } else {
          fields.role = role
        }
      }

      if (phoneCode) {
        let phoneCodeResult = Analyzer.analyzeUserPhoneCode(phoneCode)
        if (phoneCodeResult.hasError.value) {
          if (phoneCodeResult.hasError.type != 1) {
            errorFields.push(phoneCodeResult)
          }
        } else {
          fields.phoneCode = phoneCode
        }
      }

      if (phoneNumber) {
        let phoneNumberResult = Analyzer.analyzeUserPhoneNumber(phoneCode, phoneNumber)
        if (phoneNumberResult.hasError.value) {
          if (phoneNumberResult.hasError.type != 1) {
            errorFields.push(phoneNumberResult)
          }
        } else {
          fields.phoneNumber = phoneNumber
        }
      }

      if (cpf) {
        if (country == 'BR' || userRegistred.address.country == 'BR') {
          let cpfResult = await Analyzer.analyzeUserCPF(cpf)
          if (cpfResult.hasError.value) {

            // Type 4 indica que um usuário já está cadastrado com esse CPF.
            if (cpfResult.hasError.type == 4 && cpfResult.hasError.type != 1) {

              // Verifica se o usuário que quer atualizar é o mesmo que já possui o CPF.
              let isTheSameUser = userRegistred.cpf == cpf

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
        if ((country && country != 'BR') || (userRegistred.address.country && userRegistred.address.country != 'BR')) {
          let countryCode = country || userRegistred.address.country
          let passportNumberResult = await Analyzer.analyzeUserPassportNumber(passportNumber, countryCode)
          if (passportNumberResult.hasError.value) {

            // Type 4 indica que um usuário já está cadastrado com esse Número de Passaporte.
            if (passportNumberResult.hasError.type == 4 && passportNumberResult.hasError.type != 1) {

              // Verifica se o usuário que quer atualizar é o mesmo que já possui o Número do Passaporte.
              let isTheSameUser = userRegistred.passportNumber == passportNumber

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

      if (country) {
        let countryResult = Analyzer.analyzeUserCountry(country)
        if (countryResult.hasError.value) {
          if (countryResult.hasError.type != 1) {
            errorFields.push(countryResult)
          }
        } else {
          fields.address.country = country

          if (country == 'BR') {
            let cepResult = await Analyzer.analyzeUserCEP(cep)
            if (cepResult.hasError.value)
              errorFields.push(cepResult)
            else
              fields.address.cep = cep
          } else {
            fields.address.cep = ''
          }
        }
      }

      if (state) {
        let stateResult = await Analyzer.analyzeUserState(country, state)
        if (stateResult.hasError.value) {
          if (stateResult.hasError.type != 1) {
            errorFields.push(stateResult)
          }
        } else {
          fields.address.state = state
        }
      }

      if (city) {
        let cityResult = await Analyzer.analyzeUserCity(country, state, city)
        if (cityResult.hasError.value) {
          if (cityResult.hasError.type != 1) {
            errorFields.push(cityResult)
          }
        } else {
          fields.address.city = city
        }
      }

      if (neighborhood) {
        let neighborhoodResult = Analyzer.analyzeUserNeighborhood(neighborhood)
        if (neighborhoodResult.hasError.value) {
          if (neighborhoodResult.hasError.type != 1) {
            errorFields.push(neighborhoodResult)
          }
        } else {
          fields.address.neighborhood = neighborhood
        }
      }
      
      if (road) {
        let roadResult = Analyzer.analyzeUserRoad(road)
        if (roadResult.hasError.value) {
          if (roadResult.hasError.type != 1) {
            errorFields.push(roadResult)
          }
        } else {
          fields.address.road = road
        }
      }      

      if (house_number) {
        let houseNumberResult = Analyzer.analyzeUserHouseNumber(house_number)
        if (houseNumberResult.hasError.value) {
          if (houseNumberResult.hasError.type != 1) {
            errorFields.push(houseNumberResult)
          }
        } else {
          fields.address.house_number = house_number
        }
      }      

      if (information) {
        let informationsResult = Analyzer.analyzeUserAdditionalInformation(information)
        if (informationsResult.hasError.value) {
          if (informationsResult.hasError.type != 1) {
            errorFields.push(informationsResult)
          }
        } else {
          fields.address.information = information
        }
      }  

      if (errorFields.length) {
        RestException = Generator.genRestException(errorFields)
        res.status(parseInt(RestException.Status))
        res.json({ RestException })
        return
      }

      fields.updated = {
        updatedBy: userIDWhoUpdated
      }

      let HATEOAS = Generator.genHATEOAS(fields.id, 'user', 'users', roleToken > 0)

      await User.edit(id, fields)
      res.status(200)
      res.json({ _links: HATEOAS })

    } catch (error) {
      next(error)
    }

  }

  async remove(req, res) {

    try {
      
      let { id } = req.params

      let errorFields = []

      let idResult = await Analyzer.analyzeUserID(id)
      if (idResult.hasError.value)
        errorFields.push(idResult)

      if (errorFields.length) {
        const RestException = Generator.genRestException(errorFields)
        res.status(parseInt(RestException.Status))
        res.json({ RestException })
        return
      }

      let user = await User.delete(id)
      
      res.status(200)
      res.json({})

    } catch (error) {
      next(error)
    }

  }

  async login(req, res, next) {

    try {

      const { email, password } = req.body

      let errorFields = []

      let emailResult = await Analyzer.analyzeUserEmail(email)
      if (emailResult.hasError.value) {
        if (emailResult.hasError.type != 4) {
          errorFields.push(emailResult)
        }
      }
      
      let checkEquality = { isToCheck: !errorFields.length, email }
      
      // A comparação entre a senha informada e a armazenada é feita dentro do analyzer.
      let passwordResult = await Analyzer.analyzeUserPassword(password, checkEquality)
      if (passwordResult.hasError.value) {
        errorFields.push(passwordResult)
      }

      if (errorFields.length) {
        const RestException = Generator.genRestException(errorFields)
        res.status(parseInt(RestException.Status))
        res.json({ RestException })
        return
      }

      let result = await User.findByDoc({ email })
      const user = result[0]
      jwt.sign({
        id: user._id,
        email: user.email,
        role: user.role
      }, secret, {
        expiresIn: '24h'
      }, function(error, token) {
        if (error) {
          console.log(error)
        } else {
          let response = { token }

          response._links = Generator.genHATEOAS(user._id, 'user', 'users', user.role > 0)

          res.status(200)
          res.json(response)
        }
      })

    } catch (error) {
      next(error)
    }

  }

}

module.exports = new UserController()