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

      // Teste para o campo Data de Nascimento
      let birthDate = userController.analyzeBirthDate('1985-06-09')
      expect(birthDate).toEqual('')

      // Teste para o campo de Senha
      let password = userController.isValidPassword('@TobiaS&591022@')
      expect(password).toEqual(true)

      // Teste para o campo de Número do Telefone
      let phoneNumber = userController.isValidPhoneNumber('5599984752352')
      expect(phoneNumber).toEqual(true)
    } catch (error) {
      fail(error)
    }
  })
})