const Token = require('../tools/TokenTools')
const Generator = require('../tools/Generator')

class HomeController {
  async index(req, res) {
    res.sendStatus(200)
  }

  // Este método serve para validar o token e também verifica se é de um Cliente.
  async validate(req, res) {
    const token = req.headers['authorization']
    const decodedToken = Token.getDecodedToken(token)
    const HATEOAS = Generator.genHATEOAS(decodedToken.id, 'user', 'users')
    res.status(200)
    res.json({
      isClient: decodedToken.role == 0,
      _links: HATEOAS
    })
  }
}

module.exports = new HomeController()