const axios = require('axios')
const validator = require('validator')
const axios_countryStateCity = axios.create({
  baseURL: 'https://api.countrystatecity.in/v1',
  headers: {
    'X-CSCAPI-KEY': 'UlRPNjR3OGhQOGhiRmloR0FWaDNwSGY2VzZIWlRKRzBNZDN5WUdPdQ=='
  }
})

class UserController {
  isValidName(name) {
    let itsValidPT_BR = validator.isAlpha(name, ['pt-BR'], {
      ignore: ' \''
    })
    let itsValidEN_US = validator.isAlpha(name, ['en-US'], {
      ignore: ' \''
    })

    return itsValidPT_BR || itsValidEN_US
  }
  isValidEmail(email) {
    return validator.isEmail(email)
  }
  isValidPassword(password) {
    return validator.isStrongPassword(password)
  }
  isValidCountry(country) {
    return validator.isISO31661Alpha2(country)
  }
  async isValidState(country, state) {
    try {
      let response = await axios_countryStateCity.get(`/countries/${ country }/states`)
      let states = response.data.map(item => item.iso2)
      return validator.isIn(state, states)
    } catch (error) {
      console.log(error)
    }
  }
  async isValidCity(country, state, city) {
    try {
      let response = await axios_countryStateCity.get(`/countries/${ country }/states/${ state }/cities`)
      let cities = response.data.map(item => item.name)
      return validator.isIn(city, cities)
    } catch (error) {
      console.log(error)
    }
  }
  isValidCPF(cpf) {
    let isInt = validator.isInt(cpf, {
      allow_leading_zeroes: true
    })
    let isLength = validator.isLength(cpf, {
      min: 11,
      max: 11
    })

    return isInt && isLength
  }
  isValidPassportNumber(countryCode, passportNumber) {
    return validator.isPassportNumber(passportNumber, countryCode)
  }
  isValidNeighborhood(neighborhood) {
    let itsValidPT_BR = validator.isAlphanumeric(neighborhood, ['pt-BR'], {
      ignore: ' \':,.'
    })
    let itsValidEN_US = validator.isAlphanumeric(neighborhood, ['en-US'], {
      ignore: ' \':,.'
    })

    return itsValidPT_BR || itsValidEN_US
  }
  isValidRoad(road) {
    let itsValidPT_BR = validator.isAlphanumeric(road, ['pt-BR'], {
      ignore: ' \':,.'
    })
    let itsValidEN_US = validator.isAlphanumeric(road, ['en-US'], {
      ignore: ' \':,.'
    })

    return itsValidPT_BR || itsValidEN_US
  }
  isValidNumber(number) {
    return validator.isNumeric(number, {
      no_symbols: true
    })
  }
  isValidAddInformation(information) {
    let itsValidPT_BR = validator.isAlphanumeric(information, ['pt-BR'], {
      ignore: ' \n\',.:$-()'
    })
    let itsValidEN_US = validator.isAlphanumeric(information, ['en-US'], {
      ignore: ' \n\',.:$-()'
    })

    return itsValidPT_BR || itsValidEN_US
  },

  async create(req, res) {
    try {
      let errorFields = []

      /* ##### CAMPOS OBRIGATÓRIOS ##### */

      if (req.body.name) {
        let name = req.body.name
        if (!this.isValidName(name)) {
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
        if (!this.isValidEmail(email)) {
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

      if (req.body.password) {
        let password = req.body.password
        if (!this.isValidPassword(password)) {
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
        if (!this.isValidCountry(country)) {
          errorFields.push({
            field: 'iptCountry',
            error: 'País inválido.'
          })
        } else {
          if (req.body.state) {
            let state = req.body.state
            let isValid = await this.isValidState(country, state)
            if (!isValid) {
              errorFields.push({
                field: 'iptState',
                error: 'Estado inválido.'
              })
            } else {
              if (req.body.city) {
                let city = req.body.city
                let isValid = await this.isValidCity(country, state, city)
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

          if (!this.isValidCPF(cpf)) {
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

          if (!this.isValidPassportNumber(countryCode, passportNumber)) {
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

      if (req.body.neighborhood) {
        let neighborhood = req.body.neighborhood

        if (!this.isValidNeighborhood(neighborhood)) {
          errorFields.push({
            field: 'iptNeighborhood',
            error: 'Este campo tem caracteres inválidos.'
          })
        }
      }

      if (req.body.road) {
        let road = req.body.road

        if (!this.isValidRoad(road)) {
          errorFields.push({
            field: 'iptRoad',
            error: 'Este campo tem caracteres inválidos.'
          })
        }
      }

      if (req.body.number) {
        let number = req.body.number

        if (!this.isValidNumber(number)) {
          errorFields.push({
            field: 'iptNumber',
            error: 'Este campo deve conter somente números.'
          })
        }
      }

      if (req.body.information) {
        let information = req.body.information

        if (!this.isValidAddInformation(information)) {
          errorFields.push({
            field: 'iptAddInformation',
            error: 'Este campo contém caracteres inválidos.'
          })
        }
      }
    } catch (error) {
      res.status(500)
      throw new Error(error)
    }
  }
}

module.exports = new UserController()