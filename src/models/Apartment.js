const Generator = require('../tools/Generator')
let mongoose = require('mongoose')

let fileSystem = require('fs')
let path = require('path')

const ApartmentSchema = require('../schemas/ApartmentSchema')
const ApartmentModel = mongoose.model('apartments', ApartmentSchema)

// Necessário para verificação de igualdade entre IDs.
const ObjectId = mongoose.Types.ObjectId

class Apartment {
  async save(_apartment, _createdBy) {

    try {

      _apartment.created = {
        createdBy: _createdBy
      }

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
        skip,
        limit,
        sort
      } = _query

      let apartments = await ApartmentModel.aggregate([
        {
          $match: { status }
        },
        {
          $lookup: {
            localField: 'created.createdBy',
            from: 'users',
            foreignField: '_id',
            as: 'CREATED_BY',
            pipeline: [
              { $project: { "name": true } }
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
              { $project: { "name": true } }
            ]
          }
        },
        { $skip: skip },
        { $limit: limit }
      ])

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

      // Faz a deleção da pasta de imagens do apto.
      let src = path.resolve(__dirname, `../tmp/uploads/apartments/${ apartment.number }`)
      let hasFolder = await fileSystem.existsSync(src) ? true : false
      if (hasFolder) {
        fileSystem.rmdirSync(src, { recursive: true, retryDelay: 1000 })
      }

      return

    } catch (error) {
      console.log(error)
      return
    }

  }
}

module.exports = new Apartment()