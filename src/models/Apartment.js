const Generator = require('../tools/Generator')
let mongoose = require('mongoose')

const ApartmentSchema = require('../schemas/ApartmentSchema')
const ApartmentModel = mongoose.model('apartments', ApartmentSchema)

// Necessário para verificação de igualdade entre IDs.
const ObjectId = mongoose.Types.ObjectId

class Apartment {
  async save(_apartment) {

    try {

      const apartment = new ApartmentModel(_apartment)
      
      let result = await apartment.save()

      return result._id

    } catch (error) {
      console.log(error)
      return
    }

  }

  async findOne(_id) {

    try {

      let apartment = await ApartmentModel.aggregate([
        {
          $match: { _id: ObjectId(_id) }
        },
        {
          $lookup: {
            localField: 'created.createdBy',
            from: 'users',
            foreignField: '_id',
            as: 'CREATED_BY',
            pipeline: [
              { $project: { 'name': true } }
            ]
          }
        },
        {
          $lookup: {
            localField: 'updated.updatedBy',
            from: 'users',
            foreignField: '_id',
            as: 'UPDATED_BY',
            pipeline: [
              { $project: { 'name': true } }
            ]
          }
        }
      ])
      
      return apartment[0]

    } catch (error) {
      console.log(error)
      return []
    }

  }

  async findMany(_query) {

    try {

      let {
        status,
        rooms,
        lowest_daily_price,
        highest_daily_price,
        accepts_animals,
        sort,
        skip,
        limit
      } = _query

      let query = [
        {
          $redact: {
            $cond: [{ $and: [] }, '$$KEEP', '$$PRUNE']
          }
        }
      ]

      /* DEFINE OS VALORES INFORMADOS PELO NA URL */

      if (status) {
        query[0].$redact.$cond[0].$and.push({
          'status': status
        })
      }

      // Soma a quantidade de dos cômodos do apto.
      let calcRooms = {
        $sum: {
          $map: {
            input: '$rooms',
            as: 'total_rooms',
            in: '$$total_rooms.quantity'
          }
        }
      }

      if (rooms) {
        query[0].$redact.$cond[0].$and.push({
          $eq: [calcRooms, rooms]
        })
      }

      if (lowest_daily_price) {
        query[0].$redact.$cond[0].$and.push({
          $gte: ['$daily_price', lowest_daily_price]
        })
      }

      if (highest_daily_price) {
        query[0].$redact.$cond[0].$and.push({
          $lte: ['$daily_price', highest_daily_price]
        })
      }

      if (accepts_animals == 0 || accepts_animals == 0) {
        query[0].$redact.$cond[0].$and.push({
          'accepts_animals': accepts_animals
        })
      }

      /* JOIN PARA ACESSO AOS IDs DE QUEM CRIOU E QUE ATUALIZOU O APTO */

      // Created
      query.push({
        $lookup: {
          localField: 'created.createdBy',
          from: 'users',
          foreignField: '_id',
          as: 'CREATED_BY',
          pipeline: [
            { $project: { "name": true } }
          ]
        }
      })

      // Updated
      query.push({
        $lookup: {
          localField: 'updated.updatedBy',
          from: 'users',
          foreignField: '_id',
          as: 'UPDATED_BY',
          pipeline: [
            { $project: { "name": true } }
          ]
        }
      })

      /* DEFINE A ESTRUTRUA DO sort, skip e limit */
      
      if (skip)
        query.push({ $skip: skip })

      if (limit)
        query.push({ $limit: limit })

      if (sort)
        query.push({ $sort: sort })

      let apartments = await ApartmentModel.aggregate(query)

      return apartments

    } catch (error) {
      console.log(error)
      return []
    }

  }

  // Busca por um apartamento pelo seu Número
  async findByNumber(_number) {

    try {

      let apartment = await ApartmentModel.aggregate([
        {
          $match: { number: _number }
        },
        {
          $lookup: {
            localField: 'created.createdBy',
            from: 'users',
            foreignField: '_id',
            as: 'CREATED_BY',
            pipeline: [
              { $project: { 'name': true } }
            ]
          }
        },
        {
          $lookup: {
            localField: 'updated.updatedBy',
            from: 'users',
            foreignField: '_id',
            as: 'UPDATED_BY',
            pipeline: [
              { $project: { 'name': true } }
            ]
          }
        }
      ])

      return apartment[0]

    } catch (error) {
      console.log(error)
      return []
    }

  }

  async edit(_apartmentToBeUpdated, _apartment) {

    try {

      let apartment = await ApartmentModel.findByIdAndUpdate(_apartmentToBeUpdated, _apartment)

      return apartment._id

    } catch (error) {
      console.log(error)
      return
    }

  }

  async delete(_id) {

    try {

      let apartment = await ApartmentModel.findByIdAndDelete(_id)

      return apartment.number

    } catch (error) {
      console.log(error)
      return
    }

  }
}

module.exports = new Apartment()