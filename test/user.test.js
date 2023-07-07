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

      // Teste para o campo de País
      let country = userController.isValidCountry('BR')
      expect(country).toEqual(true)

      // Teste para o campo de Estado
      let state = await userController.isValidState('BR', 'SP')
      expect(state).toEqual(true)

      // Teste para o campo de Cidade
      let city = await userController.isValidCity('BR', 'SP', 'São Paulo')
      expect(city).toEqual(true)

      // Teste para o campo de CEP
      let cep = await userController.isValidCEP('01001000')
      expect(cep).toEqual(true)

      // Teste para o campo de CPF
      let cpf = userController.isValidCPF('22222222222')
      expect(cpf).toEqual(true)

      // Teste para o campo de Número de Passaporte
      let passportNumber = userController.isValidPassportNumber('US', '431276122')
      expect(passportNumber).toEqual(true)

      // Teste para o campo de Bairro
      let neighborhood = userController.isValidNeighborhood('Sé')
      expect(neighborhood).toEqual(true)

      // Teste para o campo de Rua/Avenida
      let road = userController.isValidRoad('Praça da Sé')
      expect(road).toEqual(true)

      // Teste para o campo de Número da Casa
      let number = userController.isValidNumber('15006')
      expect(number).toEqual(true)
    } catch (error) {
      fail(error)
    }
  })
})