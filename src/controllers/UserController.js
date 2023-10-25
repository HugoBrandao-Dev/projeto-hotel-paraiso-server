const Analyzer = require('../tools/Analyzer')
const Generator = require('../tools/Generator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

// Models
const User = require('../models/User')

const projectLinks = {
  errors: 'https://projetohotelparaiso.dev/docs/erros'
}
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
        res.status(400)
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
      } else {
        let user = {}

        let salt = bcrypt.genSaltSync(5)
        let hash = bcrypt.hashSync(req.body.password, salt)

        // Busca por usuários com privilégio de Admin.
        const adminUsers = await User.findByRole(roles.admin)

        // Se não houver admin, será criado um, caso contrário será criado uma conta de cliente.
        const role = adminUsers.length > 0 ? '0' : '4'

        // OBRIGATÓRIOS
        user.id = Generator.genID()
        user.name = req.body.name
        user.email = req.body.email
        user.password = hash
        user.role = role
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

        let userLogged = req.headers['authorization'] ? getDecodedToken(req.headers['authorization']) : false

        let userIDWhoCreated = userLogged ? userLogged.id : user.id
        await User.save(user, userIDWhoCreated)
        const savedUser = await User.findByDoc({ email: req.body.email })
        const HATEOAS = Generator.genHATEOAS(savedUser.id, 'users', 'user', userLogged.role > 0)

        res.status(201)
        res.json({ _links: HATEOAS })

      }
    } catch (error) {
      next(error)
    }

  }

  async read(req, res, next) {

    try {

      let id = req.params.id
      const { role } = getDecodedToken(req.headers['authorization'])
      let idResult = await Analyzer.analyzeID(id)

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
      } else {
        let user = await User.findOne(id, role > 0)
        if (user) {

          // Role é baseado na Função da pessoa logada (dona do token)
          user._links = await Generator.genHATEOAS(user.id, 'users', 'user', role > 0)
          res.status(200)
          res.json(user)
        }
      }

    } catch (error) {
      next(error)
    }

  }

  async list(req, res, next) {
    try {
      let hasNext = false
      let users = []

      // Skip é equivalente ao offset, no mongodb.
      let skip = req.query.offset ? parseInt(req.query.offset) : 0

      // A quantidade PADRÃO de itens a serem exibidos por página é 20.
      let limit = req.query.limit ? parseInt(req.query.limit) : 20

      // + 1 é para verificar se há mais item(s) a serem exibidos (para usar no hasNext).
      users = await User.findMany(skip, limit + 1)

      if (users.length) {
        hasNext = users.length > (limit - skip)

        // Retira o dado extra para cálculo do hasNext.
        users.pop()

        for (let user of users) {
          user._links = await Generator.genHATEOAS(user.id, 'users', 'user')
        }

        res.status(200)
        res.json({ users, hasNext })
      }      
    } catch (error) {
      next(error)
    }
  }

  // Realiza busca por um usuário, baseado no seu CPF ou Número de Passaporte.
  async readByDoc(req, res, next) {

    try {

      let { cpf, passportNumber } = req.body

      let RestException = {}
      let type = {}

      if (cpf || passportNumber) {
        if (cpf) {
          let cpfResult = await Analyzer.analyzeUserCPF(cpf)
          if (cpfResult.hasError.type != 4) {
            RestException.Code = `${ cpfResult.hasError.type }`
            RestException.Message = `${ cpfResult.hasError.error }`
            RestException.Status = '400'
            RestException.MoreInfo = `${ projectLinks.errors }/${ cpfResult.hasError.type }`

            res.status(400)
            res.json({ RestException })
            return
          } else {
            type.cpf = cpf
          }
        }

        if (passportNumber) {
          let passportNumberResult = await Analyzer.analyzeUserPassportNumber(passportNumber)
          if (passportNumberResult.hasError.type != 4) {
            RestException.Code = `${ passportNumberResult.hasError.type }`
            RestException.Message = `${ passportNumberResult.hasError.error }`
            RestException.Status = '400'
            RestException.MoreInfo = `${ projectLinks.errors }/${ passportNumberResult.hasError.type }`

            res.status(400)
            res.json({ RestException })
            return
          } else {
            type.passportNumber = passportNumber
          }
        }
      } else {
        let search = req.body
        let docResult = Analyzer.analyzeUserDocs(search)
        if (docResult.hasError.value) {
          RestException.Code = `${ docResult.hasError.type }`
          RestException.Message = `${ docResult.hasError.error }`
          RestException.Status = '400'
          RestException.MoreInfo = `${ projectLinks.errors }/${ docResult.hasError.type }`
          RestException.ErrorField = docResult

          res.status(400)
          res.json({ RestException })
          return
        }
      }

      let user = await User.findByDoc(type)

      if (user) {
        user._links = await Generator.genHATEOAS(user.id, 'users', 'user', true)
        res.status(200)
        res.json(user)
      } else {
        res.sendStatus(404)
      }

    } catch (error) {
      next(error)
    }

  }

  async update(req, res, next) {
    try {
      const { role: roleToken } = getDecodedToken(req.headers['authorization'])

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

      let idResult = await Analyzer.analyzeID(id)
      if (idResult.hasError.value) {
        errorFields.push(idResult)
        if (idResult.hasError.type == 3) {
          res.status(404)
          res.json({
            RestException: {
              "Code": "3",
              "Message": idResult.hasError.error,
              "Status": "404",
              "MoreInfo": `${ projectLinks.errors }/3`
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
        if (nameResult.hasError.type != 1) {
          errorFields.push(nameResult)
        }
      } else {
        fields.name = name
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

      if (country) {
        let countryResult = Analyzer.analyzeUserCountry(country)
        if (countryResult.hasError.value) {
          if (countryResult.hasError.type != 1) {
            errorFields.push(countryResult)
          }
        } else {
          fields.country = country
        }
      }

      if (cpf) {
        if (country == 'BR' || userRegistred.country == 'BR') {
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
        if ((country && country != 'BR') || (userRegistred.country && userRegistred.country != 'BR')) {
          let countryCode = country || userRegistred.country
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

      if (state) {
        let stateResult = await Analyzer.analyzeUserState(country, state)
        if (stateResult.hasError.value) {
          if (stateResult.hasError.type != 1) {
            errorFields.push(stateResult)
          }
        } else {
          fields.state = state
        }
      }

      if (city) {
        let cityResult = await Analyzer.analyzeUserCity(country, state, city)
        if (cityResult.hasError.value) {
          if (cityResult.hasError.type != 1) {
            errorFields.push(cityResult)
          }
        } else {
          fields.city = city
        }
      }

      if (neighborhood) {
        let neighborhoodResult = Analyzer.analyzeUserNeighborhood(neighborhood)
        if (neighborhoodResult.hasError.value) {
          if (neighborhoodResult.hasError.type != 1) {
            errorFields.push(neighborhoodResult)
          }
        } else {
          fields.neighborhood = neighborhood
        }
      }
      
      if (road) {
        let roadResult = Analyzer.analyzeUserRoad(road)
        if (roadResult.hasError.value) {
          if (roadResult.hasError.type != 1) {
            errorFields.push(roadResult)
          }
        } else {
          fields.road = road
        }
      }      

      if (house_number) {
        let houseNumberResult = Analyzer.analyzeUserHouseNumber(house_number)
        if (houseNumberResult.hasError.value) {
          if (houseNumberResult.hasError.type != 1) {
            errorFields.push(houseNumberResult)
          }
        } else {
          fields.house_number = house_number
        }
      }      

      if (information) {
        let informationsResult = Analyzer.analyzeUserAdditionalInformation(information)
        if (informationsResult.hasError.value) {
          if (informationsResult.hasError.type != 1) {
            errorFields.push(informationsResult)
          }
        } else {
          fields.information = information
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
        res.status(400)
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

      let HATEOAS = Generator.genHATEOAS(fields.id, 'users', 'user', roleToken > 0)

      await User.edit(fields)
      res.status(200)
      res.json({ _links: HATEOAS })
    } catch (error) {
      next(error)
    }
  }

  async remove(req, res) {
    try {
      let { id } = req.params
      if (id) {
        let idResult = await Analyzer.analyzeID(id)
        idResult.id = id
        if (idResult.hasError.value) {
          switch (idResult.hasError.type) {
            case 2:
              res.status(400)
              res.json({ 
                RestException: {
                  "Code": `${ idResult.hasError.type }`,
                  "Message": `${ idResult.hasError.error }`,
                  "Status": "400",
                  "MoreInfo": `${ projectLinks.errors }/${ idResult.hasError.type }`,
                  "ErrorFields": idResult
                }
              })
              break
            case 3:
              res.status(404)
              res.json({ 
                RestException: {
                  "Code": `${ idResult.hasError.type }`,
                  "Message": `${ idResult.hasError.error }`,
                  "Status": "404",
                  "MoreInfo": `${ projectLinks.errors }/${ idResult.hasError.type }`,
                  "ErrorFields": idResult
                }
              })
              break
          }
          return
        } else {
          let user = await User.delete(id)
          if (user)  {
            res.status(200)
            res.json({})
          }
        }
      }
    } catch (error) {
      throw new Error(error)
      res.sendStatus(500)
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
      
      let passwordResult = await Analyzer.analyzeUserPassword(password, checkEquality)
      if (passwordResult.hasError.value) {
        errorFields.push(passwordResult)
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

      const user = await User.findByDoc({ email })
      jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role
      }, secret, {
        expiresIn: '24h'
      }, function(error, token) {
        if (error) {
          console.log(error)
        } else {
          let response = { token }

          response._links = Generator.genHATEOAS(user.id, 'users', 'user', user.role > 0)

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