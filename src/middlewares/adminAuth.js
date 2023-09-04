const jwt = require('jsonwebtoken')

const secret = 'k372gkhcfmhg6l9nj19i51ng'

const projectLinks = {
  errors: 'https://projetohotelparaiso.dev/docs/erros'
}

function adminAuth(req, res, next) {
  const authToken = req.headers['authorization']

  if (authToken) {
    
  } else {

    // Verifica se um CLIENTE COMUM que está tentando alterar a Função.
    if (req.body.role) {
      let RestException = {
        Code: '5',
        Message: 'Você não tem autorização para alterar o campo de Funções',
        Status: '401',
        MoreInfo: `${ projectLinks.errors }/5`
      }
      res.status(parseInt(RestException.Status))
      res.json({ RestException })
    } else {
      next()
    }
  }
}

module.exports = adminAuth