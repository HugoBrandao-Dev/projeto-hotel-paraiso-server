const jwt = require('jsonwebtoken')
const Generator = require('../tools/Generator')
const secret = 'k372gkhcfmhg6l9nj19i51ng'

function authorization(req, res, next) {
  const authToken = req.headers['authorization']

  if (authToken) {

    // Pega somente o token, excluindo o 'Bearer'.
    const token = authToken.split(' ')[1]

    jwt.verify(token, secret, function(error, decoded) {
      if (error) {

        let errors = [{
          hasError: { value: true, type: 5, error: 'O Token é inválido' }
        }]
        const RestException = Generator.genRestException(errors, false)
        res.status(parseInt(RestException.Status))
        res.json({ RestException })

      } else {
        next()
      }
    })
  } else {

    let errors = [{
      hasError: { value: true, type: 5, error: 'O usuário não está autorizado' }
    }]
    const RestException = Generator.genRestException(errors, false)    
    res.status(parseInt(RestException.Status))
    res.json({ RestException })

  }
}

module.exports = authorization