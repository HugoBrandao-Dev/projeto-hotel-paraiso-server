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
      expect(name.field).toBe('iptName')
      expect(name.hasError.value).toEqual(false)
      expect(name.hasError.error).toEqual('')

      // Teste para o campo Email
      let email = userController.analyzeUserEmail('tobias@gmail.com')
      expect(email.field).toBe('iptEmail')
      expect(email.hasError.value).toEqual(false)
      expect(email.hasError.error).toEqual('')

      // Teste para o campo Data de Nascimento
      let birthDate = userController.analyzeUserBirthDate('1985-06-09')
      expect(birthDate.field).toBe('iptBirthDate')
      expect(birthDate.hasError.value).toEqual(false)
      expect(birthDate.hasError.error).toEqual('')

      // Teste para o campo de Senha
      let password = userController.analyzeUserPassword('@TobiaS&591022@')
      expect(password.field).toBe('iptPassword')
      expect(password.hasError.value).toEqual(false)
      expect(password.hasError.error).toEqual('')

      // Teste para o campo de Número do Telefone
      let phoneNumber = userController.analyzeUserPhoneNumber('5599984752352')
      expect(phoneNumber.field).toBe('iptPhoneNumber')
      expect(phoneNumber.hasError.value).toEqual(false)
      expect(phoneNumber.hasError.error).toEqual('')

      // Teste para o campo de País
      let country = userController.analyzeUserCountry('BR')
      expect(country.field).toBe('iptCountry')
      expect(country.hasError.value).toEqual(false)
      expect(country.hasError.error).toEqual('')

      // Teste para o campo de Estado
      let state = await userController.analyzeUserState('BR', 'SP')
      expect(state.field).toBe('iptState')
      expect(state.hasError.value).toEqual(false)
      expect(state.hasError.error).toEqual('')

      // Teste para o campo de Cidade
      let city = await userController.analyzeUserCity('BR', 'SP', 'São Paulo')
      expect(city.field).toBe('iptCity')
      expect(city.hasError.value).toEqual(false)
      expect(city.hasError.error).toEqual('')

      // Teste para o campo de CPF
      let cpf = userController.analyzeUserCPF('22222222222')
      expect(cpf.field).toBe('iptCPF')
      expect(cpf.hasError.value).toEqual(false)
      expect(cpf.hasError.error).toEqual('')

      // Teste para o campo de Número de Passaporte
      let passportNumber = userController.analyzeUserPassportNumber('US', '431276122')
      expect(passportNumber.field).toBe('iptPassportNumber')
      expect(passportNumber.hasError.value).toEqual(false)
      expect(passportNumber.hasError.error).toEqual('')

      // Teste para o campo de CEP
      let cep = await userController.analyzeUserCEP('01001000')
      expect(cep.field).toBe('iptCEP')
      expect(cep.hasError.value).toEqual(false)
      expect(cep.hasError.error).toEqual('')

      // Teste para o campo de Bairro
      let neighborhood = userController.analyzeUserNeighborhood('Sé')
      expect(neighborhood.field).toBe('iptNeighborhood')
      expect(neighborhood.hasError.value).toEqual(false)
      expect(neighborhood.hasError.error).toEqual('')

      // Teste para o campo de Rua/Avenida
      let road = userController.analyzeUserRoad('Praça da Sé')
      expect(road.field).toBe('iptRoad')
      expect(road.hasError.value).toEqual(false)
      expect(road.hasError.error).toEqual('')

      // Teste para o campo de Número da Casa
      let number = userController.analyzeUserHouseNumber('15006')
      expect(number.field).toBe('iptHouseNumber')
      expect(number.hasError.value).toEqual(false)
      expect(number.hasError.error).toEqual('')

      // Teste para o campo de Informações Adicinais
      let information = userController.analyzeUserAdditionalInformation(`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent sed diam purus. Nulla at imperdiet ante. Vivamus dapibus et nisi eget euismod. Pellentesque lectus nibh, fringilla ut tellus id, sollicitudin auctor diam. In lacinia turpis vel nulla eleifend, nec efficitur lorem mollis. Mauris auctor velit arcu, ac pellentesque leo consequat nec. Donec euismod tristique erat, at dignissim erat. Vivamus luctus tempor metus, nec finibus massa pulvinar ut. Nulla rutrum mauris sit amet turpis dignissim, non tempor ipsum ultrices.

Maecenas ac ornare urna, ut eleifend neque. Donec augue dolor, tincidunt id tincidunt eget, accumsan vitae dui. Sed porttitor vel metus nec feugiat. Sed id turpis sed nisl condimentum pellentesque. Nulla feugiat non est ac faucibus. Nam rutrum diam dui, nec semper diam convallis non. Curabitur a sagittis tortor, at porttitor lectus. Nulla mollis, velit et volutpat molestie, eros felis hendrerit odio, at sodales velit lacus eget lorem. Curabitur nec lacinia ante. Donec vel nisi ante.`)
      expect(information.field).toBe('iptAdditionalInformation')
      expect(information.hasError.value).toEqual(false)
      expect(information.hasError.error).toEqual('')
    } catch (error) {
      fail(error)
    }
  })

  test('Devem retornar FALSE para os valores informados aos campos obrigatórios.', async function() {
    const userController = UserController

    // Testes para o campo de Nome
    let nameNotFilled = userController.analyzeUserName('')
    expect(nameNotFilled.field).toBe('iptName')
    expect(nameNotFilled.hasError.value).toEqual(true)
    expect(nameNotFilled.hasError.error).toBe('O campo Nome é obrigatório.')

    let nameInvalid = userController.analyzeUserName('Tobias de 0liveira')
    expect(nameInvalid.field).toBe('iptName')
    expect(nameInvalid.hasError.value).toEqual(true)
    expect(nameInvalid.hasError.error).toBe('O campo Nome possui caracteres inválidos.')

    // Testes para o campo de Email
    let emailNotFilled = userController.analyzeUserEmail('')
    expect(emailNotFilled.field).toBe('iptEmail')
    expect(emailNotFilled.hasError.value).toEqual(true)
    expect(emailNotFilled.hasError.error).toBe('O campo Email é obrigatório.')

    let emailInvalid = userController.analyzeUserEmail('tob;ias@gmail.com')
    expect(emailInvalid.field).toBe('iptEmail')
    expect(emailInvalid.hasError.value).toEqual(true)
    expect(emailInvalid.hasError.error).toBe('O campo Email possui caracteres inválidos.')

    // Testes para o campo Data de Nascimento
    let birthDate = userController.analyzeUserBirthDate('')
    expect(birthDate.field).toBe('iptBirthDate')
    expect(birthDate.hasError.value).toEqual(true)
    expect(birthDate.hasError.error).toBe('O campo Data de Nascimento é obrigatório.')

    let birthDateUnder18 = userController.analyzeUserBirthDate('2010-06-09')
    expect(birthDateUnder18.field).toBe('iptBirthDate')
    expect(birthDateUnder18.hasError.value).toEqual(true)
    expect(birthDateUnder18.hasError.error).toBe('Somente usuários com mais de 18 anos podem se cadastrar.')

    // Testes para o campo de Senha
    let password = userController.analyzeUserPassword('')
    expect(password.field).toBe('iptPassword')
    expect(password.hasError.value).toEqual(true)
    expect(password.hasError.error).toBe('O campo de Senha é obrigatório.')

    let passwordTooWeak = userController.analyzeUserPassword('@tobias&591022@')
    expect(passwordTooWeak.field).toBe('iptPassword')
    expect(passwordTooWeak.hasError.value).toEqual(true)
    expect(passwordTooWeak.hasError.error).toBe('A senha é muito fraca.')

    // Testes para o campo de Estado
    let stateWithoutCountry = await userController.analyzeUserState('', 'VA')
    expect(stateWithoutCountry.field).toBe('iptState')
    expect(stateWithoutCountry.hasError.value).toEqual(true)
    expect(stateWithoutCountry.hasError.error).toBe('É necessário informar o seu País de Nascimento.')

    let stateNotFilled = await userController.analyzeUserState('US', '')
    expect(stateNotFilled.field).toBe('iptState')
    expect(stateNotFilled.hasError.value).toEqual(true)
    expect(stateNotFilled.hasError.error).toBe('O campo de Estado de Nascimento é obrigatório.')

    let stateInvalid = await userController.analyzeUserState('US', 'SP')
    expect(stateInvalid.field).toBe('iptState')
    expect(stateInvalid.hasError.value).toEqual(true)
    expect(stateInvalid.hasError.error).toBe('Estado inválido.')

    // Testes para o campo de Cidade
    let cityWithoutCountry = await userController.analyzeUserCity('', 'SP', 'São Paulo')
    expect(cityWithoutCountry.field).toBe('iptCity')
    expect(cityWithoutCountry.hasError.value).toEqual(true)
    expect(cityWithoutCountry.hasError.error).toBe('É necessário informar o seu País de Nascimento.')

    let cityWithoutState = await userController.analyzeUserCity('BR', '', 'São Paulo')
    expect(cityWithoutState.field).toBe('iptCity')
    expect(cityWithoutState.hasError.value).toEqual(true)
    expect(cityWithoutState.hasError.error).toBe('É necessário informar o seu Estado de Nascimento.')

    let cityNotFilled = await userController.analyzeUserCity('BR', 'SP', '')
    expect(cityNotFilled.field).toBe('iptCity')
    expect(cityNotFilled.hasError.value).toEqual(true)
    expect(cityNotFilled.hasError.error).toBe('O campo de Cidade de Nascimento é obrigatório.')

    let cityInvalid = await userController.analyzeUserCity('BR', 'SP', 'Rio de Janeiro')
    expect(cityInvalid.field).toBe('iptCity')
    expect(cityInvalid.hasError.value).toEqual(true)
    expect(cityInvalid.hasError.error).toBe('Cidade inválida.')
  })
})