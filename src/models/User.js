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
}

module.exports = new User()