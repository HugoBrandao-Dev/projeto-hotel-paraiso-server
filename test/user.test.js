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
        city: "New York City",
        passportNumber: "100003106",
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
        city: "New York City",
        passportNumber: "100003106",
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

  describe("Testes de REJEIÇÃO na inserção de dados", function() {
    test("POST - Deve retornar 400, pela ausência do nome do User.", function() {
      return request.post('/users').send({
        name: "",
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
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
          expect(response.body.RestException.Message).toBe("O campo Nome é obrigatório")
          expect(response.body.RestException.Status).toBe("400")
          expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
          expect(response.body.RestException.ErrorFields[0].field).toBe('iptName')
          expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('O campo Nome é obrigatório')
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar 400, devido a presença de elementos inválidos do nome do User.", function() {

      // O "O" de "Oliveira", na verdade é um 0 (zero).
      return request.post('/users').send({
        name: "Tobias de 0liveira",
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
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
          expect(response.body.RestException.Message).toBe("O campo Nome possui caracteres inválidos")
          expect(response.body.RestException.Status).toBe("400")
          expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
          expect(response.body.RestException.ErrorFields[0].field).toBe('iptName')
          expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('O campo Nome possui caracteres inválidos')
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar 400, pela ausência do email do User.", function() {
      return request.post('/users').send({
        name: "Tobias de Oliveira",
        email: "",
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
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
          expect(response.body.RestException.Message).toBe("O campo Email é obrigatório")
          expect(response.body.RestException.Status).toBe("400")
          expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
          expect(response.body.RestException.ErrorFields[0].field).toBe('iptEmail')
          expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('O campo Email é obrigatório')
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar 400, devido a presença de elementos inválidos no email do User.", function() {
      return request.post('/users').send({
        name: "Tobias de Oliveira",
        email: "tobias($)@gmail.com",
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
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
          expect(response.body.RestException.Message).toBe("O campo Email possui caracteres inválidos")
          expect(response.body.RestException.Status).toBe("400")
          expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
          expect(response.body.RestException.ErrorFields[0].field).toBe('iptEmail')
          expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('O campo Email possui caracteres inválidos')
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar 400, por passar um email já cadastrado.", function() {
      return request.post('/users').send({
        name: "Tobias de Oliveira",
        email: "tobias@hotmail.com",
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
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
          expect(response.body.RestException.Message).toBe("O Email informado já foi cadastrado anteriormente")
          expect(response.body.RestException.Status).toBe("400")
          expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
          expect(response.body.RestException.ErrorFields[0].field).toBe('iptEmail')
          expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('O Email informado já foi cadastrado anteriormente')
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar 400, pela ausência da data de nascimento do User.", function() {
      return request.post('/users').send({
        name: "Tobias de Oliveira",
        email: "tobias@gmail.com",
        password: "@TobiaS&591022@",
        phoneCode: "55",
        phoneNumber: "11984752352",
        birthDate: "",
        country: "BR",
        state: "SP",
        city: "São Paulo",
        cpf: "22222222222",
      })
        .then(function(response) {
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
          expect(response.body.RestException.Message).toBe("O campo Data de Nascimento é obrigatório")
          expect(response.body.RestException.Status).toBe("400")
          expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
          expect(response.body.RestException.ErrorFields[0].field).toBe('iptBirthDate')
          expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('O campo Data de Nascimento é obrigatório')
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar 400, por ter informado uma data de nascimento inválida.", function() {
      return request.post('/users').send({
        name: "Tobias de Oliveira",
        email: "tobias@gmail.com",
        password: "@TobiaS&591022@",
        phoneCode: "55",
        phoneNumber: "11984752352",
        birthDate: "2+00-02-11",
        country: "BR",
        state: "SP",
        city: "São Paulo",
        cpf: "22222222222",
      })
        .then(function(response) {
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
          expect(response.body.RestException.Message).toBe("O campo de Data de Nascimento é inválido")
          expect(response.body.RestException.Status).toBe("400")
          expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
          expect(response.body.RestException.ErrorFields[0].field).toBe('iptBirthDate')
          expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('O campo de Data de Nascimento é inválido')
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar 400, pela idade do usuário ser menor que 18 anos.", function() {
      return request.post('/users').send({
        name: "Tobias de Oliveira",
        email: "tobias@gmail.com",
        password: "@TobiaS&591022@",
        phoneCode: "55",
        phoneNumber: "11984752352",
        birthDate: "2018-02-11",
        country: "BR",
        state: "SP",
        city: "São Paulo",
        cpf: "22222222222",
      })
        .then(function(response) {
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
          expect(response.body.RestException.Message).toBe("Somente usuários com mais de 18 anos podem se cadastrar")
          expect(response.body.RestException.Status).toBe("400")
          expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
          expect(response.body.RestException.ErrorFields[0].field).toBe('iptBirthDate')
          expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('Somente usuários com mais de 18 anos podem se cadastrar')
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar 400, pela ausência da senha do usuário.", function() {
      return request.post('/users').send({
        name: "Tobias de Oliveira",
        email: "tobias@gmail.com",
        password: "",
        phoneCode: "55",
        phoneNumber: "11984752352",
        birthDate: "2000-02-11",
        country: "BR",
        state: "SP",
        city: "São Paulo",
        cpf: "22222222222",
      })
        .then(function(response) {
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
          expect(response.body.RestException.Message).toBe("O campo de Senha é obrigatório")
          expect(response.body.RestException.Status).toBe("400")
          expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
          expect(response.body.RestException.ErrorFields[0].field).toBe('iptPassword')
          expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de Senha é obrigatório")
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar 400, devido a senha informada ser muito fraca.", function() {
      return request.post('/users').send({
        name: "Tobias de Oliveira",
        email: "tobias@gmail.com",
        password: "@tobias&7qer5464@",
        phoneCode: "55",
        phoneNumber: "11984752352",
        birthDate: "2000-02-11",
        country: "BR",
        state: "SP",
        city: "São Paulo",
        cpf: "22222222222",
      })
        .then(function(response) {
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
          expect(response.body.RestException.Message).toBe("A senha é muito fraca")
          expect(response.body.RestException.Status).toBe("400")
          expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
          expect(response.body.RestException.ErrorFields[0].field).toBe('iptPassword')
          expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("A senha é muito fraca")
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar 400, pela ausência do código do telefone.", function() {
      return request.post('/users').send({
        name: "Tobias de Oliveira",
        email: "tobias@gmail.com",
        password: "@TobiaS&6554987@",
        phoneCode: "",
        phoneNumber: "11984752352",
        birthDate: "2000-02-11",
        country: "BR",
        state: "SP",
        city: "São Paulo",
        cpf: "22222222222",
      })
        .then(function(response) {
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
          expect(response.body.RestException.Message).toBe("O campo de Código de Telefone é obrigatório")
          expect(response.body.RestException.Status).toBe("400")
          expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
          expect(response.body.RestException.ErrorFields[0].field).toBe('iptPhoneCode')
          expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de Código de Telefone é obrigatório")
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar 400, devido ao código de telefone informado ser invalido.", function() {
      return request.post('/users').send({
        name: "Tobias de Oliveira",
        email: "tobias@gmail.com",
        password: "@TobiaS&6554987@",
        phoneCode: "1a",
        phoneNumber: "11984752352",
        birthDate: "2000-02-11",
        country: "BR",
        state: "SP",
        city: "São Paulo",
        cpf: "22222222222",
      })
        .then(function(response) {
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
          expect(response.body.RestException.Message).toBe("O Código de Telefone é inválido")
          expect(response.body.RestException.Status).toBe("400")
          expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
          expect(response.body.RestException.ErrorFields[0].field).toBe('iptPhoneCode')
          expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O Código de Telefone é inválido")
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar 400, pela ausência do telefone do usuario.", function() {
      return request.post('/users').send({
        name: "Tobias de Oliveira",
        email: "tobias@gmail.com",
        password: "@TobiaS&6554987@",
        phoneCode: "55",
        phoneNumber: "",
        birthDate: "2000-02-11",
        country: "BR",
        state: "SP",
        city: "São Paulo",
        cpf: "22222222222",
      })
        .then(function(response) {
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
          expect(response.body.RestException.Message).toBe("O campo de Número de Telefone é obrigatório")
          expect(response.body.RestException.Status).toBe("400")
          expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
          expect(response.body.RestException.ErrorFields[0].field).toBe('iptPhoneNumber')
          expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de Número de Telefone é obrigatório")
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar 400, devido ao número de telefone do usuário ser inválido.", function() {
      return request.post('/users').send({
        name: "Tobias de Oliveira",
        email: "tobias@gmail.com",
        password: "@TobiaS&6554987@",
        phoneCode: "55",
        phoneNumber: "asdf115498653214",
        birthDate: "2000-02-11",
        country: "BR",
        state: "SP",
        city: "São Paulo",
        cpf: "22222222222",
      })
        .then(function(response) {
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
          expect(response.body.RestException.Message).toBe("O telefone é inválido")
          expect(response.body.RestException.Status).toBe("400")
          expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
          expect(response.body.RestException.ErrorFields[0].field).toBe('iptPhoneNumber')
          expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O telefone é inválido")
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar 400, pela ausência do país de nascimento do usuário.", function() {
      return request.post('/users').send({
        name: "Tobias de Oliveira",
        email: "tobias@gmail.com",
        password: "@TobiaS&6554987@",
        phoneCode: "55",
        phoneNumber: "115498653214",
        birthDate: "2000-02-11",
        country: "",
        state: "SP",
        city: "São Paulo",
        cpf: "22222222222",
      })
        .then(function(response) {
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
          expect(response.body.RestException.Message).toBe("O campo de País de Nascimento é obrigatório")
          expect(response.body.RestException.Status).toBe("400")
          expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
          expect(response.body.RestException.ErrorFields[0].field).toBe('iptCountry')
          expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de País de Nascimento é obrigatório")
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar 400, devido ao ISO do pais de nascimento do usuário ser inválido.", function() {
      return request.post('/users').send({
        name: "Tobias de Oliveira",
        email: "tobias@gmail.com",
        password: "@TobiaS&6554987@",
        phoneCode: "55",
        phoneNumber: "115498653214",
        birthDate: "2000-02-11",
        country: "BRA",
        state: "SP",
        city: "São Paulo",
        cpf: "22222222222",
      })
        .then(function(response) {
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
          expect(response.body.RestException.Message).toBe("País inválido")
          expect(response.body.RestException.Status).toBe("400")
          expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
          expect(response.body.RestException.ErrorFields[0].field).toBe('iptCountry')
          expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("País inválido")
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar 400, pela ausência do estado de nascimento do usuário.", function() {
      return request.post('/users').send({
        name: "Tobias de Oliveira",
        email: "tobias@gmail.com",
        password: "@TobiaS&6554987@",
        phoneCode: "55",
        phoneNumber: "115498653214",
        birthDate: "2000-02-11",
        country: "BR",
        state: "",
        city: "São Paulo",
        cpf: "22222222222",
      })
        .then(function(response) {
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
          expect(response.body.RestException.Message).toBe("O campo de Estado de Nascimento é obrigatório")
          expect(response.body.RestException.Status).toBe("400")
          expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
          expect(response.body.RestException.ErrorFields[0].field).toBe('iptState')
          expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de Estado de Nascimento é obrigatório")
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar 400, devido ao nome/sigla do estado de nascimento ser inválido.", function() {
      return request.post('/users').send({
        name: "Tobias de Oliveira",
        email: "tobias@gmail.com",
        password: "@TobiaS&6554987@",
        phoneCode: "55",
        phoneNumber: "115498653214",
        birthDate: "2000-02-11",
        country: "BR",
        state: "NY",
        city: "São Paulo",
        cpf: "22222222222",
      })
        .then(function(response) {
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
          expect(response.body.RestException.Message).toBe("Estado inválido")
          expect(response.body.RestException.Status).toBe("400")
          expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
          expect(response.body.RestException.ErrorFields[0].field).toBe('iptState')
          expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("Estado inválido")
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar 400, pela ausência do nome da cidade de nascimento do usuário.", function() {
      return request.post('/users').send({
        name: "Tobias de Oliveira",
        email: "tobias@gmail.com",
        password: "@TobiaS&6554987@",
        phoneCode: "55",
        phoneNumber: "115498653214",
        birthDate: "2000-02-11",
        country: "BR",
        state: "SP",
        city: "",
        cpf: "22222222222",
      })
        .then(function(response) {
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
          expect(response.body.RestException.Message).toBe("O campo de Cidade de Nascimento é obrigatório")
          expect(response.body.RestException.Status).toBe("400")
          expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
          expect(response.body.RestException.ErrorFields[0].field).toBe('iptCity')
          expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de Cidade de Nascimento é obrigatório")
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar 400, devido ao nome da cidade de nascimento do usuário ser inválido.", function() {
      return request.post('/users').send({
        name: "Tobias de Oliveira",
        email: "tobias@gmail.com",
        password: "@TobiaS&6554987@",
        phoneCode: "55",
        phoneNumber: "115498653214",
        birthDate: "2000-02-11",
        country: "BR",
        state: "SP",
        city: "São Manuel do Oeste",
        cpf: "22222222222",
      })
        .then(function(response) {
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
          expect(response.body.RestException.Message).toBe("Cidade inválida")
          expect(response.body.RestException.Status).toBe("400")
          expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
          expect(response.body.RestException.ErrorFields[0].field).toBe('iptCity')
          expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("Cidade inválida")
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar 400, pela ausência do CPF do usuário nascido no Brasil.", function() {
      return request.post('/users').send({
        name: "Tobias de Oliveira",
        email: "tobias@gmail.com",
        password: "@TobiaS&6554987@",
        phoneCode: "55",
        phoneNumber: "115498653214",
        birthDate: "2000-02-11",
        country: "BR",
        state: "SP",
        city: "São Manuel",
        cpf: "",
      })
        .then(function(response) {
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
          expect(response.body.RestException.Message).toBe("O campo de CPF é obrigatório")
          expect(response.body.RestException.Status).toBe("400")
          expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
          expect(response.body.RestException.ErrorFields[0].field).toBe('iptCPF')
          expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de CPF é obrigatório")
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar 400, devido ao valor do CPF do usuário ser inválido.", function() {
      return request.post('/users').send({
        name: "Tobias de Oliveira",
        email: "tobias@gmail.com",
        password: "@TobiaS&6554987@",
        phoneCode: "55",
        phoneNumber: "115498653214",
        birthDate: "2000-02-11",
        country: "BR",
        state: "SP",
        city: "São Manuel",
        cpf: "2a2a2a2a2a2",
      })
        .then(function(response) {
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
          expect(response.body.RestException.Message).toBe("O CPF possui caracteres inválidos")
          expect(response.body.RestException.Status).toBe("400")
          expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
          expect(response.body.RestException.ErrorFields[0].field).toBe('iptCPF')
          expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O CPF possui caracteres inválidos")
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar 400, devido ao valor do CPF do usuário ser inválido.", function() {
      return request.post('/users').send({
        name: "Tobias de Oliveira",
        email: "tobias@gmail.com",
        password: "@TobiaS&6554987@",
        phoneCode: "55",
        phoneNumber: "115498653214",
        birthDate: "2000-02-11",
        country: "BR",
        state: "SP",
        city: "São Manuel",
        cpf: "222222222",
      })
        .then(function(response) {
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
          expect(response.body.RestException.Message).toBe("Faltam digitos no seu CPF")
          expect(response.body.RestException.Status).toBe("400")
          expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
          expect(response.body.RestException.ErrorFields[0].field).toBe('iptCPF')
          expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("Faltam digitos no seu CPF")
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar 400, devido ao CPF informado já estar sido cadastrado.", function() {
      return request.post('/users').send({
        name: "Tobias de Oliveira",
        email: "tobias@gmail.com",
        password: "@TobiaS&6554987@",
        phoneCode: "55",
        phoneNumber: "115498653214",
        birthDate: "2000-02-11",
        country: "BR",
        state: "SP",
        city: "São Manuel",
        cpf: "33333333333",
      })
        .then(function(response) {
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
          expect(response.body.RestException.Message).toBe("O CPF informado já está cadastrado")
          expect(response.body.RestException.Status).toBe("400")
          expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
          expect(response.body.RestException.ErrorFields[0].field).toBe('iptCPF')
          expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O CPF informado já está cadastrado")
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar 400, devido a ausência do número do passaporte de um usuário estrangeiro.", function() {
      return request.post('/users').send({
        name: "Tobias de Oliveira",
        email: "tobias@gmail.com",
        password: "@TobiaS&6554987@",
        phoneCode: "55",
        phoneNumber: "115498653214",
        birthDate: "2000-02-11",
        country: "US",
        state: "NY",
        city: "New York City",
        passportNumber: "",
      })
        .then(function(response) {
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
          expect(response.body.RestException.Message).toBe("This field is required")
          expect(response.body.RestException.Status).toBe("400")
          expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
          expect(response.body.RestException.ErrorFields[0].field).toBe('iptPassportNumber')
          expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("This field is required")
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar 400, uma vez que o número do passaporte do usuario estrangeiro está errado.", function() {
      return request.post('/users').send({
        name: "Tobias de Oliveira",
        email: "tobias@gmail.com",
        password: "@TobiaS&6554987@",
        phoneCode: "55",
        phoneNumber: "115498653214",
        birthDate: "2000-02-11",
        country: "US",
        state: "NY",
        city: "New York City",
        passportNumber: "C33005988",
      })
        .then(function(response) {
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
          expect(response.body.RestException.Message).toBe("Invalid passport number")
          expect(response.body.RestException.Status).toBe("400")
          expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
          expect(response.body.RestException.ErrorFields[0].field).toBe('iptPassportNumber')
          expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("Invalid passport number")
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar 400, uma vez que o número do passaporte do usuário estrangeiro já foi registrado anteriormente.", function() {
      return request.post('/users').send({
        name: "Tobias de Oliveira",
        email: "tobias@gmail.com",
        password: "@TobiaS&6554987@",
        phoneCode: "55",
        phoneNumber: "115498653214",
        birthDate: "2000-02-11",
        country: "US",
        state: "NY",
        city: "New York City",
        passportNumber: "431276122",
      })
        .then(function(response) {
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
          expect(response.body.RestException.Message).toBe("Passport number already registred")
          expect(response.body.RestException.Status).toBe("400")
          expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
          expect(response.body.RestException.ErrorFields[0].field).toBe('iptPassportNumber')
          expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("Passport number already registred")
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar 400, uma vez que o número do CEP não existe.", function() {
      return request.post('/users').send({
        name: "Tobias de Oliveira",
        email: "tobias@gmail.com",
        password: "@TobiaS&6554987@",
        phoneCode: "55",
        phoneNumber: "115498653214",
        birthDate: "2000-02-11",
        cpf: "22222222222",
        country: "BR",
        state: "SP",
        city: "São Manuel",
        cep: "10100100"
      })
        .then(function(response) {
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
          expect(response.body.RestException.Message).toBe("O CEP informado não existe")
          expect(response.body.RestException.Status).toBe("400")
          expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
          expect(response.body.RestException.ErrorFields[0].field).toBe('iptCEP')
          expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O CEP informado não existe")
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar 400, uma vez que o falta número do CEP informado.", function() {
      return request.post('/users').send({
        name: "Tobias de Oliveira",
        email: "tobias@gmail.com",
        password: "@TobiaS&6554987@",
        phoneCode: "55",
        phoneNumber: "115498653214",
        birthDate: "2000-02-11",
        cpf: "22222222222",
        country: "BR",
        state: "SP",
        city: "São Manuel",
        cep: "1010010"
      })
        .then(function(response) {
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
          expect(response.body.RestException.Message).toBe("Faltam números no CEP informado")
          expect(response.body.RestException.Status).toBe("400")
          expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
          expect(response.body.RestException.ErrorFields[0].field).toBe('iptCEP')
          expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("Faltam números no CEP informado")
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar 400, devido ao número de CEP possuir caractere inválido.", function() {
      return request.post('/users').send({
        name: "Tobias de Oliveira",
        email: "tobias@gmail.com",
        password: "@TobiaS&6554987@",
        phoneCode: "55",
        phoneNumber: "115498653214",
        birthDate: "2000-02-11",
        cpf: "22222222222",
        country: "BR",
        state: "SP",
        city: "São Manuel",
        cep: "1010010a"
      })
        .then(function(response) {
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
          expect(response.body.RestException.Message).toBe("O campo de CEP possui caracteres inválidos")
          expect(response.body.RestException.Status).toBe("400")
          expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
          expect(response.body.RestException.ErrorFields[0].field).toBe('iptCEP')
          expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de CEP possui caracteres inválidos")
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar 400, devido a presença de caracteres inválidos no nome do bairro.", function() {
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
        neighborhood: "<strong>Jardim Nova São Paulo</strong>",
        road: "Rua Nina Simone",
        house_number: "2000",
        information: "Nunc eleifend ante elit, a ornare risus gravida quis. Suspendisse venenatis felis ac tellus rutrum convallis. Integer tincidunt vehicula turpis, vel semper arcu mollis a. Proin auctor, ipsum ut finibus fringilla, orci sapien mattis mauris, et congue sapien metus vel augue. Nullam id ullamcorper neque. Integer dictum pharetra sapien non congue. Fusce libero elit, eleifend vitae viverra a, viverra id purus. Suspendisse sed nulla mauris. Sed venenatis tortor id nisi dictum tristique."
      })
        .then(function(response) {
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
            expect(response.body.RestException.Message).toBe("O campo de Bairro possui caracteres inválidos")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptNeighborhood')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de Bairro possui caracteres inválidos")
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar 400, devido a presença de caracteres inválidos no numero da casa do usuario.", function() {
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
        house_number: "2000as",
        information: "Nunc eleifend ante elit, a ornare risus gravida quis. Suspendisse venenatis felis ac tellus rutrum convallis. Integer tincidunt vehicula turpis, vel semper arcu mollis a. Proin auctor, ipsum ut finibus fringilla, orci sapien mattis mauris, et congue sapien metus vel augue. Nullam id ullamcorper neque. Integer dictum pharetra sapien non congue. Fusce libero elit, eleifend vitae viverra a, viverra id purus. Suspendisse sed nulla mauris. Sed venenatis tortor id nisi dictum tristique."
      })
        .then(function(response) {
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
            expect(response.body.RestException.Message).toBe("O campo de Número da Casa possui caracteres inválidos")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptHouseNumber')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de Número da Casa possui caracteres inválidos")
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar 400, devido a presença de caracteres inválidos nas informações adicionais do usuario.", function() {
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
        information: "<i>Nunc</i> eleifend ante elit, a ornare risus gravida quis. Suspendisse venenatis felis ac tellus rutrum convallis. Integer tincidunt vehicula turpis, vel semper arcu mollis a. Proin auctor, ipsum ut finibus fringilla, orci sapien mattis mauris, et congue sapien metus vel augue. Nullam id ullamcorper neque. Integer dictum pharetra sapien non congue. Fusce libero elit, eleifend vitae viverra a, viverra id purus. Suspendisse sed nulla mauris. Sed venenatis tortor id nisi dictum tristique."
      })
        .then(function(response) {
          expect(response.statusCode).toEqual(400)
          expect(response.body.RestException.Code).toBe("1")
            expect(response.body.RestException.Message).toBe("O campo de Informações Adicionais possui caracteres invalidos")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe("/docs/erros/1")
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptAdditionalInformation')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de Informações Adicionais possui caracteres invalidos")
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
          information,
          created,
          updated
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

        expect(created).toBeDefined()
        expect(created).toMatchObject({
          "createdAt": "2022-06-12T22:01:20.596Z",
          "createdBy": "5da9ea674234635bdff45c02"
        })

        expect(updated).toBeDefined()
        expect(updated).toMatchObject({
          "updatedAt": "2023-01-12T10:25:49.045Z",
          "updatedBy": "507f1f77bcf86cd799439011"
        })
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
          created,
          updated,
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
        expect(email).toBe("tobias@hotmail.com")

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
        expect(cpf).toBe("33333333333")

        expect(created).toBeDefined()
        expect(created).toMatchObject({
          "createdAt": "2020-09-12T11:10:06.596Z",
          "createdBy": "5da9ea674234635bdff45c02"
        })

        expect(updated).toBeDefined()
        expect(updated).toMatchObject({
          "updatedAt": "2021-01-12T10:25:49.045Z",
          "updatedBy": "507f1f77bcf86cd799439011"
        })

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
          information,
          created,
          updated
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
        expect(city).toBe("New York City")

        // Número do Passaporte é vazio, porque o cliente é Brasileiro.
        expect(passportNumber).toBeDefined()
        expect(passportNumber).toBe("303004786")
        
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

        expect(created).toBeDefined()
        expect(created).toMatchObject({
          "createdAt": "2021-05-102T11:43:42.300Z",
          "createdBy": "5da9ea674234635bdff45c02"
        })

        expect(updated).toBeDefined()
        expect(updated).toMatchObject({
          "updatedAt": "2022-11-12T14:25:49.045Z",
          "updatedBy": "507f1f77bcf86cd799439011"
        })

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
          created,
          updated,
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

        expect(created).toBeDefined()
        expect(created).toMatchObject({
          "createdAt": "2022-04-222T20:41:18.365Z",
          "createdBy": "5da9ea674234635bdff45c02"
        })

        expect(updated).toBeDefined()
        expect(updated).toMatchObject({
          "updatedAt": "2023-02-12T16:06:21.145Z",
          "updatedBy": "507f1f77bcf86cd799439011"
        })

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

    test("GET - Deve retornar uma lista de usuários.", function() {
      return request.get("/users")
      .then(function(response) {
        expect(response.statusCode).toEqual(200)
        expect(response.body.users).toBeDefined()
      })
      .catch(function(error) {
        fail(error)
      })
    })

    test("GET - Deve retornar uma lista de usuários, contendo limite de usuários.", function() {
      return request.get('/users?offset=1&limit=3')
      .then(function(response) {
        expect(response.statusCode).toEqual(200)
        expect(response.body.users.length).toEqual(2)
        expect(response.body.users[0]).toMatchObject({
          "email": "tobias@hotmail.com",
          "cpf": "33333333333"
        })
        expect(response.body.users[1]).toMatchObject({
          "email": "john_sm@hotmail.com",
          "passportNumber": "303004786"
        })
      })
      .catch(function(error) {
        fail(error)
      })
    })

    test("POST - Deve retornar o email e o nome do usuário Brasileiro que corresponda com o CPF informado.", function() {
      return request.post('/users/search').send({
        cpf: '33333333333'
      })
        .then(function(response) {
          expect(response.statusCode).toEqual(200)
          expect(response.body.user).toMatchObject({
            "name": "Tobias de Oliveira",
            "email": "tobias@hotmail.com"
          })
        })
        .catch(function(error) {
          fail(error)
        })
    })

    test("POST - Deve retornar o email e o nome do usuário estrangeiro que corresponda com o Numero de Passaporte informado.", function() {
      return request.post('/users/search').send({
        passportNumber: '303004786'
      })
      .then(function(response) {
        expect(response.statusCode).toEqual(200)
        expect(response.body.user).toMatchObject({
          "name": "John Smith",
          "email": "john_sm@hotmail.com"
        })
      })
      .catch(function(error) {
        fail(error)
      })
    })
  })

  /* ################## UPDATE ################## */

  describe("Testes de SUCESSO na atualizacao de dados.", function() {
    test("POST - Deve retornar 200 e o usuário com suas informações atualizadas.", function() {
      let user = {
        id: "5da9ea674234635bdff45c02",
        name: "Josias Cruz",
        email: "jo_cruz@gmail.com",
        password: "@JosiaS&654975@",
        role: '0',
        phoneCode: "55",
        phoneNumber: "11984222222",
        birthDate: "1985-06-09",
        country: "BR",
        state: "RJ",
        city: "Rio de Janeiro",
        cpf: "11111111111"
      }
      return request.put('/users').send({ user })
      .then(function(response) {
        expect(response.statusCode).toEqual(200)
        expect(response.body.user.name).toBe(user.name)
        expect(response.body.user.email).toBe(user.email)
        expect(response.body.user.password).toBe(user.password)
        expect(response.body.user.role).toBe(user.role)
        expect(response.body.user.phoneCode).toBe(user.phoneCode)
        expect(response.body.user.phoneNumber).toBe(user.phoneNumber)
        expect(response.body.user.birthDate).toBe(user.birthDate)
        expect(response.body.user.country).toBe(user.country)
        expect(response.body.user.state).toBe(user.state)
        expect(response.body.user.city).toBe(user.city)
        expect(response.body.user.cpf).toBe(user.cpf)
      })
      .catch(function(error) {
        fail(error)
      })
    })
  })

  /* ################## DELETE ################## */

  describe("Testes de SUCESSO na deleção de um usuário.", function() {
    test("DELETE - Deve retornar 200.", function() {
      return request.delete('/users/507f191e810c19729de860ea')
        .then(function(responseDelete) {
          expect(responseDelete.statusCode).toEqual(200)
        })
        .catch(function(error) {
          fail(error)
        })
    })
  })
})