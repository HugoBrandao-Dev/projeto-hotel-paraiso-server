const UserCollection = require('../data/UserCollection.json')
const DateFormated = require('../tools/DateFormated')
const _ = require('lodash')
const uuid = require('uuid')

class User {
  async save(user, createdBy) {
    try {
      const date = new DateFormated('mongodb')

      user.created = {
        createdAt: date.getDateTime(),
        createdBy
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

  async findOne(id, role) {

    try {

      const user = await UserCollection.users.data.find(doc => doc.id == id)

      if (role) {
        let result = _.cloneDeep(user)

        delete result.created
        delete result.updated

        const userWhoCreated = await UserCollection.users.data.find(doc => doc.id == user.created.createdBy)

        result.created = {
          createdAt: user.created.createdAt,
          createdBy: {
            id: userWhoCreated.id,
            name: userWhoCreated.name
          }
        }

        if (user.updated.updatedBy) {
          const userWhoUpdated = await UserCollection.users.data.find(doc => doc.id == user.updated.updatedBy)

          result.updated = {
            updatedAt: user.updated.updatedAt,
            updatedBy: {
              id: userWhoUpdated.id,
              name: userWhoUpdated.name
            }
          }
        } else {
          result.updated = {
            updatedAt: "",
            updatedBy: {
              id: "",
              name: "",
            }
          }
        }
        return result
      }

      return user

    } catch (error) {
      console.log(error)
      return []
    }

  }

  async findMany(skip = null, limit = null) {
    try {
      const user = await UserCollection.users.data.slice(skip, limit)
      return user 
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

  async findByRole(role) {
    try {
      let users = await UserCollection.users.data.filter(user => user.role == role)
      return users
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