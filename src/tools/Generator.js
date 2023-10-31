const validator = require('validator')
const baseURL = 'http://localhost:4000'
const path = require('path')
const fileSystem = require('fs')

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
}

module.exports = Generator