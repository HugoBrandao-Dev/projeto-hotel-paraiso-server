let ApartmentCollection = require('../data/ApartmentCollection.json')
let DateFormated = require('../tools/DateFormated')

let fileSystem = require('fs')
let path = require('path')

// Gera um ID (hardcoded) em Hexadecimal
function genID() {
  return [...Array(24)].map(() => Math.floor(Math.random() * 24).toString(24)).join('')
}

const date = new DateFormated('mongodb')

class Apartment {
  async save(apartment, createdBy) {
    try {
      apartment.id = await genID()

      apartment.created = {
        createdAt: date.getDateTime(),
        createdBy
      }
      
      await ApartmentCollection.apartments.data.push(apartment)
      return
    } catch (error) {
      console.log(error)
      return
    }
  }

  async findOne(id) {
    try {
      let apartment = await ApartmentCollection.apartments.data.find(ap => ap.id == id)
      return apartment
    } catch (error) {
      console.log(error)
      return []
    }
  }

  async findMany(skip = 0, limit = 20) {
    try {
      let apartments = await ApartmentCollection.apartments.data.slice(skip, limit)
      return apartments
    } catch (error) {
      console.log(error)
      return []
    }
  }

  // Busca por um apartamento pelo seu Número
  async findByNumber(number) {
    try {
      let apartment = await ApartmentCollection.apartments.data.find(ap => ap.number == number)
      return apartment
    } catch (error) {
      console.log(error)
      return []
    }
  }

  // Faz a busca das imagens de um apartamento, baseado em seu número.
  async findPictures(number) {

    try {

      let src = await path.resolve(__dirname, `../tmp/uploads/apartments/${ number }`)

      // Verifica se a pasta do apto existe.
      // OBS: Os métodos accessSync() e statSync() NÃO ACEITAM OPERADORES TERNÁRIOS.
      let hasFolder = await fileSystem.existsSync(src) ? true : false

      if (hasFolder) {
        let pictureNames = await fileSystem.readdirSync(src)

        if (!pictureNames.length)
          return []

        let pictures = pictureNames.map(name => path.resolve(__dirname, `..\\tmp\\uploads\\apartments\\${ number }`, name))

        return pictures
      }

      return []

    } catch (error) {
      console.log(error)
      return []
    }

  }

  async edit(apartment, updatedBy) {
    try {
      apartment.updated = {
        updatedAt: date.getDateTime(),
        updatedBy
      }

      let apartmentIndex = await ApartmentCollection.apartments.data.findIndex(doc => doc.id == apartment.id)
      let infos = Object.keys(apartment)
      for (let info of infos) {
        if (info != 'id') {
          ApartmentCollection.apartments.data[apartmentIndex][info] = apartment[info]
        }
      }
      return
    } catch (error) {
      console.log(error)
      return
    }
  }

  async delete(id) {
    try {
      let apartmentIndex = await ApartmentCollection.apartments.data.findIndex(apto => apto.id == id)
      if (apartmentIndex == -1) {
        return 
      } else {
        let apartment = await ApartmentCollection.apartments.data.splice(apartmentIndex, 1)
        return apartment
      }
    } catch (error) {
      console.log(error)
      return
    }
  }
}

module.exports = new Apartment()