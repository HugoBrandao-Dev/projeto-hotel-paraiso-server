const axios = require('axios')
const validator = require('validator')
const axios_countryStateCity = axios.create({
  baseURL: 'https://api.countrystatecity.in/v1',
  headers: {
    'X-CSCAPI-KEY': 'UlRPNjR3OGhQOGhiRmloR0FWaDNwSGY2VzZIWlRKRzBNZDN5WUdPdQ=='
  }
})

class UserController {
  analyzeUserName(name = '') {
    let acceptableChars = ' \''
    let result = { field: 'iptName', hasError: { value: false, error: '' }}

    // Caso o usuário não tenha passado um nome
    if (!name) {
      result.hasError.value = true
      result.hasError.error = 'O campo Nome é obrigatório.'
      return result
    }

    let itsValidPT_BR = validator.isAlpha(name, ['pt-BR'], {
      ignore: acceptableChars
    })
    let itsValidEN_US = validator.isAlpha(name, ['en-US'], {
      ignore: acceptableChars
    })

    if (!itsValidPT_BR && !itsValidEN_US) {
      result.hasError.value = true
      result.hasError.error = 'O campo Nome possui caracteres inválidos.'
    }
    return result
  }
  analyzeUserEmail(email = '') {
    let result = { field: 'iptEmail', hasError: { value: false, error: '' }}

    // Caso o usuário não tenha passado um email
    if (!email) {
      result.hasError.value = true
      result.hasError.error = 'O campo Email é obrigatório.'
      return result
    }

    let isValid = validator.isEmail(email)

    // Verificar se o email já existe.

    if (!isValid) {
      result.hasError.value = true
      result.hasError.error = 'O campo Email possui caracteres inválidos.'
    }
    return result
  }
  analyzeBirthDate(date = '') {
    let result = { field: 'iptBirthDate', hasError: { value: false, error: '' }}

    // Caso o usuário não tenha passado um email
    if (!date) {
      result.hasError.value = true
      result.hasError.error = 'O campo Data de Nascimento é obrigatório.'
      return result
    }

    let dateNow = new Date()

    let day = dateNow.getDate()
    if (day < 10) {
      day = `0${ day }`
    }
    let month = dateNow.getMonth() + 1
    if (month < 10) {
      month = `0${ month }`
    }

    // Data de nascimento mínima é 18 anos.
    let year = dateNow.getFullYear() - 18
    let fullDate = `${ year }-${ month }-${ day }`

    let isBefore = validator.isBefore(date, fullDate)
    let isEqual = validator.equals(date, fullDate)

    if (!isBefore && !isEqual) {
      result.hasError.value = true
      result.hasError.error = 'Somente usuários com mais de 18 anos podem se cadastrar.'
    }
    return result
  }
  analyzePassword(password = '') {
    let result = { field: 'iptPassword', hasError: { value: false, error: '' }}

    if (!password) {
      result.hasError.value = true
      result.hasError.error = 'O campo de Senha é obrigatório.'
      return result
    }

    let isValid = validator.isStrongPassword(password)

    if (!isValid) {
      result.hasError.value = true
      result.hasError.error = 'A senha é muito fraca.'
    }

    return result
  }
  analyzePhoneNumber(phoneNumber = '') {
    let result = { field: 'iptPhoneNumber', hasError: { value: false, error: '' }}

    if (!phoneNumber) {
      result.hasError.value = true
      result.hasError.error = 'O campo de Número de Telefone é obrigatório.'
      return result
    }

    let isValid = validator.isMobilePhone(phoneNumber)

    if (!isValid) {
      result.hasError.value = true
      result.hasError.error = 'O telefone é inválido.'
    }

    return result
  }
  analyzeCountry(country = '') {
    let result = { field: 'iptCountry', hasError: { value: false, error: '' }}

    if (!country) {
      result.hasError.value = true
      result.hasError.error = 'O campo de País de Nascimento é obrigatório.'
      return result
    }

    let isValid = validator.isISO31661Alpha2(country)

    if (!isValid) {
      result.hasError.value = true
      result.hasError.error = 'País inválido.'
    }

    return result
  }
  async analyzeState(country, state = '') {
    try {
      let result = { field: 'iptState', hasError: { value: false, error: '' }}

      if (!state) {
        result.hasError.value = true
        result.hasError.error = 'O campo de Estado de Nascimento é obrigatório.'
        return result
      }

      let response = await axios_countryStateCity.get(`/countries/${ country }/states`)
      let states = response.data.map(item => item.iso2)
      let isValid = validator.isIn(state, states)

      if (!isValid) {
        result.hasError.value = true
        result.hasError.error = 'Estado inválido.'
      }

      return result
    } catch (error) {
      console.log(error)
    }
  }
  async analyzeCity(country, state, city = '') {
    try {
      let result = { field: 'iptCity', hasError: { value: false, error: '' }}

      if (!city) {
        result.hasError.value = true
        result.hasError.error = 'O campo de Cidade de Nascimento é obrigatório.'
        return result
      }

      let response = await axios_countryStateCity.get(`/countries/${ country }/states/${ state }/cities`)
      let cities = response.data.map(item => item.name)
      let isValid = validator.isIn(city, cities)

      if (!isValid) {
        result.hasError.value = true
        result.hasError.error = 'Cidade inválida.'
      }

      return result
    } catch (error) {
      console.log(error)
    }
  }
  analyzeCPF(cpf) {
    let result = { field: 'iptCPF', hasError: { value: false, error: '' }}

      if (!cpf) {
        result.hasError.value = true
        result.hasError.error = 'O campo de CPF é obrigatório.'
        return result
      }

      let isInt = validator.isInt(cpf, {
        allow_leading_zeroes: true
      })
      let hasLength = validator.isLength(cpf, {
        min: 11,
        max: 11
      })

      if (!isInt) {
        result.hasError.value = true
        result.hasError.error = 'O CPF possui caracteres inválidos.'
      } else if (!hasLength) {
        result.hasError.value = true
        result.hasError.error = 'Faltam digitos no seu CPF.'
      }

      return result
  }
  analyzePassportNumber(countryCode = '', passportNumber = '') {
    let result = { field: 'iptPassportNumber', hasError: { value: false, error: '' }}

    if (!countryCode) {
      result.hasError.value = true
      result.hasError.error = 'É necessário informar o seu País de Nascimento.'
      return result
    }
    if (!passportNumber) {
      result.hasError.value = true
      result.hasError.error = 'Este campo é obrigatório.'
      return result
    }

    let isValid = validator.isPassportNumber(passportNumber, countryCode)

    if (!isValid) {
      result.hasError.value = true
      result.hasError.error = 'Número de passaporte inválido.'
    }

    return result
  }
  async isValidCEP(cep) {
    try {
      let isLength = validator.isLength(cep, {
        min: 8,
        max: 8
      })
      let isNumeric = validator.isNumeric(cep, {
        no_symbols: true
      })

      if (isLength && isNumeric) {
        let response = await axios.get('https://viacep.com.br/ws/01001000/json/')
        if (!response.data.erro) {
          return true
        }
      }
      return false
    } catch (error) {
      console.log(error)
    }
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
  }

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

      if (req.body.birthDate) {
        let birthDate = req.body.birthDate

        let msg = this.analyzeBirthDate(birthDate)
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

        if (!this.isValidPhoneNumber(phoneNumber)) {
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

      if (req.body.cep) {
        let cep = req.body.cep

        let isValid = await this.isValidCEP(cep)
        if (!isValid) {
          errorFields.push({
            field: 'iptCEP',
            error: 'O valor do CEP é inválido.'
          })
        }
      }

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