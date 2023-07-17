const Analyzer = require('../tools/Analyzer')

class UserController {

  async create(req, res, next) {
    try {
      let errorFields = []

      /* ##### CAMPOS OBRIGATÓRIOS ##### */

      if (req.body.name) {
        let name = req.body.name
        if (!Analyzer.analyzeUserName(name)) {
          errorFields.push({
            field: 'iptName',
            error: 'O nome informado é inválido.'
          })
        }
      } else {
        errorFields.push({
          field: 'iptName',
          error: 'Este campo é obrigatório.'
        })
      }

      if (req.body.email) {
        let email = req.body.email
        if (!Analyzer.analyzeUserEmail(email)) {
          errorFields.push({
            field: 'iptEmail',
            error: 'O email informado é inválido.'
          })
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
        }
      } else {
        errorFields.push({
          field: 'iptBirthDate',
          error: 'Este campo é obrigatório'
        })
      }

      if (req.body.phoneNumber) {
        let phoneNumber = req.body.phoneNumber

        if (!Analyzer.analyzeUserPhoneNumber(phoneNumber)) {
          errorFields.push({
            field: 'iptPhoneNumber',
            error: 'Número de telefone inválido.'
          })
        }
      } else {
        errorFields.push({
          field: 'iptPhoneNumber',
          error: 'Este campo é obrigatório.'
        })
      }

      if (req.body.password) {
        let password = req.body.password
        if (!Analyzer.analyzeUserPassword(password)) {
          errorFields.push({
            field: 'iptPassword',
            error: 'A senha informada é inválida.'
          })
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
          if (req.body.state) {
            let state = req.body.state
            let isValid = await Analyzer.analyzeUserState(country, state)
            if (!isValid) {
              errorFields.push({
                field: 'iptState',
                error: 'Estado inválido.'
              })
            } else {
              if (req.body.city) {
                let city = req.body.city
                let isValid = await Analyzer.analyzeUserCity(country, state, city)
                if (!isValid) {
                  errorFields.push({
                    field: 'iptCity',
                    error: 'Cidade inválida.'
                  })
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
        }
      }

      if (req.body.neighborhood) {
        let neighborhood = req.body.neighborhood

        if (!Analyzer.analyzeUserNeighborhood(neighborhood)) {
          errorFields.push({
            field: 'iptNeighborhood',
            error: 'Este campo tem caracteres inválidos.'
          })
        }
      }

      if (req.body.road) {
        let road = req.body.road

        if (!Analyzer.analyzeUserRoad(road)) {
          errorFields.push({
            field: 'iptRoad',
            error: 'Este campo tem caracteres inválidos.'
          })
        }
      }

      if (req.body.number) {
        let number = req.body.number

        if (!Analyzer.analyzeUserHouseNumber(number)) {
          errorFields.push({
            field: 'iptNumber',
            error: 'Este campo deve conter somente números.'
          })
        }
      }

      if (req.body.information) {
        let information = req.body.information

        if (!Analyzer.analyzeUserAdditionalInformation(information)) {
          errorFields.push({
            field: 'iptAddInformation',
            error: 'Este campo contém caracteres inválidos.'
          })
        }
      }

      if (errorFields.length) {
        res.status(403)
        res.json({ msg: 'Erro em algum campo!'})
        return
      }
      res.status(201)
      res.json({ msg: 'Cadastrado com sucesso!'})
    } catch (error) {
      throw new Error(error)
      res.statusCode(500)
    }
  }
}

module.exports = new UserController()