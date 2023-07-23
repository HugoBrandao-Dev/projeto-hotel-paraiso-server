const axios = require('axios')
const axios_countryStateCity = axios.create({
  baseURL: 'https://api.countrystatecity.in/v1',
  headers: {
    'X-CSCAPI-KEY': 'UlRPNjR3OGhQOGhiRmloR0FWaDNwSGY2VzZIWlRKRzBNZDN5WUdPdQ=='
  }
})
const validator = require('validator')

// Models
const User = require('../models/User')

class Analyzer {
  static analyzeUserName(name = '') {
    let acceptableChars = ' \''
    let result = { field: 'iptName', hasError: { value: false, error: '' }}

    // Caso o usuário não tenha passado um nome
    if (!name) {
      result.hasError.value = true
      result.hasError.error = 'O campo Nome é obrigatório'
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
      result.hasError.error = 'O campo Nome possui caracteres inválidos'
    }
    return result
  }
  static async analyzeUserEmail(email = '') {
    try {
      let acceptableChars = '@_.'
      let result = { field: 'iptEmail', hasError: { value: false, error: '' }}

      // Caso o usuário não tenha passado um email
      if (!email) {
        result.hasError.value = true
        result.hasError.error = 'O campo Email é obrigatório.'
        return result
      }

      let user = await User.findByDoc({ email })
      if (user) {
        result.hasError.value = true
        result.hasError.error = 'O Email informado já foi cadastrado anteriormente'
        return result
      }

      let hasCharsValid = validator.isAlphanumeric(email, ['en-US'], {
        ignore: acceptableChars
      })
      let isEmailValid = validator.isEmail(email)
      let isValid = hasCharsValid && isEmailValid

      if (!isValid) {
        result.hasError.value = true
        result.hasError.error = 'O campo Email possui caracteres inválidos'
      }
      return result
    } catch (error) {
      console.log(error)
    }
  }
  static analyzeUserBirthDate(date = '') {
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
  static analyzeUserPassword(password = '') {
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

  static analyzeUserPhoneCode(phoneCode = '') {
    let result = { field: 'iptPhoneCode', hasError: { value: false, error: '' }}

    if (!phoneCode) {
      result.hasError.value = true
      result.hasError.error = 'O campo de Código de Telefone é obrigatório.'
      return result
    }

    let isValid = validator.isInt(phoneCode, {
      min: 1,
      max: 998
    })

    if (!isValid) {
      result.hasError.value = true
      result.hasError.error = 'O Código de Telefone é inválido.'
    }

    return result
  }

  static analyzeUserPhoneNumber(phoneNumber = '') {
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
  static analyzeUserCountry(country = '') {
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
  static async analyzeUserState(country = '', state = '') {
    try {
      let result = { field: 'iptState', hasError: { value: false, error: '' }}

      if (!country) {
        result.hasError.value = true
        result.hasError.error = 'É necessário informar o seu País de Nascimento.'
        return result
      }
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
  static async analyzeUserCity(country = '', state = '', city = '') {
    try {
      let result = { field: 'iptCity', hasError: { value: false, error: '' }}

      if (!country) {
        result.hasError.value = true
        result.hasError.error = 'É necessário informar o seu País de Nascimento.'
        return result
      } else if (!state) {
        result.hasError.value = true
        result.hasError.error = 'É necessário informar o seu Estado de Nascimento.'
        return result
      } else if (!city) {
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
  static analyzeUserCPF(cpf = '') {
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
  static analyzeUserPassportNumber(countryCode = '', passportNumber = '') {
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
  static async analyzeUserCEP(cep = '') {
    try {
      let result = { field: 'iptCEP', hasError: { value: false, error: '' }}

      if (!cep) {
        result.hasError.value = true
        result.hasError.error = 'O campo de CEP é obrigatório.'
        return result
      }

      let hasLength = validator.isLength(cep, {
        min: 8,
        max: 8
      })
      let isNumeric = validator.isNumeric(cep, {
        no_symbols: true
      })


      if (!hasLength) {
        result.hasError.value = true
        result.hasError.error = 'Faltam números no CEP informado.'
      } else if (!isNumeric) {
        result.hasError.value = true
        result.hasError.error = 'O campo de CEP possui caracteres inválidos.'
      } else {
        if (hasLength && isNumeric) {
          let response = await axios.get('https://viacep.com.br/ws/01001000/json/')
          if (response.data.erro) {
            result.hasError.value = true
            result.hasError.error = 'O CEP informado não existe.'
          }
        }
      }

      return result
    } catch (error) {
      console.log(error)
    }
  }
  static analyzeUserNeighborhood(neighborhood = '') {
    let acceptableChars = ' \':,.'
    let result = { field: 'iptNeighborhood', hasError: { value: false, error: '' }}

    if (neighborhood) {
      let itsValidPT_BR = validator.isAlphanumeric(neighborhood, ['pt-BR'], {
        ignore: acceptableChars
      })
      let itsValidEN_US = validator.isAlphanumeric(neighborhood, ['en-US'], {
        ignore: acceptableChars
      })

      if (!itsValidPT_BR && !itsValidEN_US) {
        result.hasError.value = true
        result.hasError.error = 'O campo de Bairro possui caracteres inválidos.'
      }
    }

    return result
  }
  static analyzeUserRoad(road = '') {
    let acceptableChars = ' \':,.'
    let result = { field: 'iptRoad', hasError: { value: false, error: '' }}

    if (road) {
      let itsValidPT_BR = validator.isAlphanumeric(road, ['pt-BR'], {
        ignore: acceptableChars
      })
      let itsValidEN_US = validator.isAlphanumeric(road, ['en-US'], {
        ignore: acceptableChars
      })

      if (!itsValidPT_BR && !itsValidEN_US) {
        result.hasError.value = true
        result.hasError.error = 'O campo de Rua possui caracteres inválidos.'
      }
    }

    return result
  }
  static analyzeUserHouseNumber(number) {
    let acceptableChars = ' \':,.'
    let result = { field: 'iptHouseNumber', hasError: { value: false, error: '' }}

    if (number) {
      let isValid = validator.isNumeric(number, {
        no_symbols: true
      })

      if (!isValid) {
        result.hasError.value = true
        result.hasError.error = 'O campo de Número da Casa possui caracteres inválidos.'
      }
    }

    return result
  }
  static analyzeUserAdditionalInformation(information = '') {
    let acceptableChars = ' \n\',.:$-()'
    let result = { field: 'iptAdditionalInformation', hasError: { value: false, error: '' }}

    if (information) {
      let itsValidPT_BR = validator.isAlphanumeric(information, ['pt-BR'], {
        ignore: acceptableChars
      })
      let itsValidEN_US = validator.isAlphanumeric(information, ['en-US'], {
        ignore: acceptableChars
      })

      if (!itsValidPT_BR && !itsValidEN_US) {
        result.hasError.value = true
        result.hasError.error = 'O campo de Rua possui caracteres inválidos.'
      }
    }

    return result
  }
}

module.exports = Analyzer