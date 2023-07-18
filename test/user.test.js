const app = require('../src/app')
const supertest = require('supertest')

const request = supertest(app)

describe("Suite de testes das rotas User.", function() {

  /* ################## CREATE ################## */

  describe("Testes de SUCESSO na inserção de dados.", function() {
    test("POST - Deve retornar 201, para inserção dos dados obrigatórios para brasileiros.", function() {
      return request.post('/users').send({
        name: "Tobias de Oliveira",
        email: "tobias@gmail.com",
        password: "@TobiaS&591022@",
        phoneCode: "55",
        phoneNumber: "11984752352",
        birthDate: "1985-06-09",
        country: "BR",
        state: "SP",
        city: "São Paulo",
        cpf: "22222222222",
      })
      .then(function(response) {
        expect(response.statusCode).toEqual(201)
      })
      .catch(function(error) {
        fail(error)
      })
    })

    test("POST - Deve retornar 201, para inserção de dados obrigatórios + opcionais para brasileiros.", function() {
      return request.post('/users').send({
        name: "Tobias de Oliveira",
        email: "tobias@gmail.com",
        password: "@TobiaS&591022@",
        phoneCode: "55",
        phoneNumber: "11999847523",
        birthDate: "1985-06-09",
        country: "BR",
        state: "SP",
        city: "São Paulo",
        cpf: "22222222222",
        cep: "08391700",
        neighborhood: "Jardim Nova São Paulo",
        road: "Rua Nina Simone",
        house_number: "2000",
        information: "Nunc eleifend ante elit, a ornare risus gravida quis. Suspendisse venenatis felis ac tellus rutrum convallis. Integer tincidunt vehicula turpis, vel semper arcu mollis a. Proin auctor, ipsum ut finibus fringilla, orci sapien mattis mauris, et congue sapien metus vel augue. Nullam id ullamcorper neque. Integer dictum pharetra sapien non congue. Fusce libero elit, eleifend vitae viverra a, viverra id purus. Suspendisse sed nulla mauris. Sed venenatis tortor id nisi dictum tristique."
      })
      .then(function(response) {
        expect(response.statusCode).toEqual(201)
      })
      .catch(function(error) {
        fail(error)
      })
    })

    test("POST - Deve retornar 201, para inserção dos dados obrigatórios de estrangeiros.", function() {
      return request.post('/users').send({
        name: "Dinorá de Oliveira",
        email: "dinora@hotmail.com",
        password: "@DinorA&3659792@",
        phoneCode: "1",
        phoneNumber: "2129981212",
        birthDate: "1999-01-09",
        country: "US",
        state: "NY",
        city: "New York",
        passportNumber: "C00001549",
      })
      .then(function(response) {
        expect(response.statusCode).toEqual(201)
      })
      .catch(function(error) {
        fail(error)
      })
    })

    test("POST - Deve retornar 201, para inserção dos dados obrigatórios + opcionais de estrangeiros.", function() {
      return request.post('/users').send({
        name: "Dinorá de Oliveira",
        email: "dinora@hotmail.com",
        password: "@DinorA&3659792@",
        phoneCode: "1",
        phoneNumber: "2129981212",
        birthDate: "1998-04-09",
        country: "US",
        state: "NY",
        city: "New York",
        passportNumber: "C00001549",
        neighborhood: "Jardim Nova São Paulo",
        road: "Rua Nina Simone",
        house_number: "2000",
        information: "Nunc eleifend ante elit, a ornare risus gravida quis. Suspendisse venenatis felis ac tellus rutrum convallis. Integer tincidunt vehicula turpis, vel semper arcu mollis a. Proin auctor, ipsum ut finibus fringilla, orci sapien mattis mauris, et congue sapien metus vel augue. Nullam id ullamcorper neque. Integer dictum pharetra sapien non congue. Fusce libero elit, eleifend vitae viverra a, viverra id purus. Suspendisse sed nulla mauris. Sed venenatis tortor id nisi dictum tristique."
      })
      .then(function(response) {
        expect(response.statusCode).toEqual(201)
      })
      .catch(function(error) {
        fail(error)
      })
    })
  })

  /* ################## READ ################## */

  describe("Testes de SUCESSO na leitura de dados.", function() {
    test("GET - Deve retornar 200 para busca das informações obrigatórias + opcionais de um usuário Brasileiro.", function() {
      return request.get('/users/5da9ea674234635bdff45c02')
      .then(response => {
        let { 
          name,
          email,
          birthDate,
          phoneCode,
          phoneNumber,
          country,
          cep,
          state,
          city,
          cpf,
          passportNumber,
          neighborhood,
          road,
          house_number,
          information
        } = response.body

        expect(response.statusCode).toEqual(200)

        // Nome
        expect(name).toBeDefined()
        expect(name).toBe("Jeremias de Oliveira")

        // Email
        expect(email).toBeDefined()
        expect(email).toBe("jere_oliveira@yahoo.com")

        // Data de nascimento
        expect(birthDate).toBeDefined()
        expect(birthDate).toBe("1999-08-03")

        // CEP do cliente
        expect(cep).toBeDefined()
        expect(cep).toBe("08391700")

        // Código do país do telefone de contato
        expect(phoneCode).toBeDefined()
        expect(phoneCode).toBe("55")

        // Número de contato do cliente
        expect(phoneNumber).toBeDefined()
        expect(phoneNumber).toBe("11984755654")

        // País de nascimento do cliente
        expect(country).toBeDefined()
        expect(country).toBe("BR")

        // Estado de nascimento do cliente
        expect(state).toBeDefined()
        expect(state).toBe("SP")

        // Cidade de nascimento do cliente
        expect(city).toBeDefined()
        expect(city).toBe("São Paulo")

        // CPF do cliente
        expect(cpf).toBeDefined()
        expect(cpf).toBe("11111111111")

        // Número do Passaporte é vazio, porque o cliente é Brasileiro.
        expect(passportNumber).toBe("")
        
        // Nome do bairro onde o cliente nasceu.
        expect(neighborhood).toBeDefined()
        expect(neighborhood).toBe("Jardim Nova São Paulo")

        // Nome da rua onde o cliente nasceu.
        expect(road).toBeDefined()
        expect(road).toBe("Rua Nina Simone")

        // Número da casa onde o cliente nasceu.
        expect(house_number).toBeDefined()
        expect(house_number).toBe("2000")

        // Infomações adicionais do cliente.
        expect(information).toBeDefined()
        expect(information).toBe("Nunc eleifend ante elit, a ornare risus gravida quis. Suspendisse venenatis felis ac tellus rutrum convallis. Integer tincidunt vehicula turpis, vel semper arcu mollis a. Proin auctor, ipsum ut finibus fringilla, orci sapien mattis mauris, et congue sapien metus vel augue. Nullam id ullamcorper neque. Integer dictum pharetra sapien non congue. Fusce libero elit, eleifend vitae viverra a, viverra id purus. Suspendisse sed nulla mauris. Sed venenatis tortor id nisi dictum tristique.")
      })
      .catch(error => {
        fail(error)
      })
    })

    test("GET - Deve retornar 200 para busca das informações obrigatórias de um usuário Brasileiro.", function() {
      return request.get("/users/507f1f77bcf86cd799439011")
      .then(function(response) {
        let {
          name,
          email,
          phoneCode,
          phoneNumber,
          birthDate,
          country,
          state,
          cep,
          city,
          cpf,
          passportNumber,
          neighborhood,
          road,
          house_number,
          information
        } = response.body

        // Nome
        expect(name).toBeDefined()
        expect(name).toBe("Tobias de Oliveira")

        // Email
        expect(email).toBeDefined()
        expect(email).toBe("tobias@gmail.com")

        // Data de nascimento
        expect(birthDate).toBeDefined()
        expect(birthDate).toBe("1995-08-03")

        // Código do país do telefone de contato
        expect(phoneCode).toBeDefined()
        expect(phoneCode).toBe("21")

        // Número de contato do cliente
        expect(phoneNumber).toBeDefined()
        expect(phoneNumber).toBe("994755654")

        // País de nascimento do cliente
        expect(country).toBeDefined()
        expect(country).toBe("BR")

        // CEP do cliente
        expect(cep).toBeDefined()
        expect(cep).toBe("21051990")

        // Estado de nascimento do cliente
        expect(state).toBeDefined()
        expect(state).toBe("RJ")

        // Cidade de nascimento do cliente
        expect(city).toBeDefined()
        expect(city).toBe("Rio de Janeiro")

        // CPF do cliente
        expect(cpf).toBeDefined()
        expect(cpf).toBe("22222222222")

        // Dado condicional
        expect(passportNumber).toBeUndefined()

        // Dados opcionais
        expect(neighborhood).toBeUndefined()
        expect(road).toBeUndefined()
        expect(house_number).toBeUndefined()
        expect(information).toBeUndefined()
      })
      .catch(function(error) {
        fail(error)
      })
    })

    test("GET - Deve retornar 200 para busca das informações obrigatórias + opcionais de um usuário estrangeiro.", function() {
      return request.get('/users/507f191e810c19729de860ea')
      .then(function(response) {
        let { 
          name,
          email,
          birthDate,
          phoneCode,
          phoneNumber,
          country,
          cep,
          state,
          city,
          cpf,
          passportNumber,
          neighborhood,
          road,
          house_number,
          information
        } = response.body

        expect(response.statusCode).toEqual(200)

        // Nome
        expect(name).toBeDefined()
        expect(name).toBe("John Smith")

        // Email
        expect(email).toBeDefined()
        expect(email).toBe("john_sm@hotmail.com")

        // Data de nascimento
        expect(birthDate).toBeDefined()
        expect(birthDate).toBe("1970-06-11")

        // Código do país do telefone de contato
        expect(phoneCode).toBeDefined()
        expect(phoneCode).toBe("1")

        // Número de contato do cliente
        expect(phoneNumber).toBeDefined()
        expect(phoneNumber).toBe("2129981212")

        // País de nascimento do cliente
        expect(country).toBeDefined()
        expect(country).toBe("US")

        // Estado de nascimento do cliente
        expect(state).toBeDefined()
        expect(state).toBe("NY")

        // Cidade de nascimento do cliente
        expect(city).toBeDefined()
        expect(city).toBe("New York")

        // Número do Passaporte é vazio, porque o cliente é Brasileiro.
        expect(passportNumber).toBeDefined()
        expect(passportNumber).toBe("C00001549")
        
        // Nome do bairro onde o cliente nasceu.
        expect(neighborhood).toBeDefined()
        expect(neighborhood).toBe("2 Broadway")

        // Nome da rua onde o cliente nasceu.
        expect(road).toBeDefined()
        expect(road).toBe("13th Street")

        // Número da casa onde o cliente nasceu.
        expect(house_number).toBeDefined()
        expect(house_number).toBe("10310")

        // Infomações adicionais do cliente.
        expect(information).toBeDefined()
        expect(information).toBe("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque viverra congue elit non elementum. Praesent fringilla lectus interdum ipsum tempor, ut commodo urna blandit. Nunc sagittis vestibulum luctus. Duis eget arcu nisi. Donec lobortis tellus at porttitor mattis. In ornare ornare posuere. Nunc eu aliquam metus, in sodales tellus. Sed eu mi mi. Nullam varius sed massa interdum vulputate. Morbi sodales justo tellus, quis luctus lorem lacinia eu. Integer efficitur eu ante ac tempus. Phasellus tincidunt fermentum metus ac dignissim.")

        // Campos que podem ser undefined para estrangeiros
        expect(cpf).toBeUndefined()
        expect(cep).toBeUndefined()
      })
      .catch(function(error) {
        fail(error)
      })
    })

    test("GET - Deve retornar 200 para busca de informações obrigatórias de um usuario estrangeiro.", function() {
      return request.get('/users/600f191e810c19829de900ea')
      .then(function(response) {
        let {
          name,
          email,
          birthDate,
          phoneCode,
          phoneNumber,
          country,
          state,
          city,
          cpf,
          passportNumber,
          neighborhood,
          road,
          house_number,
          information
        } = response.body

        expect(response.statusCode).toEqual(200)

        // Nome do cliente
        expect(name).toBeDefined()
        expect(name).toBe("Michael Ronald")

        // Email do cliente
        expect(email).toBeDefined()
        expect(email).toBe("mi_ronald@gmail.com")

        // Data de nascimento do cliente
        expect(birthDate).toBeDefined()
        expect(birthDate).toBe("1979-11-11")

        // Código do telefone do cliente
        expect(phoneCode).toBeDefined()
        expect(phoneCode).toBe("1")

        // Número do telefone do cliente
        expect(phoneNumber).toBeDefined()
        expect(phoneNumber).toBe("8049981212")

        // País do cliente
        expect(country).toBeDefined()
        expect(country).toBe("US")

        // Estado do cliente
        expect(state).toBeDefined()
        expect(state).toBe("VA")

        // Cidade do cliente
        expect(city).toBeDefined()
        expect(city).toBe("Richmond")

        // Número do passaporte do cliente
        expect(passportNumber).toBeDefined()
        expect(passportNumber).toBe("431276122")

        // Dado condicional
        expect(cpf).toBeUndefined()

        // Dados opcionais
        expect(neighborhood).toBeUndefined()
        expect(road).toBeUndefined()
        expect(house_number).toBeUndefined()
        expect(information).toBeUndefined()
      })
      .catch(function(error) {
        fail(error)
      })
    })
  })
  /*
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

    // Testes para o campo de Número de Telefone
    let phoneNumberNotFilled = userController.analyzeUserPhoneNumber('')
    expect(phoneNumberNotFilled.field).toBe('iptPhoneNumber')
    expect(phoneNumberNotFilled.hasError.value).toEqual(true)
    expect(phoneNumberNotFilled.hasError.error).toBe('O campo de Número de Telefone é obrigatório.')

    let phoneInvalid = userController.analyzeUserPhoneNumber('5511a984756545')
    expect(phoneInvalid.field).toBe('iptPhoneNumber')
    expect(phoneInvalid.hasError.value).toEqual(true)
    expect(phoneInvalid.hasError.error).toBe('O telefone é inválido.')

    // Testes para o campo de País de nascimento
    let countryNotFilled = userController.analyzeUserCountry('')
    expect(countryNotFilled.field).toBe('iptCountry')
    expect(countryNotFilled.hasError.value).toEqual(true)
    expect(countryNotFilled.hasError.error).toBe('O campo de País de Nascimento é obrigatório.')

    let countryInvalid = userController.analyzeUserCountry('Brasil') // A API é em inglês ("Brasil" não é aceito).
    expect(countryInvalid.field).toBe('iptCountry')
    expect(countryInvalid.hasError.value).toEqual(true)
    expect(countryInvalid.hasError.error).toBe('País inválido.')

    // Testes para o campo de Estado de nascimento
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

    // Testes para o campo de Cidade de nascimento
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

    // Testes para o campo de CPF
    let cpfNotFilled = userController.analyzeUserCPF('')
    expect(cpfNotFilled.field).toBe('iptCPF')
    expect(cpfNotFilled.hasError.value).toEqual(true)
    expect(cpfNotFilled.hasError.error).toBe('O campo de CPF é obrigatório.')

    let cpfInvalid = userController.analyzeUserCPF('0111111111a')
    expect(cpfInvalid.field).toBe('iptCPF')
    expect(cpfInvalid.hasError.value).toEqual(true)
    expect(cpfInvalid.hasError.error).toBe('O CPF possui caracteres inválidos.')

    let cpfMissingNumbers = userController.analyzeUserCPF('0111111111')
    expect(cpfMissingNumbers.field).toBe('iptCPF')
    expect(cpfMissingNumbers.hasError.value).toEqual(true)
    expect(cpfMissingNumbers.hasError.error).toBe('Faltam digitos no seu CPF.')

    // Testes para o campo de Número do Passporte
    let numberWithoutCountryCode = userController.analyzeUserPassportNumber('', '431276122')
    expect(numberWithoutCountryCode.field).toBe('iptPassportNumber')
    expect(numberWithoutCountryCode.hasError.value).toEqual(true)
    expect(numberWithoutCountryCode.hasError.error).toBe('É necessário informar o seu País de Nascimento.')

    let numberNotFilled = userController.analyzeUserPassportNumber('US', '')
    expect(numberNotFilled.field).toBe('iptPassportNumber')
    expect(numberNotFilled.hasError.value).toEqual(true)
    expect(numberNotFilled.hasError.error).toBe('Este campo é obrigatório.')

    let numberInvalid = userController.analyzeUserPassportNumber('US', '1111A1111')
    expect(numberInvalid.field).toBe('iptPassportNumber')
    expect(numberInvalid.hasError.value).toEqual(true)
    expect(numberInvalid.hasError.error).toBe('Número de passaporte inválido.')
  })
  */
})