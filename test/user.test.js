const app = require('../src/app')
const supertest = require('supertest')

// Controllers
const UserController = require('../src/controllers/UserController')

const request = supertest(app)

describe("Suite de testes das rotas User.", function() {
  test("Devem retornar TRUE para os valores informados.", async function() {
    try {
      const userController = UserController

      // Teste para o campo Nome (nome completo).
      let name = userController.analyzeUserName('Tobias de Oliveira')
      expect(name.hasError.value).toEqual(false)

      // Teste para o campo Email
      let email = userController.analyzeUserEmail('tobias@gmail.com')
      expect(email.hasError.value).toEqual(false)

      // Teste para o campo Data de Nascimento
      let birthDate = userController.analyzeBirthDate('1985-06-09')
      expect(birthDate.field).toEqual('iptBirthDate')
      expect(birthDate.hasError.value).toEqual(false)
      expect(birthDate.hasError.error).toEqual('')

      // Teste para o campo de Senha
      let password = userController.analyzePassword('@TobiaS&591022@')
      expect(password.field).toEqual('iptPassword')
      expect(password.hasError.value).toEqual(false)
      expect(password.hasError.error).toEqual('')

      // Teste para o campo de Número do Telefone
      let phoneNumber = userController.analyzePhoneNumber('5599984752352')
      expect(phoneNumber.field).toEqual('iptPhoneNumber')
      expect(phoneNumber.hasError.value).toEqual(false)
      expect(phoneNumber.hasError.error).toEqual('')

      // Teste para o campo de País
      let country = userController.analyzeCountry('BR')
      expect(country.field).toEqual('iptCountry')
      expect(country.hasError.value).toEqual(false)
      expect(country.hasError.error).toEqual('')

      // Teste para o campo de Estado
      let state = await userController.analyzeState('BR', 'SP')
      expect(state.field).toEqual('iptState')
      expect(state.hasError.value).toEqual(false)
      expect(state.hasError.error).toEqual('')

      // Teste para o campo de Cidade
      let city = await userController.analyzeCity('BR', 'SP', 'São Paulo')
      expect(city.field).toEqual('iptCity')
      expect(city.hasError.value).toEqual(false)
      expect(city.hasError.error).toEqual('')

      // Teste para o campo de CPF
      let cpf = userController.analyzeCPF('22222222222')
      expect(cpf.field).toEqual('iptCPF')
      expect(cpf.hasError.value).toEqual(false)
      expect(cpf.hasError.error).toEqual('')

      // Teste para o campo de Número de Passaporte
      let passportNumber = userController.analyzePassportNumber('US', '431276122')
      expect(passportNumber.field).toEqual('iptPassportNumber')
      expect(passportNumber.hasError.value).toEqual(false)
      expect(passportNumber.hasError.error).toEqual('')

      // Teste para o campo de CEP
      let cep = await userController.analyzeCEP('01001000')
      expect(cep.field).toEqual('iptCEP')
      expect(cep.hasError.value).toEqual(false)
      expect(cep.hasError.error).toEqual('')

      // Teste para o campo de Bairro
      let neighborhood = userController.analyzeNeighborhood('Sé')
      expect(neighborhood.field).toEqual('iptNeighborhood')
      expect(neighborhood.hasError.value).toEqual(false)
      expect(neighborhood.hasError.error).toEqual('')

      // Teste para o campo de Rua/Avenida
      let road = userController.analyzeRoad('Praça da Sé')
      expect(road.field).toEqual('iptRoad')
      expect(road.hasError.value).toEqual(false)
      expect(road.hasError.error).toEqual('')

      // Teste para o campo de Número da Casa
      let number = userController.isValidNumber('15006')

      // Teste para o campo de Informações Adicinais
      let information = userController.isValidAddInformation(`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent sed diam purus. Nulla at imperdiet ante. Vivamus dapibus et nisi eget euismod. Pellentesque lectus nibh, fringilla ut tellus id, sollicitudin auctor diam. In lacinia turpis vel nulla eleifend, nec efficitur lorem mollis. Mauris auctor velit arcu, ac pellentesque leo consequat nec. Donec euismod tristique erat, at dignissim erat. Vivamus luctus tempor metus, nec finibus massa pulvinar ut. Nulla rutrum mauris sit amet turpis dignissim, non tempor ipsum ultrices.

Maecenas ac ornare urna, ut eleifend neque. Donec augue dolor, tincidunt id tincidunt eget, accumsan vitae dui. Sed porttitor vel metus nec feugiat. Sed id turpis sed nisl condimentum pellentesque. Nulla feugiat non est ac faucibus. Nam rutrum diam dui, nec semper diam convallis non. Curabitur a sagittis tortor, at porttitor lectus. Nulla mollis, velit et volutpat molestie, eros felis hendrerit odio, at sodales velit lacus eget lorem. Curabitur nec lacinia ante. Donec vel nisi ante.`)
      expect(number).toEqual(true)
    } catch (error) {
      fail(error)
    }
  })

  test('Devem retornar FALSE para os valores informados.', async function() {
    const userController = UserController

    // Testes para o campo Data de Nascimento
    let birthDate = userController.analyzeBirthDate('')
    expect(birthDate.field).toEqual('iptBirthDate')
    expect(birthDate.hasError.value).toEqual(true)
    expect(birthDate.hasError.error).toBe('O campo Data de Nascimento é obrigatório.')

    let birthDateUnder18 = userController.analyzeBirthDate('2010-06-09')
    expect(birthDateUnder18.field).toEqual('iptBirthDate')
    expect(birthDateUnder18.hasError.value).toEqual(true)
    expect(birthDateUnder18.hasError.error).toBe('Somente usuários com mais de 18 anos podem se cadastrar.')

    // Testes para o campo de Senha
    let password = userController.analyzePassword('')
    expect(password.field).toEqual('iptPassword')
    expect(password.hasError.value).toEqual(true)
    expect(password.hasError.error).toBe('O campo de Senha é obrigatório.')

    let passwordTooWeak = userController.analyzePassword('@tobias&591022@')
    expect(passwordTooWeak.field).toEqual('iptPassword')
    expect(passwordTooWeak.hasError.value).toEqual(true)
    expect(passwordTooWeak.hasError.error).toBe('A senha é muito fraca.')
  })
})