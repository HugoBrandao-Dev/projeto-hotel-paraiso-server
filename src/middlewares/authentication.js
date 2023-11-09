const isActionAllowed = require('../tools/accessLevel')

const projectLinks = {
  errors: 'https://projetohotelparaiso.dev/docs/erros'
}

function authentication(req, res, next) {
  try {
    isActionAllowed(req.headers, req.path, req.method, req.params, req.body)
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
  } catch (error) {
    console.log(error)
  }
}

module.exports = authentication