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

      let query = []

      query.push({
        // O ObjectId é um tipo de dado do mongoose e precisa ser importado.
        $match: { _id: ObjectId(_id) }
      })

      // Faz o join com a collection de USERS para saber QUEM CRIOU O USUÁRIO.
      query.push({
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
      })

      // Faz o join com a collection de USERS para saber QUEM ATUALIZOU O USUÁRIO.
      query.push({
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
      })

      const usersFound = await UserModel.aggregate(query)

      return usersFound[0]

    } catch (error) {
      console.log(error)
      return []
    }

  }

  async findByDoc(_searchBy) {

    try {

      let query = []

      query.push({
        $match: { ..._searchBy }
      })

      // Faz o join com a collection de USERS para saber QUEM CRIOU O USUÁRIO.
      query.push({
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
      })

      // Faz o join com a collection de USERS para saber QUEM ATUALIZOU O USUÁRIO.
      query.push({
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
      })

      const usersFound = await UserModel.aggregate(query)

      return usersFound

    } catch (error) {
      console.log(error)
      return []
    }

  }

  async findByRole(_role) {

    try {

      let query = []

      query.push({
        $match: { role: _role }
      })

      // Faz o join com a collection de USERS para saber QUEM CRIOU O USUÁRIO.
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

      // Faz o join com a collection de USERS para saber QUEM ATUALIZOU O USUÁRIO.
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

      let usersFound = await UserModel.aggregate(query)

      return usersFound

    } catch (error) {
      console.log(error)
      return []
    }

  }

  async findMany(_query) {

    try {

      const { skip, limit } = _query

      let query = []

      // Faz o join com a collection de USERS para saber QUEM CRIOU O USUÁRIO.
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

      // Faz o join com a collection de USERS para saber QUEM ATUALIZOU O USUÁRIO.
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

      if (skip || skip == 0)
        query.push({ $skip: skip })

      if (limit)
        query.push({ $limit: limit })

      const usersFound = await UserModel.aggregate(query)

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