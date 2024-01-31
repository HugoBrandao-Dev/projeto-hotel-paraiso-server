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

  async findOne(_id) {

    try {

      let filter = {
        $match: { "_id": ObjectId(_id) }
      }

      // Faz o join com a collection USERS para saber PARA QUEM FOI RESERVADO.
      let joinClient = {
        $lookup: {
          localField: 'reserve.client_id',
          from: 'users',
          foreignField: '_id',
          as: 'reserve.CLIENT_ID',
          pipeline: [
            { $project: { 'name': true } }
          ]
        }
      }

      // Faz o join com a collection USERS para saber QUEM RESERVOU.
      let joinReservedBy = {
        $lookup: {
          localField: 'reserve.reserved.reservedBy',
          from: 'users',
          foreignField: '_id',
          as: 'reserve.reserved.RESERVED_BY',
          pipeline: [
            { $project: { 'name': true } }
          ]
        }
      }

      let onlyReserve = {
        $project: {
          'reserve': true
        }
      }

      let reserve = await ApartmentModel.aggregate([
        filter,
        joinClient,
        joinReservedBy,
        onlyReserve
      ])

      return reserve[0]

    } catch (error) {
      console.log(error)
      return []
    }

  }

  async findMany(_query) {

    try {

      const {
        client_id,
        status,
        skip,
        limit
      } = _query

      let query = []

      let filter = {
        $match: { $and: [] }
      }

      if (client_id) {
        filter.$match.$and.push({
          'reserve.client_id': ObjectId(client_id)
        })
      }

      if (!status) {
        filter.$match.$and.push({
          $or: [
            { 'reserve.status': 'reservado' },
            { 'reserve.status': 'ocupado' },
          ]
        })
      } else {
        filter.$match.$and.push({
          'reserve.status': status
        })
      }

      query.push(filter)

      // Faz o join com a collection USERS para saber PARA QUEM FOI RESERVADO.
      query.push({
        $lookup: {
          localField: 'reserve.client_id',
          from: 'users',
          foreignField: '_id',
          as: 'reserve.CLIENT_ID',
          pipeline: [
            { $project: { 'name': true } }
          ]
        }
      })

      // Faz o join com a collection USERS para saber QUEM RESERVOU.
      query.push({
        $lookup: {
          localField: 'reserve.reserved.reservedBy',
          from: 'users',
          foreignField: '_id',
          as: 'reserve.reserved.RESERVED_BY',
          pipeline: [
            { $project: { 'name': true } }
          ]
        }
      })

      if (skip || skip == 0)
        query.push({ $skip: skip })

      if (limit)
        query.push({ $limit: limit })

      // Faz com que se retorne somente as informações da reserva do apartamento.
      query.push({
        $project: {
          'reserve': true
        }
      })

      let reserve = await ApartmentModel.aggregate(query)

      return reserve

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