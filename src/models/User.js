const UserCollection = require('../data/UserCollection.json')
const DateFormated = require('../tools/DateFormated')
const _ = require('lodash')

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

  async findOne(id) {

    try {

      const user = await UserCollection.users.data.find(doc => doc.id == id)

      return user

    } catch (error) {
      console.log(error)
      return []
    }

  }

  async findByDoc(searchBy) {

    try {

      let type = Object.keys(searchBy)[0]
      let users = []

      if (type != 'name') {
        users = await UserCollection.users.data.filter(doc => {
          if (doc[type]) {
            return doc[type] == searchBy[type]
          }
        })
      } else {
        users = await UserCollection.users.data.filter(doc => {
          let searchLower = searchBy['name'].toLowerCase()
          let docLower = doc.name.toLowerCase()
          return docLower.indexOf(searchLower) > -1
        })
      }

      return users

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

  async findMany(query) {

    try {

      const { name, skip, limit } = query

      let users = await UserCollection.users.data

      if (name) {
        users = await users.filter(user => {
          // Nome que já está cadastrado.
          let userNameLower = user.name.toLowerCase()

          // Nome informado na query string.
          let nameLower = name.toLowerCase()
          return userNameLower.includes(nameLower)
        })
      }
      
      users = await users.slice(skip, limit)

      return users

    } catch (error) {
      console.log(error)
      return []
    }

  }

  async edit(user, updatedBy) {
    try {
      const date = new DateFormated('mongodb')

      user.updated = {
        updatedAt: date.getDateTime(),
        updatedBy,
      }
      let userIndex = await UserCollection.users.data.findIndex(doc => doc.id == user.id)
      let infos = Object.keys(user)
      for (let info of infos) {
        if (info != 'id') {
          if (info == 'address') {
            let address_infos = Object.keys(user.address)
            for (let address_info of address_infos) {
              UserCollection.users.data[userIndex][info][address_info] = user[info][address_info]
            }
          } else {
            UserCollection.users.data[userIndex][info] = user[info]
          }
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