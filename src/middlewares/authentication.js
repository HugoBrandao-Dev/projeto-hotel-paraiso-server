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
      case '1':
        switch (upperMethod) {
          case 'POST':
            break
          case 'GET':
            break
          case 'PUT':
            if (body.role > 0) {
              allowed = false
            }
            break
          case 'DELETE':
            // Faz a busca pelo usuário que será deletado
            let idResult = await Analyzer.analyzeID(params.id)
            if (!idResult.hasError.value) {
              let userToBeDeleted = await User.findOne(params.id)
              if (userToBeDeleted.role > 0) {
                allowed = false
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
            if (body.role > 1) {
              allowed = false
            }
            break
          case 'DELETE':
            break
        }
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
          .then(function(responseAllowed) {
            if (responseAllowed) {
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

          })
      }
    })
  } catch (error) {
    console.log(error)
  }
}

module.exports = authentication