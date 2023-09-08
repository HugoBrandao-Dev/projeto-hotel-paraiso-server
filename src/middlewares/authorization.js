const jwt = require('jsonwebtoken')

const secret = 'k372gkhcfmhg6l9nj19i51ng'

const projectLinks = {
  errors: 'https://projetohotelparaiso.dev/docs/erros'
}

function authorization(req, res, next) {
  const authToken = req.headers['authorization']

  if (authToken) {

    // Pega somente o token, excluindo o 'Bearer'.
    const token = authToken.split(' ')[1]

    jwt.verify(token, secret, function(error, decoded) {
      if (error) {
        let RestException = {
          Code: '5',
          Message: 'O Token é inválido',
          Status: '401',
          MoreInfo: `${ projectLinks.errors }/5`
        }
        res.status(parseInt(RestException.Status))
        res.json({ RestException })
        console.log(error)
      } else {
        next()
      }
    })
  } else {
    let RestException = {
      Code: '5',
      Message: 'O usuário não está autorizado',
      Status: '401',
      MoreInfo: `${ projectLinks.errors }/5`
    }
    res.status(parseInt(RestException.Status))
    res.json({ RestException })
  }
}

module.exports = authorization