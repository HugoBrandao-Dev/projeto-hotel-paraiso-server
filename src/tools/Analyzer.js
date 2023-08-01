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
    let result = { field: 'iptName', hasError: { value: false, type: null, error: '' }}

    // Caso o usuário não tenha passado um nome
    if (!name) {
      result.hasError.value = true
      result.hasError.type = 1
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
      result.hasError.type = 2
      result.hasError.error = 'O campo Nome possui caracteres inválidos'
    }
    return result
  }
  static async analyzeUserEmail(email = '') {
    try {
      let acceptableChars = '@_.'
      let result = { field: 'iptEmail', hasError: { value: false, type: null, error: '' }}

      // Caso o usuário não tenha passado um email
      if (!email) {
        result.hasError.value = true
        result.hasError.type = 1
        result.hasError.error = 'O campo Email é obrigatório'
        return result
      }

      let user = await User.findByDoc({ email })
      if (user) {
        result.hasError.value = true
        result.hasError.type = 2
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
        result.hasError.email = 2
        result.hasError.error = 'O campo Email possui caracteres inválidos'
      }
      return result
    } catch (error) {
      console.log(error)
    }
  }
  static analyzeUserBirthDate(date = '') {
    let minAgeToRegister = 18
    let result = { field: 'iptBirthDate', hasError: { value: false, type: null, error: '' }}

    // Caso o usuário não tenha passado um email
    if (!date) {
      result.hasError.value = true
      result.hasError.type = 1
      result.hasError.error = 'O campo Data de Nascimento é obrigatório'
      return result
    }

    let isValid = validator.isDate(date)
    if (!isValid) {
      result.hasError.value = true
      result.hasError.type = 2
      result.hasError.error = 'O campo de Data de Nascimento é inválido'
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
    let year = dateNow.getFullYear() - minAgeToRegister
    let fullDate = `${ year }-${ month }-${ day }`

    let isBefore = validator.isBefore(date, fullDate)
    let isEqual = validator.equals(date, fullDate)

    if (!isBefore && !isEqual) {
      result.hasError.value = true
      result.hasError.type = 2
      result.hasError.error = 'Somente usuários com mais de 18 anos podem se cadastrar'
    }
    return result
  }
  static analyzeUserPassword(password = '') {
    let result = { field: 'iptPassword', hasError: { value: false, type: null, error: '' }}

    if (!password) {
      result.hasError.value = true
      result.hasError.type = 1
      result.hasError.error = 'O campo de Senha é obrigatório'
      return result
    }

    let isValid = validator.isStrongPassword(password)

    if (!isValid) {
      result.hasError.value = true
      result.hasError.type = 2
      result.hasError.error = 'A senha é muito fraca'
    }

    return result
  }

  static analyzeUserRole(role = '') {
    let result = { field: 'iptRole', hasError: { value: false, type: null, error: '' }}

    let itsNumeric = validator.isNumeric(role, {
      no_symbols: true
    })
    if (!itsNumeric) {
      result.hasError.value = true
      result.hasError.type = 2
      result.hasError.error = 'O campo de Role possui caracteres inválidos'
      return result
    }

    /*
    0 - cliente
    1 - funcionário
    2 - gerente
    3 - dono / admin
    */
    let itsValid = validator.isInt(role, {
      max: 3,
      min: 0
    })
    if (!itsValid) {
      result.hasError.value = true
      result.hasError.type = 2
      result.hasError.error = 'O valor de Role é de uma função inexistente'
    }

    return result
  }

  static analyzeUserPhoneCode(phoneCode = '') {
    let result = { field: 'iptPhoneCode', hasError: { value: false, type: null, error: '' }}

    if (!phoneCode) {
      result.hasError.value = true
      result.hasError.type = 1
      result.hasError.error = 'O campo de Código de Telefone é obrigatório'
      return result
    }

    let isValid = validator.isInt(phoneCode, {
      min: 1,
      max: 998
    })

    if (!isValid) {
      result.hasError.value = true
      result.hasError.type = 2
      result.hasError.error = 'O Código de Telefone é inválido'
    }

    return result
  }

  static analyzeUserPhoneNumber(phoneCode = '', phoneNumber = '') {
    let result = { field: 'iptPhoneNumber', hasError: { value: false, type: null, error: '' } }

    if (!phoneNumber) {
      result.hasError.value = true
      result.hasError.type = 1
      result.hasError.error = 'O campo de Número de Telefone é obrigatório'
      return result
    }

    let isValid = validator.isMobilePhone(`${phoneCode}${ phoneNumber }`)

    if (!isValid) {
      result.hasError.value = true
      result.hasError.type = 2
      result.hasError.error = 'O telefone é inválido'
    }

    return result
  }

  static analyzeUserCountry(country = '') {
    let result = { field: 'iptCountry', hasError: { value: false, type: null, error: '' }}

    if (!country) {
      result.hasError.value = true
      result.hasError.type = 1
      result.hasError.error = 'O campo de País de Nascimento é obrigatório'
      return result
    }

    let isValid = validator.isISO31661Alpha2(country)

    if (!isValid) {
      result.hasError.value = true
      result.hasError.type = 2
      result.hasError.error = 'País inválido'
    }

    return result
  }
  static async analyzeUserState(country, state = '') {
    try {
      let result = { field: 'iptState', hasError: { value: false, type: null, error: '' }}

      if (!state) {
        result.hasError.value = true
        result.hasError.type = 1
        result.hasError.error = 'O campo de Estado de Nascimento é obrigatório'
        return result
      }

      let response = await axios_countryStateCity.get(`/countries/${ country }/states`)
      let states = response.data.map(item => item.iso2)
      let isValid = validator.isIn(state, states)

      if (!isValid) {
        result.hasError.value = true
        result.hasError.type = 2
        result.hasError.error = 'Estado inválido'
      }

      return result
    } catch (error) {
      console.log(error)
    }
  }
  static async analyzeUserCity(country, state, city = '') {
    try {
      let result = { field: 'iptCity', hasError: { value: false, type: null, error: '' }}

      if (!city) {
        result.hasError.value = true
        result.hasError.type = 1
        result.hasError.error = 'O campo de Cidade de Nascimento é obrigatório'
        return result
      }

      let response = await axios_countryStateCity.get(`/countries/${ country }/states/${ state }/cities`)
      let cities = response.data.map(item => item.name)
      let isValid = validator.isIn(city, cities)

      if (!isValid) {
        result.hasError.value = true
        result.hasError.type = 2
        result.hasError.error = 'Cidade inválida'
      }

      return result
    } catch (error) {
      console.log(error)
    }
  }
  static async analyzeUserCPF(cpf = '') {
    try {
      let result = { field: 'iptCPF', hasError: { value: false, error: '' }}

      if (!cpf) {
        result.hasError.value = true
        result.hasError.error = 'O campo de CPF é obrigatório'
        return result
      }

      // Verificado se o CPF já está cadastrado
      let user = await User.findByDoc({ cpf })
      if (user) {
        result.hasError.value = true
        result.hasError.error = 'O CPF informado já está cadastrado'
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
        result.hasError.error = 'O CPF possui caracteres inválidos'
      } else if (!hasLength) {
        result.hasError.value = true
        result.hasError.error = 'Faltam digitos no seu CPF'
      }

      return result
    } catch (error) {
      console.log(error)
    }
  }
  static async analyzeUserPassportNumber(countryCode, passportNumber = '') {
    try {
      let result = { field: 'iptPassportNumber', hasError: { value: false, type: null, error: '' }}

      if (!passportNumber) {
        result.hasError.value = true
        result.hasError.type = 1
        result.hasError.error = 'This field is required'
        return result
      }

      let user = await User.findByDoc({ passportNumber })
      if (user) {
        result.hasError.value = true
        result.hasError.type = 2
        result.hasError.error = 'Passport number already registred'
        return result
      }

      let isValid = validator.isPassportNumber(passportNumber, countryCode)

      if (!isValid) {
        result.hasError.value = true
        result.hasError.type = 2
        result.hasError.error = 'Invalid passport number'
      }

      return result
    } catch (error) {
      console.log(error)
    }
  }
  static async analyzeUserCEP(cep = '') {
    try {
      let result = { field: 'iptCEP', hasError: { value: false, error: '' }}

      if (cep) {
        let hasLength = validator.isLength(cep, {
          min: 8,
          max: 8
        })
        let isNumeric = validator.isNumeric(cep, {
          no_symbols: true
        })

        if (!hasLength) {
          result.hasError.value = true
          result.hasError.error = 'Faltam números no CEP informado'
          return result
        } 
        if (!isNumeric) {
          result.hasError.value = true
          result.hasError.error = 'O campo de CEP possui caracteres inválidos'
          return result
        }

        let response = await axios.get(`https://viacep.com.br/ws/${ cep }/json/`)
        if (response.data.erro) {
          result.hasError.value = true
          result.hasError.error = 'O CEP informado não existe'
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
        result.hasError.error = 'O campo de Bairro possui caracteres inválidos'
      }
    }

    return result
  }
  static analyzeUserRoad(road = '') {
    let acceptableChars = ' \':,.'
    let result = { field: 'iptRoad', hasError: { value: false, type: null, error: '' }}

    if (road) {
      let itsValidPT_BR = validator.isAlphanumeric(road, ['pt-BR'], {
        ignore: acceptableChars
      })
      let itsValidEN_US = validator.isAlphanumeric(road, ['en-US'], {
        ignore: acceptableChars
      })

      if (!itsValidPT_BR && !itsValidEN_US) {
        result.hasError.value = true
        result.hasError.type = 2
        result.hasError.error = 'O campo de Rua possui caracteres inválidos'
      }
    }

    return result
  }
  static analyzeUserHouseNumber(number = '') {
    let result = { field: 'iptHouseNumber', hasError: { value: false, error: '' }}

    if (number) {
      let isValid = validator.isNumeric(number, {
        no_symbols: true
      })

      if (!isValid) {
        result.hasError.value = true
        result.hasError.error = 'O campo de Número da Casa possui caracteres inválidos'
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
        result.hasError.error = 'O campo de Informações Adicionais possui caracteres invalidos'
      }
    }

    return result
  }
  static async analyzeUserID(id = '') {
    try {
      let acceptableChars = '-'
      let result = { field: 'id', hasError: { value: false, type: null, error: '' }}

      let itsAlphanumeric = validator.isAlphanumeric(id, ['en-US'], {
        ignore: acceptableChars
      })

      let itsHexadecimal = validator.isHexadecimal(id)

      if (!itsAlphanumeric && !itsHexadecimal) {
        result.hasError.value = true
        result.hasError.type = 2
        result.hasError.error = 'O parâmetro ID possui caracteres inválidos'
        return result
      } else {
        let user = await User.findOne(id)
        if (!user) {
          result.hasError.value = true
          result.hasError.type = 3
          result.hasError.error = 'Nenhum usuário com o ID informado está cadastrado'
        }
      }

      return result
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = Analyzer