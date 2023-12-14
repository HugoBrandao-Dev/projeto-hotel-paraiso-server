const UserCollection = require('../data/UserCollection.json')
const DateFormated = require('../tools/DateFormated')
const _ = require('lodash')
const mongoose = require('mongoose')

const UserSchema = require('../schemas/UserSchema')
const UserModel = mongoose.model('users', UserSchema)

class User {
  async save(_user, _createdBy) {

    try {

      const obj = {
        ..._user,
        created: {
          createdBy: _createdBy
        }
      }

      const user = new UserModel(obj)

      const result = await user.save()

      return result._id
      
    } catch (error) {
      console.log(error)
      return
    }

  }

  async findOne(_id) {

    try {

      const user = await UserModel.findById(_id)
      return user

    } catch (error) {
      console.log(error)
      return []
    }

  }

  async findByDoc(_searchBy) {

    try {

      const users = await UserModel.find(_searchBy)
      return users

    } catch (error) {
      console.log(error)
      return []
    }

  }

  async findByRole(_role) {

    try {

      let users = await UserModel.find({ role: _role })
      return users

    } catch (error) {
      console.log(error)
      return []
    }

  }

  async findMany(_query) {

    try {

      const { name, skip, limit } = _query

      const users = await UserModel.find({}).skip(skip).limit(limit)

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

  async delete(id) {
    try {
      let userIndex = await UserCollection.users.data.findIndex(doc => doc.id == id)
      if (userIndex == -1) {
        return 
      } else {
        let user = await UserCollection.users.data.splice(userIndex, 1)
        return user
      }
    } catch (error) {
      console.log(error)
      return []
    }
  }
}

module.exports = new User()