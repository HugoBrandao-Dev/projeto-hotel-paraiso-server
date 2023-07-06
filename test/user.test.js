const app = require('../src/app')
const supertest = require('supertest')

// Controllers
const UserController = require('../src/controllers/UserController')

const request = supertest(app)

describe("Suite de testes das rotas User.", function() {
  test("Devem retornar TRUE para os valores informados.", async function() {
    try {
      const userController = UserController

      // Teste para o campo Nome
      let name = userController.isValidName('Tobias de Oliveira')
      expect(name).toEqual(true)

      // Teste para o campo Email
      let email = userController.isValidEmail('tobias@gmail.com')
      expect(email).toEqual(true)
    } catch (error) {
      fail(error)
    }
  })
})