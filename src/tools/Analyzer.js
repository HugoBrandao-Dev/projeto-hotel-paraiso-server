const validator = require('validator')
const DateFormated = require('./DateFormated')
const bcrypt = require('bcryptjs')
const axios = require('axios')
const axios_countryStateCity = axios.create({
  baseURL: 'https://api.countrystatecity.in/v1',
  headers: {
    'X-CSCAPI-KEY': 'UlRPNjR3OGhQOGhiRmloR0FWaDNwSGY2VzZIWlRKRzBNZDN5WUdPdQ=='
  }
})

// Models
const User = require('../models/User')
const Apartment = require('../models/Apartment')

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

      let usersFound = await User.findByDoc({ email })
      if (usersFound.length) {
        result.hasError.value = true
        result.hasError.type = 4
        result.hasError.error = 'O Email informado já foi cadastrado anteriormente'
        return result
      } else {
        result.hasError.value = true
        result.hasError.type = 3
        result.hasError.error = 'O Email informado não está cadastrado'
        return result
      }

      let hasCharsValid = validator.isAlphanumeric(email, ['en-US'], {
        ignore: acceptableChars
      })
      let isEmailValid = validator.isEmail(email)
      let isValid = hasCharsValid && isEmailValid

      if (!isValid) {
        result.hasError.value = true
        result.hasError.type = 2
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

  static async analyzeUserPassword(password = '', checkEquality = { isToCheck: false, email: '' }) {
    try {
      let result = { field: 'iptPassword', hasError: { value: false, type: null, error: '' }}

      if (!password) {
        result.hasError.value = true
        result.hasError.type = 1
        result.hasError.error = 'O campo de Senha é obrigatório'
        return result
      }

      if (checkEquality.isToCheck) {
        let userRegistred = await User.findByDoc({ email: checkEquality.email })
        let isEqual = bcrypt.compareSync(password, userRegistred[0].password)
        if (!isEqual) {
          result.hasError.value = true
          result.hasError.type = 2
          result.hasError.error = 'A senha informada é inválida'
          return result
        }
      }

      let isValid = validator.isStrongPassword(password)

      if (!isValid) {
        result.hasError.value = true
        result.hasError.type = 2
        result.hasError.error = 'A senha é muito fraca'
      }

      return result
    } catch (error) {
      console.log(error)
    }
    
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
    3 - dono
    4 - admin
    */
    let itsValid = validator.isInt(role, {
      max: 4,
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
      let result = { field: 'iptCPF', hasError: { value: false, type: null, error: '' }}

      if (!cpf) {
        result.hasError.value = true
        result.hasError.type = 1
        result.hasError.error = 'O campo de CPF é obrigatório'
        return result
      }

      // Verificado se o CPF já está cadastrado
      let usersFound = await User.findByDoc({ cpf })
      if (usersFound.length) {
        result.hasError.value = true
        result.hasError.type = 4
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
        result.hasError.type = 2
        result.hasError.error = 'O CPF possui caracteres inválidos'
      } else if (!hasLength) {
        result.hasError.value = true
        result.hasError.type = 2
        result.hasError.error = 'Faltam digitos no seu CPF'
      }

      return result
    } catch (error) {
      console.log(error)
    }
  }

  static async analyzeUserPassportNumber(passportNumber = '', countryCode = '') {
    try {
      let result = { field: 'iptPassportNumber', hasError: { value: false, type: null, error: '' }}

      if (!passportNumber) {
        result.hasError.value = true
        result.hasError.type = 1
        result.hasError.error = 'This field is required'
        return result
      }

      let hasValidChars = validator.isAlphanumeric(passportNumber)
      if (!hasValidChars) {
        result.hasError.value = true
        result.hasError.type = 2
        result.hasError.error = 'Passport number contains invalid caracters'
        return result
      }

      if (countryCode) {
        let isValid = validator.isPassportNumber(passportNumber, countryCode)
        if (!isValid) {
          result.hasError.value = true
          result.hasError.type = 2
          result.hasError.error = 'Invalid passport number'
        }
      }

      let usersFound = await User.findByDoc({ passportNumber })
      if (usersFound.length) {
        result.hasError.value = true
        result.hasError.type = 4
        result.hasError.error = 'Passport number already registred'
        return result
      }

      return result
    } catch (error) {
      console.log(error)
    }
  }

  static async analyzeUserCEP(cep = '') {
    try {
      let result = { field: 'iptCEP', hasError: { value: false, type: null, error: '' }}

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
          result.hasError.type = 2
          result.hasError.error = 'Faltam números no CEP informado'
          return result
        } 
        if (!isNumeric) {
          result.hasError.value = true
          result.hasError.type = 2
          result.hasError.error = 'O campo de CEP possui caracteres inválidos'
          return result
        }

        let response = await axios.get(`https://viacep.com.br/ws/${ cep }/json/`)
        if (response.data.erro) {
          result.hasError.value = true
          result.hasError.type = 2
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
    let result = { field: 'iptNeighborhood', hasError: { value: false, type: null, error: '' }}

    if (neighborhood) {
      let itsValidPT_BR = validator.isAlphanumeric(neighborhood, ['pt-BR'], {
        ignore: acceptableChars
      })
      let itsValidEN_US = validator.isAlphanumeric(neighborhood, ['en-US'], {
        ignore: acceptableChars
      })

      if (!itsValidPT_BR && !itsValidEN_US) {
        result.hasError.value = true
        result.hasError.type = 2
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
    let result = { field: 'iptHouseNumber', hasError: { value: false, type: null, error: '' }}

    if (number) {
      let isValid = validator.isNumeric(number, {
        no_symbols: true
      })

      if (!isValid) {
        result.hasError.value = true
        result.hasError.type = 2
        result.hasError.error = 'O campo de Número da Casa possui caracteres inválidos'
      }
    }

    return result
  }

  static analyzeUserAdditionalInformation(information = '') {
    let acceptableChars = ' \n\',.:$-()'
    let result = { field: 'iptAdditionalInformation', hasError: { value: false, type: null, error: '' }}

    if (information) {
      let itsValidPT_BR = validator.isAlphanumeric(information, ['pt-BR'], {
        ignore: acceptableChars
      })
      let itsValidEN_US = validator.isAlphanumeric(information, ['en-US'], {
        ignore: acceptableChars
      })

      if (!itsValidPT_BR && !itsValidEN_US) {
        result.hasError.value = true
        result.hasError.type = 2
        result.hasError.error = 'O campo de Informações Adicionais possui caracteres invalidos'
      }
    }

    return result
  }

  static async analyzeUserID(id) {

    let acceptableChars = '-'
    let result = { field: 'iptClient', hasError: { value: false, type: null, error: '' } }

    if (!id) {
      result.hasError.value = true
      result.hasError.type = 1
      result.hasError.error = 'O ID do cliente/usuário é obrigatório'
      return result
    }

    let itsAlphanumeric = validator.isAlphanumeric(id, ['en-US'], {
      ignore: acceptableChars
    })

    let itsHexadecimal = validator.isHexadecimal(id)

    if (!itsAlphanumeric && !itsHexadecimal) {
      result.hasError.value = true
      result.hasError.type = 2
      result.hasError.error = 'O ID do cliente/usuário contém caracteres inválidos'
      return result
    }

    try {

      let isRegistred = await User.findOne(id)
      if (!isRegistred) {
        result.hasError.value = true
        result.hasError.type = 3
        result.hasError.error = 'Nenhum usuário com o ID informado está cadastrado'
      }

    } catch (error) {
      console.error(error)
    }

    return result

  }

  static async analyzeApartmentID(id = '') {

    let acceptableChars = '-'
    let result = { field: 'iptApartment', hasError: { value: false, type: null, error: '' }}

    if (!id) {
      result.hasError.value = true
      result.hasError.type = 1
      result.hasError.error = 'O ID do apartamento é obrigatório'
      return result
    }

    let itsAlphanumeric = validator.isAlphanumeric(id, ['en-US'], {
      ignore: acceptableChars
    })

    let itsHexadecimal = validator.isHexadecimal(id)

    if (!itsAlphanumeric && !itsHexadecimal) {
      result.hasError.value = true
      result.hasError.type = 2
      result.hasError.error = 'O ID do apartamento contém caracteres inválidos'
      return result
    }

    try {

      let isRegistred = await Apartment.findOne(id)
      if (!isRegistred) {
        result.hasError.value = true
        result.hasError.type = 3
        result.hasError.error = 'Nenhum apartamento com o ID informado está cadastrado'
      }

    } catch (error) {
      console.error(error)
    }

    return result

  }

  static analyzeUserDocs(search = []) {
    let result = { field: 'iptDoc', hasError: { value: false, type: null, error: '' }}

    if (!search.length) {
      result.hasError.value = true
      result.hasError.type = 1
      result.hasError.error = "Nenhum CPF ou Número de Passaporte informado"
      return result
    }

    let validFields = ['cpf', 'passportNumber', 'name']

    let isValid = validFields.includes(search[0])
    if (!isValid) {
      result.hasError.value = true
      result.hasError.type = 2
      result.hasError.error = "O campo a ser buscado é inválido"
    }

    return result
  }

  static analyzeApartmentFloor(floor = '') {
    let result = { field: 'iptFloor', hasError: { value: false, type: null, error: '' }}

    if (!floor && floor != '0') {
      result.hasError.value = true
      result.hasError.type = 1
      result.hasError.error = "O campo de Piso do apartamento é obrigatório"
      return result
    }
    
    let isInt = validator.isInt(floor)
    if (!isInt) {
      result.hasError.value = true
      result.hasError.type = 2
      result.hasError.error = "O valor do campo do Piso do apartamento é inválido"
      return result
    } else {

      // Os valor de min/max são os valores dos andares (floor).
      let isValidRange = validator.isInt(floor, {
        min: 0,
        max: 77
      })
      if (!isValidRange) {
        result.hasError.value = true
        result.hasError.type = 2
        result.hasError.error = "O Piso informado não existe"
      }
    }

    return result
  }

  static async analyzeApartmentNumber(number = '') {
    try {
      let result = { field: 'iptNumber', hasError: { value: false, type: null, error: '' }}

      if (!number) {
        result.hasError.value = true
        result.hasError.type = 1
        result.hasError.error = "O campo Número do Apartamento é obrigatório"
        return result
      }

      let isInt = validator.isInt(number)
      if (!isInt) {
        result.hasError.value = true
        result.hasError.type = 2
        result.hasError.error = "O valor do campo de Número do Apartamento é inválido"
        return result
      }

      let apartment = await Apartment.findByNumber(number)
      if (apartment) {
        result.hasError.value = true
        result.hasError.type = 4
        result.hasError.error = "O Número do Apartamento já está cadastrado"
      }

      return result
    } catch (error) {
      console.log(error)
    }
  }

  static analyzeApartmentRooms(rooms = []) {
    try {
      let result = { field: 'iptRooms', hasError: { value: false, type: null, error: '' }}
      let acceptableChars = ' -\''
      let validFields = ['room', 'quantity']

      if (!rooms.length) {
        result.hasError.value = true
        result.hasError.type = 1
        result.hasError.error = "O campo de Cômodos é obrigatório"
        return result
      }

      for (let item of rooms) {
        let fields = Object.keys(item)

        // Verifica se falta algum campo.
        if (fields.length < 2) {
          result.hasError.value = true
          result.hasError.type = 2
          result.hasError.error = "Faltam campos em um dos cômodos informados"
          return result
        }

        for (let field of fields) {
          // Verifica se foi passado algum campo fora dos permitidos.
          let isValidField = validator.isIn(field, validFields)

          if (!isValidField) {
            result.hasError.value = true
            result.hasError.type = 2
            result.hasError.error = "A lista de cômodos possui campos inválidos"
            return result
          } else {
            if (!item[field]) {
              result.hasError.value = true
              result.hasError.type = 2
              result.hasError.error = "Um dos campos dos cômodos informados não possui valor"
              return result
            }
          }
        }

        // Validação do nome do Cômodo
        let isRoomAlphanumericEN_US = validator.isAlphanumeric(item.room, ['en-US'], {
          ignore: acceptableChars
        })
        let isRoomAlphanumericPT_BR = validator.isAlphanumeric(item.room, ['pt-BR'], {
          ignore: acceptableChars
        })

        if (!isRoomAlphanumericEN_US && !isRoomAlphanumericPT_BR) {
          result.hasError.value = true
          result.hasError.type = 2
          result.hasError.error = `'${ item.room }' possui caracteres inválidos`
          return result
        } else {
          let quantity = item.quantity.toString()
          let isInt = validator.isInt(quantity)
          if (!isInt) {
            result.hasError.value = true
            result.hasError.type = 2
            result.hasError.error = `A quantidade de ${ item.room } possui caracteres inválidos`
            return result
          } else {
            let isValidInt = validator.isInt(quantity, {
              gt: 0
            })
            if (!isValidInt) {
              result.hasError.value = true
              result.hasError.type = 2
              result.hasError.error = `A quantidade de ${ item.room } é inválida`
            }
          }
        }
      }

      return result
    } catch (error) {
      console.log(error)
    }
  }

  static analyzeApartmentDailyPrice(price = '') {
    let result = { field: 'iptDailyPrice', hasError: { value: false, type: null, error: '' }}

    let arrayPrice = price.split('.')

    // Verifica se há centavos.
    if (arrayPrice.length == 2) {

      /*
      O método isCurrency() trabalha com DOIS algarismos nos centavos e quando números múltiplos 
      de 10, com excessão 0, são enviados (10, 20, 30, ...) o zero é SUPRIMIDO, acarretando em 
      erro no método de avaliação.
      Ex.:
      20.10 fica 20.1
      20.20 fica 20.2
      20.30 fica 20.3
      */
      if ((arrayPrice[1]).length == 1) {

        // Add 0 no final do valor da diária.
        price = price + '0'
      }
    }

    let isCurrency = validator.isCurrency(price)
    if (!isCurrency) {
      result.hasError.value = true
      result.hasError.type = 2
      result.hasError.error = "O valor da diária contém caracteres inválidos"
      return result
    } else {
      let isPositive = validator.isCurrency(price, {
        allow_negatives: false
      })
      if (!isPositive) {
        result.hasError.value = true
        result.hasError.type = 2
        result.hasError.error = "O valor da diária é inválido"
      }
    }

    return result
  }

  static analyzeApartmentAcceptsAnimals(accepts_animals = '') {
    let result = { field: 'ckbAcceptsAnimals', hasError: { value: false, type: null, error: '' }}

    if (!accepts_animals) {
      result.hasError.value = true
      result.hasError.type = 1
      result.hasError.error = "O valor para Aceitação de Animais é obrigatório"
      return result
    }

    let isInt = validator.isInt(accepts_animals)
    if (!isInt) {
      result.hasError.value = true
      result.hasError.type = 2
      result.hasError.error = "O valor para Aceitação de Animais é inválido"
      return result
    } else {
      if (accepts_animals != true && accepts_animals != false) {
        result.hasError.value = true
        result.hasError.type = 2
        result.hasError.error = "O valor para Aceitação de Animais é diferente de 0 ou 1"
        return result
      }
    }

    return result
  }

  static async analyzeApartmentStatus(status = '', apartment_id = '', toUpdate = false) {
    try {
      let result = { field: 'iptStatus', hasError: { value: false, type: null, error: '' }}
      let acceptableValues = ['livre', 'reservado', 'ocupado', 'indisponível']

      if (!status) {
        result.hasError.value = true
        result.hasError.type = 1
        result.hasError.error = "O campo de Status é obrigatório"
        return result
      }

      let isValid = validator.isIn(status, acceptableValues)
      if (!isValid) {
        result.hasError.value = true
        result.hasError.type = 2
        result.hasError.error = "O valor do campo de Status é inválido"
        return result
      }

      if (apartment_id) {
        let apartment = await Apartment.findOne(apartment_id)
        let statusStored = apartment.reserve.status
        if (apartment) {
          if (statusStored != 'livre') {
            result.hasError.value = true
            result.hasError.type = 4
            result.hasError.error = "O apartamento escolhido já está Reservado, Ocupado ou Indisponível"

          // Impede que uma reserva seja ATUALIZADA, caso esteja livre.
          } else if (statusStored == 'livre' && toUpdate) {
            result.hasError.value = true
            result.hasError.type = 2
            result.hasError.error = "O valor do campo de Status é inválido"
          }
        }
      }

      return result
    } catch (error) {
      console.log(error)
    }
  }

  // Método utilizado para analise dos identificadores dos parâmetros das Query Strings das Listagens.
  static analyzeQueryList(params, resource = 'users', hasPrivs = false) {
    let result = { field: 'queryString', hasError: { value: false, type: null, error: '' }}

    // Verifica se foi passado um mesmo parâmetro duas vezes (o valor é um array).
    for (let param of Object.keys(params)) {
      if (typeof param != 'string' && params[param].length > 1) {
        result.hasError.value = true
        result.hasError.type = 2
        result.hasError.error = `O parâmetro \'${ param }\' foi informado duas vezes`
        return result
      }
    }

    const listOfQueryString = Object.keys(params)
    let acceptableParams = []

    let hasOffset = listOfQueryString.includes('offset')
    let hasLimit = listOfQueryString.includes('limit')

    if (hasOffset && !hasLimit) {
      result.hasError.value = true
      result.hasError.type = 1
      result.hasError.error = 'O parâmetro OFFSET foi informado sem a presença do LIMIT'
      return result
    }

    switch (resource) {
      case 'reserves':
        acceptableParams = ['status', 'offset', 'limit']
        for (let param of listOfQueryString) {
          let isParamValid = validator.isIn(param, acceptableParams)
          if (!isParamValid) {
            result.hasError.value = true
            result.hasError.type = 2
            result.hasError.error = `O parâmetro \'${ param }\' é inválido`
            return result
          }
        }
        break
      case 'apartments':
        acceptableParams = ['rooms', 'lowest_daily_price', 'highest_daily_price', 'accepts_animals', 'offset', 'limit', 'sort']
        if (hasPrivs)
          acceptableParams.unshift('status')
        for (let param of listOfQueryString) {
          let isParamValid = validator.isIn(param, acceptableParams)
          if (!isParamValid) {
            result.hasError.value = true
            result.hasError.type = 2
            result.hasError.error = `O parâmetro \'${ param }\' é inválido`
            return result
          }
        }
        break
      case 'users':
        acceptableParams = ['name', 'offset', 'limit']
        for (let param of listOfQueryString) {
          let isParamValid = validator.isIn(param, acceptableParams)
          if (!isParamValid) {
            result.hasError.value = true
            result.hasError.type = 2
            result.hasError.error = `O parâmetro \'${ param }\' é inválido`
            return result
          }
        }
        break
    }

    return result
  }

  static analyzeApartmentFilterStatus(status) {

    let result = { field: 'status', hasError: { value: false, type: null, error: '' }}

    if (!status) {
      result.hasError.value = true
      result.hasError.type = 1
      result.hasError.error = "O valor do parâmetro Status não foi informado"
      return result
    }

    let acceptableValues = ['livre', 'reservado', 'ocupado', 'indisponível']
    let isValid = validator.isIn(status, acceptableValues)
    if (!isValid) {
      result.hasError.value = true
      result.hasError.type = 2
      result.hasError.error = "O valor do parâmetro Status é inválido"
      return result
    }

    return result

  }

  static analyzeApartmentFilterRooms(rooms) {

    let result = { field: 'rooms', hasError: { value: false, type: null, error: '' }}

    if (!rooms) {
      result.hasError.value = true
      result.hasError.type = 1
      result.hasError.error = "O valor do parâmetro Quantidade de Cômodos não foi informado"
      return result
    }

    const isInt = validator.isInt(rooms, {
      min: 0
    })
    if (!isInt) {
      result.hasError.value = true
      result.hasError.type = 2
      result.hasError.error = "O valor do parâmetro Quantidade de Cômodos é inválido"
    }

    return result

  }

  static analyzeFilterSkip(skip) {

    try {

      let result = { field: 'offset', hasError: { value: false, type: null, error: '' }}

      if (!skip) {
        result.hasError.value = true
        result.hasError.type = 2
        result.hasError.error = "O valor do parâmetro Offset não foi informado"
        return result
      }

      let isInt = validator.isInt(skip, {
        min: 0
      })

      if (!isInt) {
        result.hasError.value = true
        result.hasError.type = 2
        result.hasError.error = "O valor do parâmetro Offset é inválido"
      }

      return result

    } catch (error) {
      console.error(error)
    }

  }

  static analyzeFilterLimit(limit) {

    let result = { field: 'limit', hasError: { value: false, type: null, error: '' }}

    if (!limit) {
      result.hasError.value = true
      result.hasError.type = 2
      result.hasError.error = "O valor do parâmetro Limit não foi informado"
      return result
    }

    let isInt = validator.isInt(limit, {
      gt: 0
    })

    if (!isInt) {
      result.hasError.value = true
      result.hasError.type = 2
      result.hasError.error = "O valor do parâmetro Limit é inválido"
    }

    return result

  }

  static analyzeApartmentFilterLowestDailyPrice(price) {

    let result = { field: 'iptLowestDailyPrice', hasError: { value: false, type: null, error: '' }}

    if (!price) {
      result.hasError.value = true
      result.hasError.type = 1
      result.hasError.error = "O valor do parâmetro Menor Diária não foi informado"
      return result
    }

    const isFloat = validator.isFloat(price, {
      min: 0
    })
    if (!isFloat) {
      result.hasError.value = true
      result.hasError.type = 2
      result.hasError.error = "O valor do parâmetro Menor Diária é inválido"
    }

    return result

  }

  static analyzeApartmentFilterHighestDailyPrice(price, lowestDailyPrice = '0') {

    let result = { field: 'iptHighestDailyPrice', hasError: { value: false, type: null, error: '' }}

    if (!price) {
      result.hasError.value = true
      result.hasError.type = 1
      result.hasError.error = "O valor do parâmetro Maior Diária não foi informado"
      return result
    }

    const isFloat = validator.isFloat(price, {
      min: 0
    })
    if (!isFloat) {
      result.hasError.value = true
      result.hasError.type = 2
      result.hasError.error = "O valor do parâmetro Maior Diária é inválido"
      return result
    }

    const min = parseInt(lowestDailyPrice) + 1
    const isBiggerThanLowestPrice = validator.isFloat(price, {
      min
    })
    if (!isBiggerThanLowestPrice) {
      result.hasError.value = true
      result.hasError.type = 2
      result.hasError.error = "O valor do parâmetro Maior Diária deve ser maior o da Menor Diária"
    }

    return result

  }

  static analyzeApartmentFilterAcceptsAnimals(value) {

    let result = { field: 'accepts_animals', hasError: { value: false, type: null, error: '' }}

    if (!value) {
      result.hasError.value = true
      result.hasError.type = 1
      result.hasError.error = "O valor do parâmetro de Permissão de Animais não foi informado"
      return result
    }

    const isBoolean = validator.isBoolean(value)
    if (!isBoolean) {
      result.hasError.value = true
      result.hasError.type = 2
      result.hasError.error = "O valor para Aceitação de Animais é diferente de 0 ou 1"
    }

    return result

  }

  static analyzeApartmentFilterSort(sort) {

    let result = { field: 'sort', hasError: { value: false, type: null, error: '' }}

    if (!sort) {
      result.hasError.value = true
      result.hasError.type = 1
      result.hasError.error = "O valor do parâmetro de Ordenação não foi informado"
      return result
    }

    const splited = sort.split(':')
    const hasFieldAndType = splited.length == 2
    if (!hasFieldAndType) {
      result.hasError.value = true
      result.hasError.type = 2
      result.hasError.error = "A estrutura do valor da Ordenação é inválida"
      return result
    } else {

      const acceptableFields = ['daily_price']
      if (!acceptableFields.includes(splited[0])) {
        result.hasError.value = true
        result.hasError.type = 2
        result.hasError.error = `O campo a ser ordenado \'${ splited[0] }\' é inválido`
        return result
      }

      const acceptableTypes = ['asc', 'desc']
      if (!acceptableTypes.includes(splited[1])) {
        result.hasError.value = true
        result.hasError.type = 2
        result.hasError.error = `O tipo de ordenação \'${ splited[1] }\' é inválido`
      }
    }

    return result

  }

  static analyzeReserveStartDate(date = '') {
    let result = { field: 'iptStartDate', hasError: { value: false, type: null, error: '' }}
    
    if (!date) {
      result.hasError.value = true
      result.hasError.type = 1
      result.hasError.error = "O campo de Data de Início da reserva é obrigatório"
      return result
    }

    let isDate = validator.isDate(date)

    let dateNow = new DateFormated()
    let isBefore = validator.isBefore(date, dateNow.getDate())

    if (!isDate || isBefore) {
      result.hasError.value = true
      result.hasError.type = 2
      result.hasError.error = "A Data de Início escolhida é inválida"
    }

    return result
  }

  static analyzeReserveEndDate(date = '', start = '') {
    let result = { field: 'iptEndDate', hasError: { value: false, type: null, error: '' }}
    
    if (!date) {
      result.hasError.value = true
      result.hasError.type = 1
      result.hasError.error = "O campo de Data de Fim da reserva é obrigatório"
      return result
    }

    let isDate = validator.isDate(date)

    // Verifica se a Data de Fim informada é anterior a Data de Início.
    let isBefore = validator.isBefore(date, start)
    if (!isDate || isBefore) {
      result.hasError.value = true
      result.hasError.type = 2
      result.hasError.error = "A Data de Fim escolhida é inválida"
    }

    return result
  }
}

module.exports = Analyzer