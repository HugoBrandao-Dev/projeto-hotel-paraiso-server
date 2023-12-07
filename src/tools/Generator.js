const validator = require('validator')
const baseURL = 'http://localhost:4000'
const path = require('path')
const fileSystem = require('fs')

const projectLinks = {
  errors: 'https://projetohotelparaiso.dev/docs/erros'
}

class Generator {
  static genID() {
    try {
      return [...Array(24)].map(() => Math.floor(Math.random() * 24).toString(24)).join('')
    } catch (error) {
      console.log(error)
    }
  }

  static genCPF() {
    let cpf = ''
      for (let v = 1; v <= 11; v++) {
        let num = Math.floor(Math.random() * 10)
        cpf += num
      }
    return cpf
  }

  static genPassportNumber() {
    let found = false
    while (!found) {
      let num = `${ Math.floor(Math.random() * ((499999999 + 1) - 300000000)) + 300000000 }`
      let isValid = validator.isPassportNumber(num, 'US')
      if (isValid) {
        found = true
        return num
      }
    }
  }

  static genHATEOAS(id, plural, singular, addListLink = false) {

    let HATEOAS = [
      {
        href: `${ baseURL }/${ plural }/${ id }`,
        method: 'GET',
        rel: `self_${ singular }`
      },
      {
        href: `${ baseURL }/${ plural }`,
        method: 'PUT',
        rel: `edit_${ singular }`
      },
      {
        href: `${ baseURL }/${ plural }/${ id }`,
        method: 'DELETE',
        rel: `delete_${ singular }`
      },
    ]

    if (addListLink) {
      HATEOAS.push({
        href: `${ baseURL }/${ plural }`,
        method: 'GET',
        rel: `${ singular }_list`
      })
    }

    return HATEOAS
  }

  static genBinaryFile(fileName) {

    // Todos os arquivo devem estar dentro da pasta IMG.
    let src = path.resolve(__dirname, `../../test/img/${ fileName }`)

    fileSystem.readFile(src, 'binary', function(errorFile, responseFile) {
      if (errorFile) {
        console.log(errorFile)
        return
      } else {
        return responseFile
      }
    })

  }

  static genQueryStringFromObject(obj) {

    let resultArray = []

    for (let filter of Object.keys(obj)) {
      resultArray.push(`${ filter }=${ obj[filter] }`)
    }

    // let resultJoined = 

    return '?'+resultArray.join('&')

  }

  static genRestException(errors, returnWithErrorFields = true) {

    let codeArray = errors.map(item => item.hasError.type)

    // Cria um array contendo os Status codes dos erros encontrados.
    let statusArray = codeArray.map(code => {
      switch(code) {
        case 3:
          return '404'
          break
        case 5:
          return '401'
          break
        case 6:
          return '403'
          break
        default:
          return '400'
      }
    })

    let firstStatus = statusArray[0]

    // Caso encontre erros com HTTP Status Code diferentes, o status final será '400'.
    let status = statusArray.every(item => item == firstStatus) ? firstStatus : '400'

    let messageArray = errors.map(item => item.hasError.error)
    let moreinfoArray = errors.map(item => `${ projectLinks.errors }/${ item.hasError.type }`)

    let RestException = {
      "Code": codeArray.length > 1 ? codeArray.join(';') : codeArray.toString(),
      "Message": messageArray.length > 1 ? messageArray.join(';') : messageArray.toString(),
      "Status": status,
      "MoreInfo": moreinfoArray.length > 1 ? moreinfoArray.join(';') : moreinfoArray.toString(),
    }

    if (returnWithErrorFields)
      RestException["ErrorFields"] = errors

    return RestException

  }

}

module.exports = Generator