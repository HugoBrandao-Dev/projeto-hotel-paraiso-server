const UserCollection = require('../data/UserCollection.json')
const DateFormated = require('../tools/DateFormated')
const _ = require('lodash')

const mongoose = require('mongoose')

const UserSchema = require('../schemas/UserSchema')
const UserModel = mongoose.model('users', UserSchema)
const ObjectId = mongoose.Types.ObjectId

class User {
  async save(_user) {

    try {

      const user = new UserModel(_user)

      const result = await user.save()

      return result._id
      
    } catch (error) {
      console.log(error)
      return
    }

  }

  async findOne(_id) {

    try {

      const user = await UserModel.aggregate([
        {
          // O ObjectId é um tipo de dado do mongoose e precisa ser importado.
          $match: { _id: ObjectId(_id) }
        },
        {
          // Faz o link entre o cliente buscado e quem o criou, caso haja.
          $lookup: {
            localField: 'created.createdBy',
            from: 'users',
            foreignField: '_id',
            as: 'CREATED_BY',
            pipeline: [
              // Só retornará o nome de quem o criou (_id retorna por padrão).
              { $project: { "name": true } }
            ]
          }
        },
        {
          // Faz o link entre o cliente buscado e quem fez a última alteração, caso haja.
          $lookup: {
            localField: 'updated.updatedBy',
            from: 'users',
            foreignField: '_id',
            as: 'UPDATED_BY',
            pipeline: [
              // Só retornará o nome de quem fez a última alteração (_id retorna por padrão).
              { $project: { "name": true } }
            ]
          }
        }
      ])

      return user[0]

    } catch (error) {
      console.log(error)
      return []
    }

  }

  async findByDoc(_searchBy) {

    try {

      const users = await UserModel.aggregate([
        {
          $match: { ..._searchBy }
        },
        {
          $lookup: {
            localField: 'created.createdBy',
            from: 'users',
            foreignField: '_id',
            as: 'CREATED_BY',
            pipeline: [
              {
                $project: { "name": true }
              }
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
              {
                $project: { "name": true }
              }
            ]
          }
        }
      ])

      return users

    } catch (error) {
      console.log(error)
      return []
    }

  }

  async findByRole(_role) {

    try {

      let users = await UserModel.aggregate([
        {
          $match: { role: _role }
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
        }
      ])

      return users

    } catch (error) {
      console.log(error)
      return []
    }

  }

  async findMany(_query) {

    try {

      const { name, skip, limit } = _query

      const users = await UserModel.aggregate([
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

      // find({}).skip(skip).limit(limit).lean()

      return users

    } catch (error) {
      console.log(error)
      return []
    }

  }

  async edit(_userToBeUpdated, _user) {

    try {

      await UserModel.findByIdAndUpdate(`${ _userToBeUpdated }`, _user)

      return

    } catch (error) {
      console.log(error)
      return []
    }

  }

  async delete(_id) {

    try {

      await UserModel.findByIdAndDelete(`${ _id }`)
      return

    } catch (error) {
      console.log(error)
      return []
    }

  }
}

module.exports = new User()