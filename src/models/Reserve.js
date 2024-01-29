const ApartmentCollection = require('../data/ApartmentCollection.json')
const DateFormated = require('../tools/DateFormated')
const mongoose = require('mongoose')

const date = new DateFormated('mongodb')

const ApartmentSchema = require('../schemas/ApartmentSchema')
const ApartmentModel = mongoose.model('apartments', ApartmentSchema)

// Necessário para verificação de igualdade entre IDs.
const ObjectId = mongoose.Types.ObjectId

class Reserve {
  async save(_apartment_id, _reserve) {

    try {

      /*
        Como a criação de uma reserva se dá sempre em um apartamento (documento) já cadastrado, 
        utiliza-se o método findByIdAndUpdate.
      */
      await ApartmentModel.findByIdAndUpdate(_apartment_id, _reserve)

      return

    } catch (error) {
      console.log(error)
      return []
    }

  }

  async findOne(id) {

    try {

      let apartment = await ApartmentCollection.apartments.data.find(apto => apto.id == id)
      let reserve = apartment.reserve
      reserve.apartment_id = id
      return reserve

    } catch (error) {
      console.log(error)
      return []
    }

  }

  async findMany(status = '', skip = 0, limit = 20) {

    try {

      let results = null
      if (status) {

        // Faz a buscas por reservas tenham um status igual ao informado.
        let resultsWithStatus = await ApartmentCollection.apartments.data.filter(apto => apto.reserve.status == status)

        results = await resultsWithStatus.map(apto => {
          return {
            apartment_id: apto.id,
            ...apto.reserve
          }
        })
      } else {
        results = await ApartmentCollection.apartments.data.map(apto => {
          return {
            apartment_id: apto.id,
            ...apto.reserve
          }
        })
      }

      if ((skip || skip == 0) && limit) {
        return await results.slice(skip, (skip + limit))
      }

      return results

    } catch (error) {
      console.log(error)
      return []
    }

  }

  async findManyByUserID(client_id, status = '', skip = 0, limit = 20) {
    try {
      let apartments = await ApartmentCollection.apartments.data.filter(apto => {
        if (status) {
          return (apto.reserve.client_id == client_id && apto.reserve.status == status)
        }
        return apto.reserve.client_id == client_id
      })

      let reserves = await apartments.map(apto => {
        return {
          apartment_id: apto.id,
          ...apto.reserve
        }
      })

      return reserves
    } catch (error) {
      console.log(error)
      return []
    }
  }

  async edit(reserve, reservedBy) {

    try {

      reserve.reserved = {
        reservedAt: date.getDateTime(),
        reservedBy,
      }

      // Encontra o index do apartamento que tenha o ID igual ao passado dentro do reserve.
      let apartmentIndex = await ApartmentCollection.apartments.data.findIndex(apto => apto.id == reserve.apartment_id)
      let infos = Object.keys(reserve)
      for (let info of infos) {
        if (info != 'apartment_id') {
          ApartmentCollection.apartments.data[apartmentIndex]["reserve"][info] = reserve[info]
        }
      }        

      return

    } catch (error) {
      console.log(error)
      return []
    }

  }

  async delete(id) {
    try {

      // Encontra o index do apartamento que tenha o ID igual ao passado para o método.
      let apartmentIndex = await ApartmentCollection.apartments.data.findIndex(apto => apto.id == id)

      ApartmentCollection.apartments.data[apartmentIndex].reserve = {
        "status": "livre",
        "user_id": "",
        "date": "",
        "reserved": {
          "reservedAt": "",
          "reservedBy": ""
        },
        "start": "",
        "end": ""
      }
    } catch (error) {
      console.log(error)
      return
    }
  }
}

module.exports = new Reserve()