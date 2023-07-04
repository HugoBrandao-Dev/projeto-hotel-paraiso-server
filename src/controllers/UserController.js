class UserController {
  async create(req, res) {
    try {

    } catch (error) {
      res.status(500)
      throw new Error(error)
    }
  }
}

module.exports = new UserController()