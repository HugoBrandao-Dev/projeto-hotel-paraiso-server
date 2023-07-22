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

      if (req.body.name) {
        let name = req.body.name

        if (!Analyzer.analyzeUserName(name)) {
          errorFields.push({
            field: 'iptName',
            error: 'O nome informado é inválido.'
          })
        } else {
          user.name = name
        }
      } else {
        errorFields.push({
          field: 'iptName',
          error: 'Este campo é obrigatório'
        })
      }

      if (req.body.email) {
        let email = req.body.email
        if (!Analyzer.analyzeUserEmail(email)) {
          errorFields.push({
            field: 'iptEmail',
            error: 'O email informado é inválido.'
          })
        } else {
          user.email = email
        }
      } else {
        errorFields.push({
          field: 'iptEmail',
          error: 'Este campo é obrigatório.'
        })
      }

      if (req.body.birthDate) {
        let birthDate = req.body.birthDate

        let msg = Analyzer.analyzeUserBirthDate(birthDate)
        if (msg.length > 0) {
          errorFields.push({
            field: 'iptBirthDate',
            error: msg
          })
        } else {
          user.birthDate = birthDate
        }
      } else {
        errorFields.push({
          field: 'iptBirthDate',
          error: 'Este campo é obrigatório'
        })
      }

      if (req.body.phoneCode) {
        let phoneCode = req.body.phoneCode

        if (!Analyzer.analyzeUserPhoneCode(phoneCode)) {
          errorFields.push({
            field: 'iptPhoneCode',
            error: 'Código do país inválido.'
          })
        } else {
          user.phoneCode = phoneCode
          if (req.body.phoneNumber) {
            let phoneNumber = req.body.phoneNumber

            // O método de analize do número do telefone exige que o tenha o código do telefone.
            if (!Analyzer.analyzeUserPhoneNumber(`${ phoneCode }${ phoneNumber }`)) {
              errorFields.push({
                field: 'iptPhoneNumber',
                error: 'Número de telefone inválido.'
              })
            } else {
              user.phoneNumber = phoneNumber
            }
          } else {
            errorFields.push({
              field: 'iptPhoneNumber',
              error: 'Este campo é obrigatório.'
            })
          }
        }
      } else {
        errorFields.push({
          field: 'iptPhoneCode',
          error: 'Informe seu país antes de adicionar o telefone.'
        })
      }

      if (req.body.password) {
        let password = req.body.password

        if (!Analyzer.analyzeUserPassword(password)) {
          errorFields.push({
            field: 'iptPassword',
            error: 'A senha informada é inválida.'
          })
        } else {
          user.password = password
        }
      } else {
        errorFields.push({
          field: 'iptPassword',
          error: 'Informe uma senha.'
        })
      }

      if (req.body.country) {
        let country = req.body.country

        if (!Analyzer.analyzeUserCountry(country)) {
          errorFields.push({
            field: 'iptCountry',
            error: 'País inválido.'
          })
        } else {
          user.country = country
          if (req.body.state) {
            let state = req.body.state
            let isValid = await Analyzer.analyzeUserState(country, state)

            if (!isValid) {
              errorFields.push({
                field: 'iptState',
                error: 'Estado inválido.'
              })
            } else {
              user.state = state
              if (req.body.city) {
                let city = req.body.city
                let isValid = await Analyzer.analyzeUserCity(country, state, city)

                if (!isValid) {
                  errorFields.push({
                    field: 'iptCity',
                    error: 'Cidade inválida.'
                  })
                } else {
                  user.city = city
                }
              } else {
                errorFields.push({
                  field: 'iptCity',
                  error: 'Informe a sua cidade de nascimento.'
                })
              }
            }
          } else {
            errorFields.push({
              field: 'iptState',
              error: 'Informe o seu estado de nascimento.'
            })
          }
        }
      } else {
        errorFields.push({
          field: 'iptCountry',
          error: 'Informe o seu país de nascimento.'
        })
      }

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
        let messages = errorFields.map(item => item.error)
        res.status(403)
        res.json({ 
          RestException: {
            "Code": "1",
            "Message": messages.length > 1 ? messages.join(';') : messages.toString(),
            "Status": "403",
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