let UserCollection = require('../data/UserCollection.json')

class User {
  async save(user) {
    try {
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
}

module.exports = new User()