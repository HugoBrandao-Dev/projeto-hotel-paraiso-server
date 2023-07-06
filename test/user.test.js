const app = require('../src/app')
const supertest = require('supertest')

// Controllers
const UserController = require('../src/controllers/UserController')

const request = supertest(app)

describe("Suite de testes das rotas User.", function() {
  test("Devem retorar TRUE para os valores informados.", async function() {
    try {
      const userController = UserController

      // Teste para o campo Nome
      let name = userController.isValidName('Tobias de Oliveira')
      expect(name).toEqual(true)
    } catch (error) {
      fail(error)
    }
  })
})