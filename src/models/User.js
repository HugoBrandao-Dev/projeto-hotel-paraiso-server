const DateFormated = require('../tools/DateFormated')

const Generator = require('../tools/Generator')
const { forCreatedBy, forUpdatedBy } = Generator.genStructuresForCreatedByAndUpdatedBy()

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

      // Joins para quem criou e atualizou o usuário.
      query.push(forCreatedBy)
      query.push(forUpdatedBy)

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

      // Joins para quem criou e atualizou o usuário.
      query.push(forCreatedBy)
      query.push(forUpdatedBy)

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

      // Joins para quem criou e atualizou o usuário.
      query.push(forCreatedBy)
      query.push(forUpdatedBy)

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

      // Joins para quem criou e atualizou o usuário.
      query.push(forCreatedBy)
      query.push(forUpdatedBy)

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

      let user = { ..._user, $set: {} }

      // Faz a atualização somente do endereço que foi informado, sem apagar os outros do DB.
      if (Object.keys(_user.address).length > 0) {
        for (let info of Object.keys(_user.address)) {
          if (_user.address[info])
            user.$set[`address.${ info }`] = _user.address[info]
        }
        delete user.address
      }

      console.log(user)
      let userBeforeModified = await UserModel.findByIdAndUpdate(`${ _userToBeUpdated }`, user)

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