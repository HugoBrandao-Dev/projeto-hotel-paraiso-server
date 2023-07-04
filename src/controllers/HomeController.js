class HomeController {
  async index(req, res) {
    res.sendStatus(200)
  }
}

module.exports = new HomeController()