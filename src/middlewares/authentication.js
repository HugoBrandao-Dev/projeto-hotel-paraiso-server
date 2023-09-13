const jwt = require('jsonwebtoken')

const Analyzer = require('../tools/Analyzer')
const User = require('../models/User')

const secret = 'k372gkhcfmhg6l9nj19i51ng'

const projectLinks = {
  errors: 'https://projetohotelparaiso.dev/docs/erros'
}

// Verifica se a conta tem permissão de realizar uma determinada ação.
async function isActionAllowed(decodedToken, method, params, body) {
  try {
    const upperMethod = method.toUpperCase()
    let allowed = false

    switch (decodedToken.role) {
      case '0':
        switch (upperMethod) {
          case 'POST':
            break
          case 'GET':
            if (params.id && params.id === decodedToken.id) {
              allowed = true
            }
            break
          case 'PUT':
            if (body.id === decodedToken.id) {
              if (!(body.role >= 0)) {
                allowed = true
              }
            }
            break
          case 'DELETE':
            if (params.id && decodedToken.id === params.id) {
              allowed = true
            }
            break
        }
        break
      case '1':
        switch (upperMethod) {
          case 'POST':
            break
          case 'GET':
            break
          case 'PUT':
            if (body.role < 1) {
              allowed = true
            }
            break
          case 'DELETE':
            // Faz a busca pelo usuário que será deletado
            let idResult = await Analyzer.analyzeID(params.id)
            if (!idResult.hasError.value) {
              let userToBeDeleted = await User.findOne(params.id)
              if (userToBeDeleted.role < 1) {
                allowed = true
              }
            }
            break
        }
        break
      case '2':
        switch (upperMethod) {
          case 'POST':
            break
          case 'GET':
            break
          case 'PUT':
            if (body.role <= 1) {
              allowed = false
            }
            break
          case 'DELETE':
            break
        }
        break
      case '4':
        allowed = true
        break
    }

    return allowed
  } catch (error) {
    console.log(error)
  }
}

function authentication(req, res, next) {
  try {
    const authToken = req.headers['authorization']
    const token = authToken.split(' ')[1]

    jwt.verify(token, secret, function(error, decoded) {
      if (error) {
        console.log(error)
      } else {
        isActionAllowed(decoded, req.method, req.params, req.body)
          .then(function(isAllowed) {
            if (isAllowed) {
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
          })
          .catch(function(errorAllowed) {
            console.log(errorAllowed)
          })
      }
    })
  } catch (error) {
    console.log(error)
  }
}

module.exports = authentication