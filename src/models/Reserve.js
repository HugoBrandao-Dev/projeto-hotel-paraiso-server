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

  async edit(_apartment_id, _apartment) {

    try {

      const {
        status,
        client_id,
        start,
        end,
        reserved
      } = _apartment.reserve

      let reserve = { $set: {} }

      if (status)
        reserve.$set['reserve.status'] = status

      if (client_id)
        reserve.$set['reserve.client_id'] = client_id

      if (start)
        reserve.$set['reserve.start'] = start

      if (end)
        reserve.$set['reserve.end'] = end

      if (reserved && reserved.reservedAt)
        reserve.$set['reserve.reserved.reservedAt'] = reserved.reservedAt

      if (reserved && reserved.reservedBy)
        reserve.$set['reserve.reserved.reservedBy'] = reserved.reservedBy

      await ApartmentModel.findByIdAndUpdate(_apartment_id, reserve)

      return

    } catch (error) {
      console.log(error)
      return []
    }

  }

  async delete(_id) {
    try {

      let apartament = {
        reserve: {
          status: 'livre'
        }
      }

      await ApartmentModel.findByIdAndUpdate(_id, apartament)

    } catch (error) {
      console.log(error)
      return
    }
  }
}

module.exports = new Reserve()