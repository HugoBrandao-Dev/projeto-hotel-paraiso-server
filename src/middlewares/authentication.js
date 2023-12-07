const isActionAllowed = require('../tools/accessLevel')
const Generator = require('../tools/Generator')

function authentication(req, res, next) {
  try {
    isActionAllowed(req.headers, req.path, req.method, req.params, req.body)
      .then(function(isAllowed) {
        if (isAllowed) {
          next()
        } else {
          let errors = [{
            hasError: { value: true, type: 6, error: 'O usuário não está autenticado' }
          }]
          const RestException = Generator.genRestException(errors, false)
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