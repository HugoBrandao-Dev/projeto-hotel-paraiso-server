let UserCollection = require('../data/UserCollection.json')
let DateFormated = require('../tools/DateFormated')
let uuid = require('uuid')

class User {
  async save(user) {
    try {
      const date = new DateFormated('mongodb')

      user.created = {
        createdAt: date.getDateTime(),
        createdBy: uuid.v4()
      }
      user.updated = {
        updatedAt: '',
        updatedBy: ''
      }

      await UserCollection.users.data.push(user)
      return
    } catch (error) {
      console.log(error)
      return
    }
  }

  async findOne(id) {
    try {
      const user = await UserCollection.users.data.find(doc => doc.id == id )
      return user
    } catch (error) {
      console.log(error)
      return []
    }
  }

  async findMany(skip = null, limit = null) {
    try {
      if (skip) {
        if (limit) {
          return await UserCollection.users.data.slice(skip, limit)
        } else {
          let userLength = await UserCollection.users.data.length
          return await UserCollection.users.data.slice(skip, userLength)
        }
      }
      return await UserCollection.users.data
    } catch (error) {
      console.log(error)
      return []
    }
  }

  async findByDoc(searchType) {
    try {
      let type = Object.keys(searchType)[0]
      let user = await UserCollection.users.data.find(doc => {
        if (doc[type]) {
          return doc[type] == searchType[type]
        }
      })
      return user
    } catch (error) {
      console.log(error)
      return []
    }
  }

  async edit(user) {
    try {
      const date = new DateFormated('mongodb')

      user.updated = {
        updatedAt: date.getDateTime(),
        updatedBy: uuid.v4()
      }
      let userIndex = await UserCollection.users.data.findIndex(doc => doc.id == user.id)
      let infos = Object.keys(user)
      for (let info of infos) {
        if (info != 'id') {
          UserCollection.users.data[userIndex][info] = user[info]
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