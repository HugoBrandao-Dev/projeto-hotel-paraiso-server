const Token = require('../tools/TokenTools')

class HomeController {
  async index(req, res) {
    res.sendStatus(200)
  }

  // Este método serve para validar o token e também verifica se é de um Cliente.
  async validate(req, res) {
    const token = req.headers['authorization']
    const decodedToken = Token.getDecodedToken(token)
    res.status(200)
    res.json({
      isClient: decodedToken.role == 0
    })
  }
}

module.exports = new HomeController()