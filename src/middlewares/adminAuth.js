const jwt = require('jsonwebtoken')

const secret = 'k372gkhcfmhg6l9nj19i51ng'

const projectLinks = {
  errors: 'https://projetohotelparaiso.dev/docs/erros'
}

function adminAuth(req, res, next) {
  const authToken = req.headers['authorization']

  if (authToken) {

    // Pega somente o token, excluindo o 'Bearer'.
    const token = authToken.split(' ')[1]

    jwt.verify(token, secret, function(error, decoded) {
      if (error) {
        console.log(error)
      } else {
        if (decoded.role > 0) {
          next()
        } else {
          if (req.params.id) {
            if (req.params.id != decoded.id) {
              let RestException = {
                Code: '6',
                Message: 'O usuário não tem permissão de acesso',
                Status: '403',
                MoreInfo: `${ projectLinks.errors }/6`
              }
              res.status(parseInt(RestException.Status))
              res.json({ RestException })
            } else {
              next()
            }
          }
        }
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

module.exports = adminAuth