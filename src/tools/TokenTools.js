const jwt = require('jsonwebtoken')

const privateKey = 'k372gkhcfmhg6l9nj19i51ng'

class Token {

  static getDecodedToken(bearerToken) {

    let token = bearerToken.split(' ')[1]
    let decodedToken = null
    jwt.verify(token, privateKey, function(error, decoded) {

      if (error) {
        console.log(error)
        return ''
      } else {
        decodedToken = decoded
      }

    })

    return decodedToken

  }

  // Gera um token, baseando-se em um objeto.
  static gen(obj) {

    let config = {
      expiresIn: '7d'
    }

    let token = jwt.sign(obj, privateKey, config)

    return token

  }

}

module.exports = Token