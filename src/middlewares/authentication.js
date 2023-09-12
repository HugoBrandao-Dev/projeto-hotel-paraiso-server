const jwt = require('jsonwebtoken')

const secret = 'k372gkhcfmhg6l9nj19i51ng'

const projectLinks = {
  errors: 'https://projetohotelparaiso.dev/docs/erros'
}

// Verifica se a conta tem permissão de realizar uma determinada ação.
function isActionAllowed(decodedToken, method, params, body) {
  const upperMethod = method.toUpperCase()
  let allowed = true

  switch (decodedToken.role) {
    case '0':
      switch (upperMethod) {
        case 'POST':
          allowed = false
          break
        case 'GET':
          if (!params.id || params.id !== decodedToken.id) {
            allowed = false
          }
          break
        case 'PUT':
          if (body.id !== decodedToken.id || body.role > 0) {
            allowed = false
          }
          break
        case 'DELETE':
          if (!params.id || decodedToken.id !== params.id) {
            allowed = false
          }
          break
      }
      break
  }

  return allowed
}

function authentication(req, res, next) {
  try {
    const authToken = req.headers['authorization']
    const token = authToken.split(' ')[1]

    jwt.verify(token, secret, function(error, decoded) {
      if (error) {
        console.log(error)
      } else {
        if (isActionAllowed(decoded, req.method, req.params, req.body)) {
          next()
        } else {
          let RestException = {
            Code: '6',
            Message: 'O usuário não está autenticado',
            Status: '403',
            MoreInfo: `${ projectLinks.errors }/6`
          }

          res.status(parseInt(RestException.Status))
          res.json({ RestException })
        }
      }
    })
  } catch (error) {
    console.log(error)
  }
}

module.exports = authentication