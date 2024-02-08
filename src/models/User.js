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

      const userRegistred = await user.save()

      return userRegistred
      
    } catch (error) {
      console.log(error)
      return
    }

  }

  async findOne(_id) {

    try {

      const usersFound = await UserModel.aggregate([
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

      return usersFound[0]

    } catch (error) {
      console.log(error)
      return []
    }

  }

  async findByDoc(_searchBy) {

    try {

      const usersFound = await UserModel.aggregate([
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

      return usersFound

    } catch (error) {
      console.log(error)
      return []
    }

  }

  async findByRole(_role) {

    try {

      let usersFound = await UserModel.aggregate([
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

      return usersFound

    } catch (error) {
      console.log(error)
      return []
    }

  }

  async findMany(_query) {

    try {

      const { name, skip, limit } = _query

      const usersFound = await UserModel.aggregate([
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

      return usersFound

    } catch (error) {
      console.log(error)
      return []
    }

  }

  async edit(_userToBeUpdated, _user) {

    try {

      let userBeforeModified = await UserModel.findByIdAndUpdate(`${ _userToBeUpdated }`, _user)

      return userBeforeModified

    } catch (error) {
      console.log(error)
      return []
    }

  }

  async delete(_id) {

    try {

      let userDeleted = await UserModel.findByIdAndDelete(`${ _id }`)

      return userDeleted

    } catch (error) {
      console.log(error)
      return []
    }

  }
}

module.exports = new User()