const jwt = require('jsonwebtoken')

const secret = 'k372gkhcfmhg6l9nj19i51ng'

const projectLinks = {
  errors: 'https://projetohotelparaiso.dev/docs/erros'
}

function authentication(req, res, next) {
  try {
    const authToken = req.headers['authorization']
    const token = authToken.split(' ')[1]

    jwt.verify(token, secret, function(error, decoded) {
      if (error) {
        console.log(error)
      } else {

        if (decoded.role == 0) {

          // Para caso de atualização de informações.
          if (req.method === 'PUT') {

            // Verifica se é o próprio usuário que está atualizando suas informações.
            if (decoded.id === req.body.id) {

              // Verifica se o mesmo está tentando modificar a sua Função (não pode).
              if (req.body.role >= 0) {
                let RestException = {
                  Code: '6',
                  Message: 'O usuário não está autenticado',
                  Status: '403',
                  MoreInfo: `${ projectLinks.errors }/6`
                }
                res.status(parseInt(RestException.Status))
                res.json({ RestException })
              } else {
                next()
              }
            } else {
              next()
            }
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
          
        } else {
          next()
        }
      }
    })
  } catch (error) {
    console.log(error)
  }
}

module.exports = authentication