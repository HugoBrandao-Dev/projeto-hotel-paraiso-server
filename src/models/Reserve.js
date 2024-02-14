const mongoose = require('mongoose')

const DateFormated = require('../tools/DateFormated')
const date = new DateFormated('mongodb')

const ApartmentSchema = require('../schemas/ApartmentSchema')
const ApartmentModel = mongoose.model('apartments', ApartmentSchema)

// Necessário para verificação de igualdade entre IDs.
const ObjectId = mongoose.Types.ObjectId

// Faz o join com a collection para QUEM FOI RESERVADO.
const forClientID = {
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

// Faz o join com a collection para saber QUEM RESERVOU.
const forWhoReserved = {
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

class Reserve {
  async save(_apartment_id, _reserve) {

    try {

      /*
        Como a criação de uma reserva se dá sempre em um apartamento (documento) já cadastrado, 
        utiliza-se o método findByIdAndUpdate.
      */
      let apartmentBeforeModified = await ApartmentModel.findByIdAndUpdate(_apartment_id, _reserve)

      return apartmentBeforeModified.reserve

    } catch (error) {
      console.log(error)
      return []
    }

  }

  async findOne(_id) {

    try {

      let query = []

      query.push({
        $match: { "_id": ObjectId(_id) }
      })

      // Joins PARA QUEM FOI RESERVADO o apto e PARA QUEM RESERVOU.
      query.push(forClientID)
      query.push(forWhoReserved)

      // Faz com que retorne somente o campo relacionado a reserva.
      query.push({
        $project: {
          'reserve': true
        }
      })

      let reserve = await ApartmentModel.aggregate(query)

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
      } else {
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
      }

      query.push(filter)

      // Joins PARA QUEM FOI RESERVADO o apto e PARA QUEM RESERVOU.
      query.push(forClientID)
      query.push(forWhoReserved)

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

      let reservesFound = await ApartmentModel.aggregate(query)

      return reservesFound

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

      let apartment = { $set: {} }

      /*
      Caso a apto seja colocado como livre ou indisponível, os outros campos da reserva serão 
      limpos.
      */
      let isToClearFields = (status == 'indisponível' || status == 'livre')

      if (isToClearFields) {
        apartment = { reserve: { status } }
      } else {
        if (status)
          apartment.$set['reserve.status'] = status

        if (client_id)
          apartment.$set['reserve.client_id'] = client_id

        if (start)
          apartment.$set['reserve.start'] = start

        if (end)
          apartment.$set['reserve.end'] = end

        if (reserved && reserved.reservedAt)
          apartment.$set['reserve.reserved.reservedAt'] = reserved.reservedAt

        if (reserved && reserved.reservedBy)
          apartment.$set['reserve.reserved.reservedBy'] = reserved.reservedBy
      }

      let apartmentBeforeModified = await ApartmentModel.findByIdAndUpdate(_apartment_id, apartment)

      return apartmentBeforeModified.reserve

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

      // Foi utilizado o método de atualização porque a reserva é um obj dentro do apartmento.
      let apartmentBeforeModified = await ApartmentModel.findByIdAndUpdate(_id, apartament)

      return apartmentBeforeModified.reserve

    } catch (error) {
      console.log(error)
      return
    }
  }
}

module.exports = new Reserve()