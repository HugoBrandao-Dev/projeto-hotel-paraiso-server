const app = require('../src/app')
const supertest = require('supertest')
const validator = require('validator')
const Generator = require('../src/tools/Generator')

let UserCollection = require('../src/data/UserCollection.json')

const request = supertest(app)

let baseURL = 'http://localhost:4000'
let endpoints = {
  toCreate: '/user',
  toRead: '/user',
  toView: '/user',
  toSearch: '/user/search',
  toUpdate: '/user',
  toDelete: '/user',
  toList: '/users',
  toLogin: '/login'
}
let tokens = {
  admin: '',
  cliente: ''
}
const projectLinks = {
  errors: 'https://projetohotelparaiso.dev/docs/erros'
}

// Aumenta o tempo máximo para resposta - o padrão é 5000ms.
jest.setTimeout(10000)

function register(user) {
  return new Promise((resolve, reject) => {
    request.post(endpoints.toCreate).send(user)
      .then(() => {
        let login = {
          email: user.email,
          password: user.password
        }
        resolve(login)
      })
      .catch(error => {
        reject(error)
      })
  })
}

function login(login) {
  return new Promise((resolve, reject) => {
    request.post(endpoints.toLogin).send(login)
      .then((response) => {
        let { token } = response.body
        resolve(token)
      })
      .catch(error => {
        reject(error)
      })
  })
}

beforeAll(async () => {
  try {
    const userAdmin = {
      name: "Tobias de Oliveira",
      email: "tobias@gmail.com",
      password: "@TobiaS&591022@",
      phoneCode: "55",
      phoneNumber: "11984752352",
      birthDate: "1985-06-09",
      country: "BR",
      state: "SP",
      city: "São Paulo",
      cpf: `${ Generator.genCPF() }`
    }
    let adminLogin = await register(userAdmin)
    tokenAdmin = await login(adminLogin)
    tokens.admin = `Bearer ${ tokenAdmin }`
    
    const userCliente = {
      name: "Doralice Cruz",
      email: "doralice@yahoo.com",
      password: "oiqwuerowq#&134890OIU@",
      phoneCode: "1",
      phoneNumber: "2129981212",
      birthDate: "1998-04-09",
      country: "US",
      state: "NY",
      city: "New York City",
      passportNumber: "100003105",
      neighborhood: "Jardim Nova São Paulo",
      road: "Rua Nina Simone",
      house_number: "2000",
      information: "Nunc eleifend ante elit, a ornare risus gravida quis. Suspendisse venenatis felis ac tellus rutrum convallis. Integer tincidunt vehicula turpis, vel semper arcu mollis a. Proin auctor, ipsum ut finibus fringilla, orci sapien mattis mauris, et congue sapien metus vel augue. Nullam id ullamcorper neque. Integer dictum pharetra sapien non congue. Fusce libero elit, eleifend vitae viverra a, viverra id purus. Suspendisse sed nulla mauris. Sed venenatis tortor id nisi dictum tristique."
    }
    let clienteLogin = await register(userCliente)
    tokenCliente = await login(clienteLogin)
    tokens.cliente = `Bearer ${ tokenCliente }`
  } catch (error) {
    console.log(error)
  }
})

describe("Suite de testes das rotas User.", function() {
  let fixedCPF = Generator.genCPF()
  let fixedPassportNumber = Generator.genPassportNumber()

  describe("CREATE", function() {
    describe("Testes de SUCESSO.", function() {
      test("POST - Deve retornar 201, para inserção de dados obrigatórios + opcionais para brasileiros.", function() {

        const user = {
          name: "Dinorá de Oliveira",
          email: "dino_oli@hotmail.com",
          password: "@QowierU12873094&28374@",
          phoneCode: "55",
          phoneNumber: "11999847523",
          birthDate: "1985-06-09",
          country: "BR",
          state: "SP",
          city: "São Paulo",
          cpf: `${ Generator.genCPF() }`,
          cep: "08391700",
          neighborhood: "Jardim Nova São Paulo",
          road: "Rua Nina Simone",
          house_number: "2000",
          information: "Nunc eleifend ante elit, a ornare risus gravida quis. Suspendisse venenatis felis ac tellus rutrum convallis. Integer tincidunt vehicula turpis, vel semper arcu mollis a. Proin auctor, ipsum ut finibus fringilla, orci sapien mattis mauris, et congue sapien metus vel augue. Nullam id ullamcorper neque. Integer dictum pharetra sapien non congue. Fusce libero elit, eleifend vitae viverra a, viverra id purus. Suspendisse sed nulla mauris. Sed venenatis tortor id nisi dictum tristique."
        }

        return request.post(endpoints.toCreate).send(user)
          .then(function(response) {
            expect(response.statusCode).toEqual(201)
          })
          .catch(function(error) {
            fail(error)
          })
      })
      test("POST - Deve retornar 201, para inserção dos dados obrigatórios de estrangeiros.", function() {

        const user = {
          name: "Josias Cruz",
          email: "josias_cruz@hotmail.com",
          password: "@JosiaS&3659792@",
          phoneCode: "1",
          phoneNumber: "2129981212",
          birthDate: "1999-01-09",
          country: "US",
          state: "NY",
          city: "New York City",
          passportNumber: Generator.genPassportNumber(),
        }

        return request.post(endpoints.toCreate).send(user)
        .then(function(response) {
          expect(response.statusCode).toEqual(201)

          expect(response.body._links).toBeDefined()
          expect(response.body._links).toHaveLength(3)
        })
        .catch(function(error) {
          fail(error)
        })
      })

    })/*
    describe("Testes de FALHA.", function() {
      // Testes no NOME
      test("POST - Deve retornar 400, pela ausência do nome do User.", function() {
        return request.post(endpoints.toCreate).send({
          name: "",
          email: "tobias@hotmail.com",
          password: "@TobiaS&591022@",
          phoneCode: "55",
          phoneNumber: "11984752352",
          birthDate: "1985-06-09",
          country: "BR",
          state: "SP",
          city: "São Paulo",
          cpf: Generator.genCPF(),
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("1")
            expect(response.body.RestException.Message).toBe("O campo Nome é obrigatório")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptName')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('O campo Nome é obrigatório')
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 400, devido a presença de elementos inválidos do nome do User.", function() {

        // O "O" de "Oliveira", na verdade é um 0 (zero).
        return request.post(endpoints.toCreate).send({
          name: "Tobias de 0liveira",
          email: "tobias@hotmail.com",
          password: "@TobiaS&591022@",
          phoneCode: "55",
          phoneNumber: "11984752352",
          birthDate: "1985-06-09",
          country: "BR",
          state: "SP",
          city: "São Paulo",
          cpf: Generator.genCPF(),
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O campo Nome possui caracteres inválidos")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptName')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('O campo Nome possui caracteres inválidos')
          })
          .catch(function(error) {
            fail(error)
          })
      })

      // Testes no EMAIL
      test("POST - Deve retornar 400, pela ausência do email do User.", function() {
        return request.post(endpoints.toCreate).send({
          name: "Tobias de Oliveira",
          email: "",
          password: "@TobiaS&591022@",
          phoneCode: "55",
          phoneNumber: "11984752352",
          birthDate: "1985-06-09",
          country: "BR",
          state: "SP",
          city: "São Paulo",
          cpf: Generator.genCPF(),
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("1")
            expect(response.body.RestException.Message).toBe("O campo Email é obrigatório")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptEmail')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('O campo Email é obrigatório')
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 400, devido a presença de elementos inválidos no email do User.", function() {
        return request.post(endpoints.toCreate).send({
          name: "Tobias de Oliveira",
          email: "tobias($)@gmail.com",
          password: "@TobiaS&591022@",
          phoneCode: "55",
          phoneNumber: "11984752352",
          birthDate: "1985-06-09",
          country: "BR",
          state: "SP",
          city: "São Paulo",
          cpf: Generator.genCPF(),
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O campo Email possui caracteres inválidos")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptEmail')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('O campo Email possui caracteres inválidos')
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 400, por passar um email já cadastrado.", function() {
        return request.post(endpoints.toCreate).send({
          name: "Tobias de Oliveira",
          email: "tobias@gmail.com",
          password: "@TobiaS&591022@",
          phoneCode: "55",
          phoneNumber: "11984752352",
          birthDate: "1985-06-09",
          country: "BR",
          state: "SP",
          city: "São Paulo",
          cpf: Generator.genCPF(),
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("4")
            expect(response.body.RestException.Message).toBe("O Email informado já foi cadastrado anteriormente")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/4`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptEmail')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('O Email informado já foi cadastrado anteriormente')
          })
          .catch(function(error) {
            fail(error)
          })
      })

      // Testes na DATA DE NASCIMENTO/IDADE
      test("POST - Deve retornar 400, pela ausência da data de nascimento do User.", function() {
        return request.post(endpoints.toCreate).send({
          name: "Tobias de Oliveira",
          email: "tobias@hotmail.com",
          password: "@TobiaS&591022@",
          phoneCode: "55",
          phoneNumber: "11984752352",
          birthDate: "",
          country: "BR",
          state: "SP",
          city: "São Paulo",
          cpf: Generator.genCPF(),
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("1")
            expect(response.body.RestException.Message).toBe("O campo Data de Nascimento é obrigatório")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptBirthDate')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('O campo Data de Nascimento é obrigatório')
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 400, por ter informado uma data de nascimento inválida.", function() {
        return request.post(endpoints.toCreate).send({
          name: "Tobias de Oliveira",
          email: "tobias@hotmail.com",
          password: "@TobiaS&591022@",
          phoneCode: "55",
          phoneNumber: "11984752352",
          birthDate: "2+00-02-11",
          country: "BR",
          state: "SP",
          city: "São Paulo",
          cpf: Generator.genCPF(),
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O campo de Data de Nascimento é inválido")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptBirthDate')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('O campo de Data de Nascimento é inválido')
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 400, pela idade do usuário ser menor que 18 anos.", function() {
        return request.post(endpoints.toCreate).send({
          name: "Tobias de Oliveira",
          email: "tobias@hotmail.com",
          password: "@TobiaS&591022@",
          phoneCode: "55",
          phoneNumber: "11984752352",
          birthDate: "2018-02-11",
          country: "BR",
          state: "SP",
          city: "São Paulo",
          cpf: Generator.genCPF(),
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("Somente usuários com mais de 18 anos podem se cadastrar")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptBirthDate')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('Somente usuários com mais de 18 anos podem se cadastrar')
          })
          .catch(function(error) {
            fail(error)
          })
      })

      // Testes na SENHA
      test("POST - Deve retornar 400, pela ausência da senha do usuário.", function() {
        return request.post(endpoints.toCreate).send({
          name: "Tobias de Oliveira",
          email: "tobias@hotmail.com",
          password: "",
          phoneCode: "55",
          phoneNumber: "11984752352",
          birthDate: "2000-02-11",
          country: "BR",
          state: "SP",
          city: "São Paulo",
          cpf: Generator.genCPF(),
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("1")
            expect(response.body.RestException.Message).toBe("O campo de Senha é obrigatório")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptPassword')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de Senha é obrigatório")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 400, devido a senha informada ser muito fraca.", function() {
        return request.post(endpoints.toCreate).send({
          name: "Tobias de Oliveira",
          email: "tobias@hotmail.com",
          password: "@tobias&7qer5464@",
          phoneCode: "55",
          phoneNumber: "11984752352",
          birthDate: "2000-02-11",
          country: "BR",
          state: "SP",
          city: "São Paulo",
          cpf: Generator.genCPF(),
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("A senha é muito fraca")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptPassword')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("A senha é muito fraca")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      // Testes no CÓDIGO DO TELEFONE/TELEFONE
      test("POST - Deve retornar 400, pela ausência do código do telefone.", function() {
        return request.post(endpoints.toCreate).send({
          name: "Tobias de Oliveira",
          email: "tobias@hotmail.com",
          password: "@TobiaS&6554987@",
          phoneCode: "",
          phoneNumber: "11984752352",
          birthDate: "2000-02-11",
          country: "BR",
          state: "SP",
          city: "São Paulo",
          cpf: Generator.genCPF(),
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("1")
            expect(response.body.RestException.Message).toBe("O campo de Código de Telefone é obrigatório")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptPhoneCode')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de Código de Telefone é obrigatório")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 400, devido ao código de telefone informado ser invalido.", function() {
        return request.post(endpoints.toCreate).send({
          name: "Tobias de Oliveira",
          email: "tobias@hotmail.com",
          password: "@TobiaS&6554987@",
          phoneCode: "1a",
          phoneNumber: "11984752352",
          birthDate: "2000-02-11",
          country: "BR",
          state: "SP",
          city: "São Paulo",
          cpf: Generator.genCPF(),
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O Código de Telefone é inválido")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptPhoneCode')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O Código de Telefone é inválido")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 400, pela ausência do telefone do usuario.", function() {
        return request.post(endpoints.toCreate).send({
          name: "Tobias de Oliveira",
          email: "tobias@hotmail.com",
          password: "@TobiaS&6554987@",
          phoneCode: "55",
          phoneNumber: "",
          birthDate: "2000-02-11",
          country: "BR",
          state: "SP",
          city: "São Paulo",
          cpf: Generator.genCPF(),
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("1")
            expect(response.body.RestException.Message).toBe("O campo de Número de Telefone é obrigatório")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptPhoneNumber')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de Número de Telefone é obrigatório")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 400, devido ao número de telefone do usuário ser inválido.", function() {
        return request.post(endpoints.toCreate).send({
          name: "Tobias de Oliveira",
          email: "tobias@hotmail.com",
          password: "@TobiaS&6554987@",
          phoneCode: "55",
          phoneNumber: "asdf115498653214",
          birthDate: "2000-02-11",
          country: "BR",
          state: "SP",
          city: "São Paulo",
          cpf: Generator.genCPF(),
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O telefone é inválido")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptPhoneNumber')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O telefone é inválido")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      // Testes no PAÍS DE NASCIMENTO
      test("POST - Deve retornar 400, pela ausência do país de nascimento do usuário.", function() {
        return request.post(endpoints.toCreate).send({
          name: "Tobias de Oliveira",
          email: "tobias@hotmail.com",
          password: "@TobiaS&6554987@",
          phoneCode: "55",
          phoneNumber: "115498653214",
          birthDate: "2000-02-11",
          country: "",
          state: "SP",
          city: "São Paulo",
          cpf: Generator.genCPF(),
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("1")
            expect(response.body.RestException.Message).toBe("O campo de País de Nascimento é obrigatório")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptCountry')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de País de Nascimento é obrigatório")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 400, devido ao ISO do pais de nascimento do usuário ser inválido.", function() {
        return request.post(endpoints.toCreate).send({
          name: "Tobias de Oliveira",
          email: "tobias@hotmail.com",
          password: "@TobiaS&6554987@",
          phoneCode: "55",
          phoneNumber: "115498653214",
          birthDate: "2000-02-11",
          country: "BRA",
          state: "SP",
          city: "São Paulo",
          cpf: Generator.genCPF(),
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("País inválido")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptCountry')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("País inválido")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      // Testes no ESTADO DE NASCIMENTO
      test("POST - Deve retornar 400, pela ausência do estado de nascimento do usuário.", function() {
        return request.post(endpoints.toCreate).send({
          name: "Tobias de Oliveira",
          email: "tobias@hotmail.com",
          password: "@TobiaS&6554987@",
          phoneCode: "55",
          phoneNumber: "115498653214",
          birthDate: "2000-02-11",
          country: "BR",
          state: "",
          city: "São Paulo",
          cpf: Generator.genCPF(),
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("1")
            expect(response.body.RestException.Message).toBe("O campo de Estado de Nascimento é obrigatório")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptState')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de Estado de Nascimento é obrigatório")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 400, devido ao nome/sigla do estado de nascimento ser inválido.", function() {
        return request.post(endpoints.toCreate).send({
          name: "Tobias de Oliveira",
          email: "tobias@hotmail.com",
          password: "@TobiaS&6554987@",
          phoneCode: "55",
          phoneNumber: "115498653214",
          birthDate: "2000-02-11",
          country: "BR",
          state: "NY",
          city: "São Paulo",
          cpf: Generator.genCPF(),
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("Estado inválido")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptState')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("Estado inválido")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      // Testes na CIDADE DE NASCIMENTO
      test("POST - Deve retornar 400, pela ausência do nome da cidade de nascimento do usuário.", function() {
        return request.post(endpoints.toCreate).send({
          name: "Tobias de Oliveira",
          email: "tobias@hotmail.com",
          password: "@TobiaS&6554987@",
          phoneCode: "55",
          phoneNumber: "115498653214",
          birthDate: "2000-02-11",
          country: "BR",
          state: "SP",
          city: "",
          cpf: Generator.genCPF(),
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("1")
            expect(response.body.RestException.Message).toBe("O campo de Cidade de Nascimento é obrigatório")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptCity')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de Cidade de Nascimento é obrigatório")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 400, devido ao nome da cidade de nascimento do usuário ser inválido.", function() {
        return request.post(endpoints.toCreate).send({
          name: "Tobias de Oliveira",
          email: "tobias@hotmail.com",
          password: "@TobiaS&6554987@",
          phoneCode: "55",
          phoneNumber: "115498653214",
          birthDate: "2000-02-11",
          country: "BR",
          state: "SP",
          city: "São Manuel do Oeste",
          cpf: `${ Generator.genCPF() }`,
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("Cidade inválida")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptCity')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("Cidade inválida")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      // Testes no CPF (para Brasileiros)
      test("POST - Deve retornar 400, pela ausência do CPF do usuário nascido no Brasil.", function() {
        return request.post(endpoints.toCreate).send({
          name: "Tobias de Oliveira",
          email: "tobias@hotmail.com",
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
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptCPF')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de CPF é obrigatório")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 400, devido ao valor do CPF do usuário ser inválido.", function() {
        return request.post(endpoints.toCreate).send({
          name: "Tobias de Oliveira",
          email: "tobias@hotmail.com",
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
            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O CPF possui caracteres inválidos")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptCPF')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O CPF possui caracteres inválidos")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 400, devido ao valor do CPF do usuário estar faltando dígitos.", function() {
        return request.post(endpoints.toCreate).send({
          name: "Tobias de Oliveira",
          email: "tobias@hotmail.com",
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
            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("Faltam digitos no seu CPF")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptCPF')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("Faltam digitos no seu CPF")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 400, devido ao CPF informado já estar cadastrado.", function() {
        return request.post(endpoints.toCreate).send({
          name: "Tobias de Oliveira",
          email: "tobias@hotmail.com",
          password: "@TobiaS&6554987@",
          phoneCode: "55",
          phoneNumber: "115498653214",
          birthDate: "2000-02-11",
          country: "BR",
          state: "SP",
          city: "São Manuel",
          cpf: "22222222222",
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("4")
            expect(response.body.RestException.Message).toBe("O CPF informado já está cadastrado")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/4`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptCPF')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O CPF informado já está cadastrado")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      // Testes no NÚMERO DE PASSAPORTE (para estrangeiros)
      test("POST - Deve retornar 400, devido a ausência do número do passaporte de um usuário estrangeiro.", function() {
        return request.post(endpoints.toCreate).send({
          name: "Tobias de Oliveira",
          email: "tobias@hotmail.com",
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
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptPassportNumber')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("This field is required")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 400, uma vez que o número do passaporte do usuario estrangeiro está errado.", function() {
        return request.post(endpoints.toCreate).send({
          name: "Tobias de Oliveira",
          email: "tobias@hotmail.com",
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
            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("Invalid passport number")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptPassportNumber')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("Invalid passport number")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 400, uma vez que o número do passaporte do usuário estrangeiro já foi registrado anteriormente.", function() {
        return request.post(endpoints.toCreate).send({
          name: "Tobias de Oliveira",
          email: "tobias@hotmail.com",
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
            expect(response.body.RestException.Code).toBe("4")
            expect(response.body.RestException.Message).toBe("Passport number already registred")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/4`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptPassportNumber')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("Passport number already registred")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      // Testes no CEP
      test("POST - Deve retornar 400, uma vez que o número do CEP não existe.", function() {
        return request.post(endpoints.toCreate).send({
          name: "Tobias de Oliveira",
          email: "tobias@hotmail.com",
          password: "@TobiaS&6554987@",
          phoneCode: "55",
          phoneNumber: "115498653214",
          birthDate: "2000-02-11",
          cpf: Generator.genCPF(),
          country: "BR",
          state: "SP",
          city: "São Manuel",
          cep: "10100100"
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O CEP informado não existe")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptCEP')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O CEP informado não existe")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 400, uma vez que o falta número do CEP informado.", function() {
        return request.post(endpoints.toCreate).send({
          name: "Tobias de Oliveira",
          email: "tobias@hotmail.com",
          password: "@TobiaS&6554987@",
          phoneCode: "55",
          phoneNumber: "115498653214",
          birthDate: "2000-02-11",
          cpf: Generator.genCPF(),
          country: "BR",
          state: "SP",
          city: "São Manuel",
          cep: "1010010"
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("Faltam números no CEP informado")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptCEP')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("Faltam números no CEP informado")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 400, devido ao número de CEP possuir caractere inválido.", function() {
        return request.post(endpoints.toCreate).send({
          name: "Tobias de Oliveira",
          email: "tobias@hotmail.com",
          password: "@TobiaS&6554987@",
          phoneCode: "55",
          phoneNumber: "115498653214",
          birthDate: "2000-02-11",
          cpf: Generator.genCPF(),
          country: "BR",
          state: "SP",
          city: "São Manuel",
          cep: "1010010a"
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O campo de CEP possui caracteres inválidos")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptCEP')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de CEP possui caracteres inválidos")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      // Teste no NOME DO BAIRRO
      test("POST - Deve retornar 400, devido a presença de caracteres inválidos no nome do bairro.", function() {
        return request.post(endpoints.toCreate).send({
          name: "Tobias de Oliveira",
          email: "tobias@hotmail.com",
          password: "@TobiaS&591022@",
          phoneCode: "55",
          phoneNumber: "11999847523",
          birthDate: "1985-06-09",
          country: "BR",
          state: "SP",
          city: "São Paulo",
          cpf: Generator.genCPF(),
          cep: "08391700",
          neighborhood: "<strong>Jardim Nova São Paulo</strong>",
          road: "Rua Nina Simone",
          house_number: "2000",
          information: "Nunc eleifend ante elit, a ornare risus gravida quis. Suspendisse venenatis felis ac tellus rutrum convallis. Integer tincidunt vehicula turpis, vel semper arcu mollis a. Proin auctor, ipsum ut finibus fringilla, orci sapien mattis mauris, et congue sapien metus vel augue. Nullam id ullamcorper neque. Integer dictum pharetra sapien non congue. Fusce libero elit, eleifend vitae viverra a, viverra id purus. Suspendisse sed nulla mauris. Sed venenatis tortor id nisi dictum tristique."
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("2")
              expect(response.body.RestException.Message).toBe("O campo de Bairro possui caracteres inválidos")
              expect(response.body.RestException.Status).toBe("400")
              expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
              expect(response.body.RestException.ErrorFields[0].field).toBe('iptNeighborhood')
              expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de Bairro possui caracteres inválidos")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 400, devido a presença de caracteres inválidos no nome da rua.", function() {
        return request.post(endpoints.toCreate).send({
          name: "Tobias de Oliveira",
          email: "tobias@hotmail.com",
          password: "@TobiaS&591022@",
          phoneCode: "55",
          phoneNumber: "11999847523",
          birthDate: "1985-06-09",
          country: "BR",
          state: "SP",
          city: "São Paulo",
          cpf: Generator.genCPF(),
          cep: "08391700",
          neighborhood: "Jardim Nova São Paulo",
          road: "<i>Rua Nina Simone</i>",
          house_number: "2000",
          information: "Nunc eleifend ante elit, a ornare risus gravida quis. Suspendisse venenatis felis ac tellus rutrum convallis. Integer tincidunt vehicula turpis, vel semper arcu mollis a. Proin auctor, ipsum ut finibus fringilla, orci sapien mattis mauris, et congue sapien metus vel augue. Nullam id ullamcorper neque. Integer dictum pharetra sapien non congue. Fusce libero elit, eleifend vitae viverra a, viverra id purus. Suspendisse sed nulla mauris. Sed venenatis tortor id nisi dictum tristique."
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("2")
              expect(response.body.RestException.Message).toBe("O campo de Rua possui caracteres inválidos")
              expect(response.body.RestException.Status).toBe("400")
              expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
              expect(response.body.RestException.ErrorFields[0].field).toBe('iptRoad')
              expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de Rua possui caracteres inválidos")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      // Teste no NÚMERO DA CASA
      test("POST - Deve retornar 400, devido a presença de caracteres inválidos no numero da casa do usuario.", function() {
        return request.post(endpoints.toCreate).send({
          name: "Tobias de Oliveira",
          email: "tobias@hotmail.com",
          password: "@TobiaS&591022@",
          phoneCode: "55",
          phoneNumber: "11999847523",
          birthDate: "1985-06-09",
          country: "BR",
          state: "SP",
          city: "São Paulo",
          cpf: Generator.genCPF(),
          cep: "08391700",
          neighborhood: "Jardim Nova São Paulo",
          road: "Rua Nina Simone",
          house_number: "2000as",
          information: "Nunc eleifend ante elit, a ornare risus gravida quis. Suspendisse venenatis felis ac tellus rutrum convallis. Integer tincidunt vehicula turpis, vel semper arcu mollis a. Proin auctor, ipsum ut finibus fringilla, orci sapien mattis mauris, et congue sapien metus vel augue. Nullam id ullamcorper neque. Integer dictum pharetra sapien non congue. Fusce libero elit, eleifend vitae viverra a, viverra id purus. Suspendisse sed nulla mauris. Sed venenatis tortor id nisi dictum tristique."
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("2")
              expect(response.body.RestException.Message).toBe("O campo de Número da Casa possui caracteres inválidos")
              expect(response.body.RestException.Status).toBe("400")
              expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
              expect(response.body.RestException.ErrorFields[0].field).toBe('iptHouseNumber')
              expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de Número da Casa possui caracteres inválidos")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      // Teste nas INFORMAÇÕES ADICIONAIS
      test("POST - Deve retornar 400, devido a presença de caracteres inválidos nas informações adicionais do usuario.", function() {
        return request.post(endpoints.toCreate).send({
          name: "Tobias de Oliveira",
          email: "tobias@hotmail.com",
          password: "@TobiaS&591022@",
          phoneCode: "55",
          phoneNumber: "11999847523",
          birthDate: "1985-06-09",
          country: "BR",
          state: "SP",
          city: "São Paulo",
          cpf: Generator.genCPF(),
          cep: "08391700",
          neighborhood: "Jardim Nova São Paulo",
          road: "Rua Nina Simone",
          house_number: "2000",
          information: "<i>Nunc</i> eleifend ante elit, a ornare risus gravida quis. Suspendisse venenatis felis ac tellus rutrum convallis. Integer tincidunt vehicula turpis, vel semper arcu mollis a. Proin auctor, ipsum ut finibus fringilla, orci sapien mattis mauris, et congue sapien metus vel augue. Nullam id ullamcorper neque. Integer dictum pharetra sapien non congue. Fusce libero elit, eleifend vitae viverra a, viverra id purus. Suspendisse sed nulla mauris. Sed venenatis tortor id nisi dictum tristique."
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("2")
              expect(response.body.RestException.Message).toBe("O campo de Informações Adicionais possui caracteres invalidos")
              expect(response.body.RestException.Status).toBe("400")
              expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
              expect(response.body.RestException.ErrorFields[0].field).toBe('iptAdditionalInformation')
              expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de Informações Adicionais possui caracteres invalidos")
          })
          .catch(function(error) {
            fail(error)
          })
      })
    })*/
  })

  describe("READ", function() {
    describe("Testes de SUCESSO.", function() {
      test("GET - Deve retornar 200 para usuário que buscam suas próprias informações.", function() {

        let login = {
          email: "dino_oli@hotmail.com",
          password: "@QowierU12873094&28374@"
        }

        return request.post(endpoints.toLogin).send(login)
          .then(function(responseLogin) {

            expect(responseLogin.statusCode).toEqual(200)

            const { token, _links } = responseLogin.body

            let id = _links[0].href.split('/').pop()
            let authorization = `Bearer ${ token }`

            return request.get(`${ endpoints.toRead }/${ id }`).set('Authorization', authorization)
              .then(responseRead => {

                expect(responseRead.statusCode).toEqual(200)

                expect(responseRead.body).toMatchObject({
                  name: "Dinorá de Oliveira",
                  email: "dino_oli@hotmail.com",
                  phoneCode: "55",
                  phoneNumber: "11999847523",
                  birthDate: "1985-06-09",
                  country: "BR",
                  state: "SP",
                  city: "São Paulo",
                  cep: "08391700",
                  neighborhood: "Jardim Nova São Paulo",
                  road: "Rua Nina Simone",
                  house_number: "2000",
                  information: "Nunc eleifend ante elit, a ornare risus gravida quis. Suspendisse venenatis felis ac tellus rutrum convallis. Integer tincidunt vehicula turpis, vel semper arcu mollis a. Proin auctor, ipsum ut finibus fringilla, orci sapien mattis mauris, et congue sapien metus vel augue. Nullam id ullamcorper neque. Integer dictum pharetra sapien non congue. Fusce libero elit, eleifend vitae viverra a, viverra id purus. Suspendisse sed nulla mauris. Sed venenatis tortor id nisi dictum tristique."
                })

                expect(responseRead.body.created).toBeDefined()
                expect(responseRead.body.updated).toBeDefined()

                expect(responseRead.body._links).toBeDefined()
                expect(responseRead.body._links).toHaveLength(3)
              })
              .catch(error => {
                fail(error)
              })
          })
          .catch(function(errorLogin) {
            fail(errorLogin)
          })
      })

      test("GET - Deve retornar 200 e uma lista de usuários.", function() {
        return request.get(endpoints.toList).set('Authorization', tokens.admin)
          .then(function(response) {
            expect(response.statusCode).toEqual(200)

            expect(response.body).toHaveProperty('users')
            expect(response.body).toHaveProperty('hasNext')

            // A quantidade PADRÃO de itens a serem exibidos por página é 20.
            expect(response.body.hasNext).toBe(false)

            for (let user of response.body.users) {
              expect(user._links).toBeDefined()
              expect(user._links).toHaveLength(3)
            }
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("GET - Deve retornar 200 e uma lista de usuários, contendo limite de usuários.", function() {
        let url = endpoints.toList + '?offset=1&limit=3'
        return request.get(url).set('Authorization', tokens.admin)
          .then(function(response) {
            expect(response.statusCode).toEqual(200)
            expect(response.body.users.length).toEqual(2)

            expect(response.body).toHaveProperty('users')
            expect(response.body).toHaveProperty('hasNext')

            for (let user of response.body.users) {
              expect(user._links).toBeDefined()
              expect(user._links).toHaveLength(3)
            }
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 200 e o email e o nome do usuário Brasileiro que corresponda com o CPF informado.", function() {

        const info = {
          cpf: '22222222222'
        }

        return request.post(endpoints.toSearch).send(info).set('Authorization', tokens.admin)
          .then(function(response) {
            expect(response.statusCode).toEqual(200)
            expect(response.body.user).toMatchObject({
              "name": "Macunaíma Cruz",
              "email": "macuna_curz@hotmail.com"
            })

            expect(response.body.user._links).toBeDefined()
            expect(response.body.user._links).toHaveLength(4)
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 200 e o email e o nome do usuário estrangeiro que corresponda com o Numero de Passaporte informado.", function() {

        const info = {
          passportNumber: '303004786'
        }
        
        return request.post(endpoints.toSearch).send(info).set('Authorization', tokens.admin)
          .then(function(response) {
            expect(response.statusCode).toEqual(200)
            expect(response.body.user).toMatchObject({
              "name": "John Smith",
              "email": "john_sm@hotmail.com"
            })

            expect(response.body.user._links).toBeDefined()
            expect(response.body.user._links).toHaveLength(4)
          })
          .catch(function(error) {
            fail(error)
          })
      })
      /*
      test("Deve retornar 200, e as informações do usuário que corresponda ao ID informado.", function() {

        let user = { id: '5da9ea674234635bdff45c02' }

        return request.get(`${ endpoints.toView }/${ user.id }`).set('Authorization', tokens.admin)
          .then(function(response) {
            expect(response.statusCode).toEqual(200)

            expect(response.body).toMatchObject({
              name: "Jeremias de Oliveira",
              email: "jere_oliveira@yahoo.com",
              password: "oiwquro9237894883",
              role: "2",
              phoneCode: "55",
              phoneNumber: "11984755654",
              birthDate: "1999-08-03",
              country: "BR",
              state: "SP",
              cep: "08391700",
              city: "São Paulo",
              cpf: "11111111111",
              passportNumber: "",
              neighborhood: "Jardim Nova São Paulo",
              road: "Rua Nina Simone",
              house_number: "2000",
              information: "Nunc eleifend ante elit, a ornare risus gravida quis. Suspendisse venenatis felis ac tellus rutrum convallis. Integer tincidunt vehicula turpis, vel semper arcu mollis a. Proin auctor, ipsum ut finibus fringilla, orci sapien mattis mauris, et congue sapien metus vel augue. Nullam id ullamcorper neque. Integer dictum pharetra sapien non congue. Fusce libero elit, eleifend vitae viverra a, viverra id purus. Suspendisse sed nulla mauris. Sed venenatis tortor id nisi dictum tristique."
            })

            expect(response.body.created).toBeDefined()
            expect(response.body.updated).toBeDefined()
          })
          .catch(function(error) {
            fail(error)
          })
      })
      */

      /*
      test("GET - Deve retornar 200 para busca das informações obrigatórias de um usuário Brasileiro.", function() {
        let user = { id: '507f1f77bcf86cd799439011' }
        return request.get(`${ endpoints.toRead }/${ user.id }`)
          .then(function(response) {
            let {
              id,
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
              information,
              _links
            } = response.body

            // ID
            expect(id).toBeDefined()
            expect(id).toBe(user.id)

            // Nome
            expect(name).toBeDefined()
            expect(name).toBe("Macunaíma Cruz")

            // Email
            expect(email).toBeDefined()
            expect(email).toBe("macuna_curz@hotmail.com")

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

            // HATEOAS
            expect(_links).toBeDefined()
            expect(_links).toHaveLength(4)
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("GET - Deve retornar 200 para busca das informações obrigatórias + opcionais de um usuário estrangeiro.", function() {
        let user = { id: '507f191e810c19729de860ea' }
        return request.get(`${ endpoints.toRead }/${ user.id }`)
          .then(function(response) {
            let {
              id,
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
              updated,
              _links
            } = response.body

            expect(response.statusCode).toEqual(200)

            // ID
            expect(id).toBeDefined()
            expect(id).toBe(user.id)

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

            // HATEOAS
            expect(_links).toBeDefined()
            expect(_links).toHaveLength(4)
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("GET - Deve retornar 200 para busca de informações obrigatórias de um usuario estrangeiro.", function() {
        let user = { id: '600f191e810c19829de900ea' }
        return request.get(`${ endpoints.toRead }/${ user.id }`)
          .then(function(response) {
            let {
              id,
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
              information,
              _links
            } = response.body

            expect(response.statusCode).toEqual(200)

            // ID
            expect(id).toBeDefined()
            expect(id).toBe(user.id)

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

            // HATEOAS
            expect(_links).toBeDefined()
            expect(_links).toHaveLength(4)
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 200 e um Token.", function() {

        const user = {
          email: 'tobias@gmail.com',
          password: '@TobiaS&591022@'
        }

        return request.post(endpoints.toLogin).send(user)
          .then(function(response) {
            expect(response.statusCode).toEqual(200)

            const { token } = response.body

            expect(token).toBeDefined()
          })
          .catch(function(error) {
            fail(error)
          })
      })
      */
    })
    describe("Testes de FALHA.", function() {
      /*
      test("POST - Deve retornar 400, por não ter informado um documento (CPF ou Número de Passaporte) para busca de um usuário.", function() {
        return request.post(endpoints.toSearch).send({})
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("1")
            expect(response.body.RestException.Message).toBe("Nenhum CPF ou Número de Passaporte informado")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
            expect(response.body.RestException.ErrorField.field).toBe("iptDoc")
            expect(response.body.RestException.ErrorField.hasError.value).toEqual(true)
            expect(response.body.RestException.ErrorField.hasError.type).toEqual(1)
            expect(response.body.RestException.ErrorField.hasError.error).toBe("Nenhum CPF ou Número de Passaporte informado")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 400, por ter informado um campo inválido para busca de usuário por CPF ou Número de Passaporte.", function() {
        return request.post(endpoints.toSearch).send({
          name: 'Tobias de Oliveira'
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O campo a ser buscado é inválido")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 400, por ter informado um valor de CPF inválido.", function() {
        return request.post(endpoints.toSearch).send({
          cpf: '2222222222a'
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O CPF possui caracteres inválidos")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 400, por ter informado um valor de Número de Passaporte inválido.", function() {
        return request.post(endpoints.toSearch).send({
          passportNumber: 'C100100--'
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("Passport number contains invalid caracters")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
          })
          .catch(function(error) {
            fail(error)
          })
      })
      */

      // Teste na visualização das infos do cliente pelo lado do funcionário++.
      /*
      test("Deve retornar 400, uma vez que o ID do usuário a ser buscado contém caracteres inválidos.", function() {

        let user = { id: '5da9ea674234635bdff4+-!7' }

        return request.get(`${ endpoints.toView }/${ user.id }`).set('Authorization', tokens.admin)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O ID do cliente/usuário contém caracteres inválidos")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("Deve retornar 404, uma vez que o ID do usuário a ser buscado contém caracteres inválidos.", function() {

        let user = { id: '507f1f77bcf86cd799431111' }

        return request.get(`${ endpoints.toView }/${ user.id }`).set('Authorization', tokens.admin)
          .then(function(response) {
            expect(response.statusCode).toEqual(404)

            expect(response.body.RestException.Code).toBe("3")
            expect(response.body.RestException.Message).toBe("Nenhum usuário com o ID informado está cadastrado")
            expect(response.body.RestException.Status).toBe("404")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/3`)
          })
          .catch(function(error) {
            fail(error)
          })
      })
      */

      // Testes no Login
      test("POST - Deve retornar 400, por não ter informado o Email para Login.", function() {

        const user = {
          password: "@TobiaS&591022@",
        }

        return request.post(endpoints.toLogin).send(user)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("1")
            expect(response.body.RestException.Message).toBe("O campo Email é obrigatório")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptEmail')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('O campo Email é obrigatório')
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 404, por ter informado um Email, para Login, que não foi cadastrado anteriormente.", function() {

        const user = {
          email: "tobia@gmail.com",
          password: "@TobiaS&591022@"
        }

        return request.post(endpoints.toLogin).send(user)
          .then(function(response) {
            expect(response.statusCode).toEqual(404)

            expect(response.body.RestException.Code).toBe("3")
            expect(response.body.RestException.Message).toBe("O Email informado não está cadastrado")
            expect(response.body.RestException.Status).toBe("404")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/3`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptEmail')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O Email informado não está cadastrado")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 400, por não ter informado uma senha para Login.", function() {

        const user = {
          email: "tobias@gmail.com"
        }

        return request.post(endpoints.toLogin).send(user)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("1")
            expect(response.body.RestException.Message).toBe("O campo de Senha é obrigatório")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptPassword')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de Senha é obrigatório")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      // Testes de Listagem
      test("POST - Deve retornar 401, por tentar acessar a listagem de Usuários sem estar AUTORIZADO.", function() {

        return request.get(endpoints.toList)
          .then(function(responseList) {
            expect(responseList.statusCode).toEqual(401)
            expect(responseList.body.RestException.Code).toBe('5')
            expect(responseList.body.RestException.Message).toBe('O usuário não está autorizado')
            expect(responseList.body.RestException.Status).toBe('401')
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/5`)
          })
          .catch(function(errorList) {
            fail(errorList)
          })
      })

      test("POST - Deve retornar 403, por tentar acessar a listagem de Usuários sem estar AUTENTICADO.", function() {

        return request.get(endpoints.toList).set('Authorization', tokens.cliente)
          .then(function(responseList) {
            expect(responseList.statusCode).toEqual(403)
            expect(responseList.body.RestException.Code).toBe('6')
            expect(responseList.body.RestException.Message).toBe('O usuário não está autenticado')
            expect(responseList.body.RestException.Status).toBe('403')
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/6`)
          })
          .catch(function(errorList) {
            fail(errorList)
          })
      })

      test("POST - Deve retornar 401, por tentar buscar um Usuários pelo CPF sem estar AUTORIZADO.", function() {

        const info = {
          cpf: '11111111111'
        }

        return request.post(endpoints.toSearch).send(info)
          .then(function(responseList) {
            expect(responseList.statusCode).toEqual(401)
            expect(responseList.body.RestException.Code).toBe('5')
            expect(responseList.body.RestException.Message).toBe('O usuário não está autorizado')
            expect(responseList.body.RestException.Status).toBe('401')
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/5`)
          })
          .catch(function(errorList) {
            fail(errorList)
          })
      })

      test("POST - Deve retornar 403, por tentar buscar um Usuários pelo CPF sem estar AUTENTICADO.", function() {

        const info = {
          cpf: '11111111111'
        }

        return request.post(endpoints.toSearch).send(info).set('Authorization', tokens.cliente)
          .then(function(responseList) {
            expect(responseList.statusCode).toEqual(403)
            expect(responseList.body.RestException.Code).toBe('6')
            expect(responseList.body.RestException.Message).toBe('O usuário não está autenticado')
            expect(responseList.body.RestException.Status).toBe('403')
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/6`)
          })
          .catch(function(errorList) {
            fail(errorList)
          })
      })

      // Testes das Rotas de Views (Admin)
      /*
      test("Deve retornar 401, para visualização das informações de um cliente, não estar AUTORIZADO", function() {
        return request.get(`${ endpoints.toView }/5da9ea674234635bdff45c02`)
          .then(function(response) {
            expect(response.statusCode).toEqual(401)
            expect(response.body.RestException.Code).toBe('5')
            expect(response.body.RestException.Message).toBe('O usuário não está autorizado')
            expect(response.body.RestException.Status).toBe('401')
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/5`)
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("Deve retornar 403, para visualização das informações de um cliente, não estar AUTENTICADO", function() {
        return request.get(`${ endpoints.toView }/5da9ea674234635bdff45c02`).set('Authorization', tokens.cliente)
          .then(function(response) {
            expect(response.statusCode).toEqual(403)
            expect(response.body.RestException.Code).toBe('6')
            expect(response.body.RestException.Message).toBe('O usuário não está autenticado')
            expect(response.body.RestException.Status).toBe('403')
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/6`)
          })
          .catch(function(error) {
            fail(error)
          })
      })
      */
    })
  })

  describe("UPDATE", function() {
    describe("Testes de SUCESSO.", function() {
      test("PUT - Deve retornar 200 e o usuário Brasileiro com suas informações atualizadas.", function() {

        const login = {
          email: "doralice@yahoo.com",
          password: "oiqwuerowq#&134890OIU@",
        }

        // Antes de fazer a atualização, é feito o Login.
        return request.post(`${ endpoints.toLogin }`).send(login)
          .then(function(responseLogin) {
            expect(responseLogin.statusCode).toEqual(200)

            let user = {
              id: responseLogin.body._links[0].href.split('/').pop(),
              email: "doralice@gmail.com",
              phoneNumber: "2129982222",
              country: "US",
              state: "OH",
              city: "Columbus"
            }

            // Envia o token do login para a rota de atualização, junto com as informações.
            return request.put(endpoints.toUpdate).send(user).set('Authorization', `Bearer ${ responseLogin.body.token }`)
              .then(function(responseUpdate) {
                expect(responseUpdate.statusCode).toEqual(200)

                expect(responseUpdate.body._links).toBeDefined()
                expect(responseUpdate.body._links).toHaveLength(3)

                // Utilizando o ADMIN para verificar se as informações foram atualizadas.
                /*
                return request.get(`${ endpoints.toView }/${ user.id }`).set('Authorization', tokens.admin)
                  .then(function(responseView) {
                    expect(responseView.statusCode).toEqual(200)

                    const {
                      id,
                      email,
                      phoneNumber,
                      country,
                      state,
                      city
                    } = responseView.body

                    expect(id).toBe(user.id)
                    expect(email).toBe(user.email)
                    expect(phoneNumber).toBe(user.phoneNumber)
                    expect(country).toBe(user.country)
                    expect(state).toBe(user.state)
                    expect(city).toBe(user.city)
                  })
                  .catch(function(errorGET) {
                    fail(errorGET)
                  })
              */
              })
              .catch(function(errorPOST) {
                fail(errorPOST)
              })
          })
          .catch(function(errorLogin) {
            fail(errorLogin)
          })
      })
      /*
      
      test("PUT - Deve retornar 200 e o usuário Brasileiro com suas informações obrigatórias e opcionais/condicionais atualizadas.", function() {
        let user = {
          id: "507f1f77bcf86cd799439011",
          name: "Macunaíma Cruz",
          email: "macuna_cruz@hotmail.com",
          password: "Y07f1#6cd7Y9439011@",
          role: "0",
          phoneCode: "21",
          phoneNumber: "994755654",
          birthDate: "1995-08-03",
          country: "BR",
          state: "RJ",
          cep: "21051990",
          city: "Rio de Janeiro",
          cpf: `${ fixedCPF }`,
          neighborhood: "Bairro: Março 29",
          road: "Rua 29 de março",
          house_number: "2300",
          information: "Vivamus vitae turpis fermentum, scelerisque neque eget, aliquet nibh. In consequat, urna quis rhoncus fringilla, elit nisi tincidunt metus, a tempus nibh turpis vel orci. Sed a tellus ac odio viverra blandit. Aenean neque odio, vulputate eget quam eu, commodo aliquam sem. Integer efficitur magna vel aliquam luctus. Interdum et malesuada fames ac ante ipsum primis in faucibus. Integer mollis tempor libero, a gravida orci suscipit eu. Morbi cursus odio in tempus tincidunt. Nulla facilisi."

        }
        return request.put(endpoints.toUpdate).send(user)
          .then(function(responsePUT) {
            expect(responsePUT.statusCode).toEqual(200)

            expect(responsePUT.body._links).toBeDefined()
            expect(responsePUT.body._links).toHaveLength(4)
            expect(responsePUT.body._links[0]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'GET',
              rel: 'self_user'
            })
            expect(responsePUT.body._links[1]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'PUT',
              rel: 'edit_user'
            })
            expect(responsePUT.body._links[2]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'DELETE',
              rel: 'delete_user'
            })
            expect(responsePUT.body._links[3]).toMatchObject({
              href: `${ baseURL }/users`,
              method: 'GET',
              rel: 'user_list'
            })

            return request.get(`${ endpoints.toRead }/${ user.id }`)
              .then(function(responseGET) {
                expect(responseGET.statusCode).toEqual(200)

                expect(responseGET.body.name).toBeDefined()
                expect(responseGET.body.name).toBe(user.name)

                expect(responseGET.body.email).toBeDefined()
                expect(responseGET.body.email).toBe(user.email)

                expect(responseGET.body.role).toBeDefined()
                expect(responseGET.body.role).toBe(user.role)

                expect(responseGET.body.phoneCode).toBeDefined()
                expect(responseGET.body.phoneCode).toBe(user.phoneCode)

                expect(responseGET.body.phoneNumber).toBeDefined()
                expect(responseGET.body.phoneNumber).toBe(user.phoneNumber)

                expect(responseGET.body.birthDate).toBeDefined()
                expect(responseGET.body.birthDate).toBe(user.birthDate)

                expect(responseGET.body.country).toBeDefined()
                expect(responseGET.body.country).toBe(user.country)

                expect(responseGET.body.state).toBeDefined()
                expect(responseGET.body.state).toBe(user.state)

                expect(responseGET.body.city).toBeDefined()
                expect(responseGET.body.city).toBe(user.city)

                expect(responseGET.body.cpf).toBeDefined()
                expect(responseGET.body.cpf).toBe(user.cpf)

                expect(responseGET.body.neighborhood).toBeDefined()
                expect(responseGET.body.neighborhood).toBe(user.neighborhood)

                expect(responseGET.body.road).toBeDefined()
                expect(responseGET.body.road).toBe(user.road)

                expect(responseGET.body.house_number).toBeDefined()
                expect(responseGET.body.house_number).toBe(user.house_number)

                expect(responseGET.body.information).toBeDefined()
                expect(responseGET.body.information).toBe(user.information)
              })
              .catch(function(errorGET) {
                fail(errorGET)
              })
          })
          .catch(function(errorPOST) {
            fail(errorPOST)
          })
      })

      test("PUT - Deve retornar 200 para usuários Brasileiro que não querem atualizar o CPF.", function() {
        let user = {
          id: "5da9ea674234635bdff45c02",
          name: "Josias de Oliveira",
          email: "joz_cruz@gmail.com",
          password: "@JosiaS&654975@",
          role: '0',
          phoneCode: "55",
          phoneNumber: "11984222222",
          birthDate: "1970-06-11",
          country: "BR",
          state: "SP",
          city: "São Paulo"
        }
        return request.put(endpoints.toUpdate).send(user)
          .then(function(responsePUT) {
            expect(responsePUT.statusCode).toEqual(200)

            expect(responsePUT.body._links).toBeDefined()
            expect(responsePUT.body._links).toHaveLength(4)
            expect(responsePUT.body._links[0]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'GET',
              rel: 'self_user'
            })
            expect(responsePUT.body._links[1]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'PUT',
              rel: 'edit_user'
            })
            expect(responsePUT.body._links[2]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'DELETE',
              rel: 'delete_user'
            })
            expect(responsePUT.body._links[3]).toMatchObject({
              href: `${ baseURL }/users`,
              method: 'GET',
              rel: 'user_list'
            })

            return request.get(`${ endpoints.toRead }/${ user.id }`)
              .then(function(responseGET) {
                expect(responseGET.statusCode).toEqual(200)

                expect(responseGET.body.name).toBeDefined()
                expect(responseGET.body.name).toBe(user.name)

                expect(responseGET.body.email).toBeDefined()
                expect(responseGET.body.email).toBe(user.email)

                expect(responseGET.body.password).toBeDefined()
                expect(responseGET.body.password).toBe(user.password)

                expect(responseGET.body.role).toBeDefined()
                expect(responseGET.body.role).toBe(user.role)

                expect(responseGET.body.phoneCode).toBeDefined()
                expect(responseGET.body.phoneCode).toBe(user.phoneCode)

                expect(responseGET.body.phoneNumber).toBeDefined()
                expect(responseGET.body.phoneNumber).toBe(user.phoneNumber)

                expect(responseGET.body.birthDate).toBeDefined()
                expect(responseGET.body.birthDate).toBe(user.birthDate)

                expect(responseGET.body.country).toBeDefined()
                expect(responseGET.body.country).toBe(user.country)

                expect(responseGET.body.state).toBeDefined()
                expect(responseGET.body.state).toBe(user.state)

                expect(responseGET.body.city).toBeDefined()
                expect(responseGET.body.city).toBe(user.city)
              })
              .catch(function(errorGET) {

              })
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("PUT - Deve retornar 200 para usuários Brasileiro que não querem atualizar o CPF e Cidade.", function() {
        let user = {
          id: "5da9ea674234635bdff45c02",
          name: "Josias de Oliveira",
          email: "joz_cruz_de_oliveira@gmail.com",
          password: "@JosiaS&654975@",
          role: '0',
          phoneCode: "55",
          phoneNumber: "11984222222",
          birthDate: "1970-06-11"
        }
        return request.put(endpoints.toUpdate).send(user)
        .then(function(responsePUT) {
          expect(responsePUT.statusCode).toEqual(200)

          expect(responsePUT.body._links).toBeDefined()
            expect(responsePUT.body._links).toHaveLength(4)
            expect(responsePUT.body._links[0]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'GET',
              rel: 'self_user'
            })
            expect(responsePUT.body._links[1]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'PUT',
              rel: 'edit_user'
            })
            expect(responsePUT.body._links[2]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'DELETE',
              rel: 'delete_user'
            })
            expect(responsePUT.body._links[3]).toMatchObject({
              href: `${ baseURL }/users`,
              method: 'GET',
              rel: 'user_list'
            })

          return request.get(`${ endpoints.toRead }/${ user.id }`)
            .then(function(responseGET) {
              expect(responseGET.statusCode).toEqual(200)

              expect(responseGET.body.name).toBeDefined()
              expect(responseGET.body.name).toBe(user.name)

              expect(responseGET.body.email).toBeDefined()
              expect(responseGET.body.email).toBe(user.email)

              expect(responseGET.body.password).toBeDefined()
              expect(responseGET.body.password).toBe(user.password)

              expect(responseGET.body.role).toBeDefined()
              expect(responseGET.body.role).toBe(user.role)

              expect(responseGET.body.phoneCode).toBeDefined()
              expect(responseGET.body.phoneCode).toBe(user.phoneCode)

              expect(responseGET.body.phoneNumber).toBeDefined()
              expect(responseGET.body.phoneNumber).toBe(user.phoneNumber)

              expect(responseGET.body.birthDate).toBeDefined()
              expect(responseGET.body.birthDate).toBe(user.birthDate)
            })
            .catch(function(errorGET) {
              fail(errorGET)
            })
        })
        .catch(function(errorPOST) {
          fail(error)
        })
      })

      test("PUT - Deve retornar 200 para usuários Brasileiro que não querem atualizar o CPF, Local e Data de Nascimento.", function() {
        let user = {
          id: "5da9ea674234635bdff45c02",
          name: "Josias de Oliveira",
          email: "joz_cruz_de_oliveir@gmail.com",
          password: "@JosiaS&654975@",
          role: '0',
          phoneCode: "55",
          phoneNumber: "11984222222"
        }
        return request.put(endpoints.toUpdate).send(user)
          .then(function(responsePUT) {
            expect(responsePUT.statusCode).toEqual(200)

            expect(responsePUT.body._links).toBeDefined()
            expect(responsePUT.body._links).toHaveLength(4)
            expect(responsePUT.body._links[0]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'GET',
              rel: 'self_user'
            })
            expect(responsePUT.body._links[1]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'PUT',
              rel: 'edit_user'
            })
            expect(responsePUT.body._links[2]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'DELETE',
              rel: 'delete_user'
            })
            expect(responsePUT.body._links[3]).toMatchObject({
              href: `${ baseURL }/users`,
              method: 'GET',
              rel: 'user_list'
            })

            return request.get(`${ endpoints.toRead }/${ user.id }`)
              .then(function(responseGET) {
                expect(responseGET.statusCode).toEqual(200)

                expect(responseGET.body.name).toBeDefined()
                expect(responseGET.body.name).toBe(user.name)

                expect(responseGET.body.email).toBeDefined()
                expect(responseGET.body.email).toBe(user.email)

                expect(responseGET.body.password).toBeDefined()
                expect(responseGET.body.password).toBe(user.password)

                expect(responseGET.body.role).toBeDefined()
                expect(responseGET.body.role).toBe(user.role)

                expect(responseGET.body.phoneCode).toBeDefined()
                expect(responseGET.body.phoneCode).toBe(user.phoneCode)

                expect(responseGET.body.phoneNumber).toBeDefined()
                expect(responseGET.body.phoneNumber).toBe(user.phoneNumber)
              })
              .catch(function(errorGET) {
                fail(errorGET)
              })
          })
          .catch(function(errorPOST) {
            fail(errorPOST)
          })
      })
      test("PUT - Deve retornar 200 para usuários Brasileiro que querem atualizar somente o Nome, Email, Senha e Função.", function() {
        let user = {
          id: "5da9ea674234635bdff45c02",
          name: "Josias de Oliveira",
          email: "Oliveira_jo@yahoo.com",
          password: "@JosiaS&654975@",
          role: '1'
        }
        return request.put(endpoints.toUpdate).send(user)
          .then(function(responsePUT) {
            expect(responsePUT.statusCode).toEqual(200)

            expect(responsePUT.body._links).toBeDefined()
            expect(responsePUT.body._links).toHaveLength(4)
            expect(responsePUT.body._links[0]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'GET',
              rel: 'self_user'
            })
            expect(responsePUT.body._links[1]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'PUT',
              rel: 'edit_user'
            })
            expect(responsePUT.body._links[2]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'DELETE',
              rel: 'delete_user'
            })
            expect(responsePUT.body._links[3]).toMatchObject({
              href: `${ baseURL }/users`,
              method: 'GET',
              rel: 'user_list'
            })

            return request.get(`${ endpoints.toRead }/${ user.id }`)
              .then(function(responseGET) {
                expect(responseGET.statusCode).toEqual(200)

                expect(responseGET.body.name).toBeDefined()
                expect(responseGET.body.name).toBe(user.name)

                expect(responseGET.body.email).toBeDefined()
                expect(responseGET.body.email).toBe(user.email)

                expect(responseGET.body.password).toBeDefined()
                expect(responseGET.body.password).toBe(user.password)

                expect(responseGET.body.role).toBeDefined()
                expect(responseGET.body.role).toBe(user.role)
              })
              .catch(function(errorGET) {
                fail(errorGET)
              })
          })
          .catch(function(errorPOST) {
            fail(errorPOST)
          })
      })

      test("PUT - Deve retornar 200 para usuários Brasileiro que querem atualizar somente o Nome, Senha e Função.", function() {
        let user = {
          id: "5da9ea674234635bdff45c02",
          name: "Josias de Oliveira",
          password: "@JosiaS&654975@",
          role: '1'
        }
        return request.put(endpoints.toUpdate).send(user)
          .then(function(responsePUT) {
            expect(responsePUT.statusCode).toEqual(200)

            expect(responsePUT.body._links).toBeDefined()
            expect(responsePUT.body._links).toHaveLength(4)
            expect(responsePUT.body._links[0]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'GET',
              rel: 'self_user'
            })
            expect(responsePUT.body._links[1]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'PUT',
              rel: 'edit_user'
            })
            expect(responsePUT.body._links[2]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'DELETE',
              rel: 'delete_user'
            })
            expect(responsePUT.body._links[3]).toMatchObject({
              href: `${ baseURL }/users`,
              method: 'GET',
              rel: 'user_list'
            })

            return request.get(`${ endpoints.toRead }/${ user.id }`)
              .then(function(responseGET) {
                expect(responseGET.statusCode).toEqual(200)

                expect(responseGET.body.name).toBeDefined()
                expect(responseGET.body.name).toBe(user.name)

                expect(responseGET.body.password).toBeDefined()
                expect(responseGET.body.password).toBe(user.password)

                expect(responseGET.body.role).toBeDefined()
                expect(responseGET.body.role).toBe(user.role)
              })
              .catch(function(errorGET) {
                fail(errorGET)
              })
          })
          .catch(function(errorPOST) {
            fail(errorPOST)
          })
      })

      test("PUT - Deve retornar 200 para usuários Brasileiro que querem atualizar somente o Nome e Senha.", function() {
        let user = {
          id: "5da9ea674234635bdff45c02",
          name: "Josias de Oliveira",
          password: "@JosiaS&654975@"
        }
        return request.put(endpoints.toUpdate).send(user)
          .then(function(responsePUT) {
            expect(responsePUT.statusCode).toEqual(200)

            expect(responsePUT.body._links).toBeDefined()
            expect(responsePUT.body._links).toHaveLength(4)
            expect(responsePUT.body._links[0]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'GET',
              rel: 'self_user'
            })
            expect(responsePUT.body._links[1]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'PUT',
              rel: 'edit_user'
            })
            expect(responsePUT.body._links[2]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'DELETE',
              rel: 'delete_user'
            })
            expect(responsePUT.body._links[3]).toMatchObject({
              href: `${ baseURL }/users`,
              method: 'GET',
              rel: 'user_list'
            })
            return request.get(`${ endpoints.toRead }/${ user.id }`)
              .then(function(responseGET) {
                expect(responseGET.statusCode).toEqual(200)

                expect(responseGET.body.name).toBeDefined()
                expect(responseGET.body.name).toBe(user.name)

                expect(responseGET.body.password).toBeDefined()
                expect(responseGET.body.password).toBe(user.password)
              })
              .catch(function(errorGET) {
                fail(errorGET)
              })
          })
          .catch(function(errorPOST) {
            fail(errorPOST)
          })
      })

      test("PUT - Deve retornar 200 para usuários que querem atualizar somente o Nome.", function() {
        let user = {
          id: "5da9ea674234635bdff45c02",
          name: "Josias de Oliveira Cruz"
        }
        return request.put(endpoints.toUpdate).send(user)
          .then(function(responsePUT) {
            expect(responsePUT.statusCode).toEqual(200)

            expect(responsePUT.body._links).toBeDefined()
            expect(responsePUT.body._links).toHaveLength(4)
            expect(responsePUT.body._links[0]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'GET',
              rel: 'self_user'
            })
            expect(responsePUT.body._links[1]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'PUT',
              rel: 'edit_user'
            })
            expect(responsePUT.body._links[2]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'DELETE',
              rel: 'delete_user'
            })
            expect(responsePUT.body._links[3]).toMatchObject({
              href: `${ baseURL }/users`,
              method: 'GET',
              rel: 'user_list'
            })
            return request.get(`${ endpoints.toRead }/${ user.id }`)
              .then(function(responseGET) {
                expect(responseGET.statusCode).toEqual(200)

                expect(responseGET.body.name).toBeDefined()
                expect(responseGET.body.name).toBe(user.name)
              })
              .catch(function(errorGET) {
                fail(errorGET)
              })
          })
          .catch(function(errorPOST) {
            fail(errorPOST)
          })
      })

      test("PUT - Deve retornar 200 para usuários que informa o mesmo Email.", function() {
        let user = {
          id: "507f191e810c19729de860ea",
          name: "John Smith John",
          email: "john_sm@hotmail.com"
        }
        return request.put(endpoints.toUpdate).send(user)
          .then(function(response) {
            expect(response.statusCode).toEqual(200)

            expect(response.body._links).toBeDefined()
            expect(response.body._links).toHaveLength(4)
            expect(response.body._links[0]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'GET',
              rel: 'self_user'
            })
            expect(response.body._links[1]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'PUT',
              rel: 'edit_user'
            })
            expect(response.body._links[2]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'DELETE',
              rel: 'delete_user'
            })
            expect(response.body._links[3]).toMatchObject({
              href: `${ baseURL }/users`,
              method: 'GET',
              rel: 'user_list'
            })
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("PUT - Deve retornar 200 para usuários que informa o mesmo CPF.", function() {
        let user = {
          id: "507f1f77bcf86cd799439011",
          name: "Macunaíma Cruz",
          email: "macuna_curz@hotmail.com",
          cpf: `${ fixedCPF }`,
        }
        return request.put(endpoints.toUpdate).send(user)
          .then(function(response) {
            expect(response.statusCode).toEqual(200)

            expect(response.body._links).toBeDefined()
            expect(response.body._links).toHaveLength(4)
            expect(response.body._links[0]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'GET',
              rel: 'self_user'
            })
            expect(response.body._links[1]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'PUT',
              rel: 'edit_user'
            })
            expect(response.body._links[2]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'DELETE',
              rel: 'delete_user'
            })
            expect(response.body._links[3]).toMatchObject({
              href: `${ baseURL }/users`,
              method: 'GET',
              rel: 'user_list'
            })
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("PUT - Deve retornar 200 para o usuário Brasileiro que modifica seu local de nascimento e informa o Número do Passaporte.", function() {
        let user = {
          id: "5da9ea674234635bdff45c02",
          name: "Jeremias de Oliveira",
          email: "jere_oli@yahoo.com",
          country: "US",
          state: "MN",
          city: "Saint Paul",
          passportNumber: fixedPassportNumber,
        }
        return request.put(endpoints.toUpdate).send(user)
          .then(function(responsePUT) {
            expect(responsePUT.statusCode).toEqual(200)

            expect(responsePUT.body._links).toBeDefined()
            expect(responsePUT.body._links).toHaveLength(4)
            expect(responsePUT.body._links[0]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'GET',
              rel: 'self_user'
            })
            expect(responsePUT.body._links[1]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'PUT',
              rel: 'edit_user'
            })
            expect(responsePUT.body._links[2]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'DELETE',
              rel: 'delete_user'
            })
            expect(responsePUT.body._links[3]).toMatchObject({
              href: `${ baseURL }/users`,
              method: 'GET',
              rel: 'user_list'
            })
            return request.get(`${ endpoints.toRead }/${ user.id }`)
              .then(function(responseGET) {
                const {
                  id,
                  name,
                  email,
                  country,
                  state,
                  city,
                  cpf,
                  passportNumber
                } = responseGET.body

                // ID
                expect(id).toBeDefined()
                expect(id).toBe(user.id)

                // Nome
                expect(name).toBeDefined()
                expect(name).toBe(user.name)

                // Email
                expect(email).toBeDefined()
                expect(email).toBe(user.email)

                // País de nascimento
                expect(country).toBeDefined()
                expect(country).toBe(user.country)

                // Estado de nascimento
                expect(state).toBeDefined()
                expect(state).toBe(user.state)

                // Cidade de nascimento
                expect(city).toBeDefined()
                expect(city).toBe(user.city)

                // CPF
                expect(cpf).toBeDefined()
                expect(cpf).toBe('')

                // Número do passaporte
                expect(passportNumber).toBeDefined()
                expect(passportNumber).toBe(user.passportNumber)
              })
              .catch(function(errorGET) {
                fail(errorGET)
              })
          })
          .catch(function(errorPUT) {
            fail(errorPUT)
          })
      })

      test("PUT - Deve retornar 200 para usuários que informa o mesmo Número de Passaporte.", function() {
        let user = {
          id: "507f191e810c19729de860ea",
          name: "John Smith John",
          email: "john_sms@hotmail.com",
          passportNumber: "303004786",
        }
        return request.put(endpoints.toUpdate).send(user)
          .then(function(response) {
            expect(response.statusCode).toEqual(200)

            expect(response.body._links).toBeDefined()
            expect(response.body._links).toHaveLength(4)
            expect(response.body._links[0]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'GET',
              rel: 'self_user'
            })
            expect(response.body._links[1]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'PUT',
              rel: 'edit_user'
            })
            expect(response.body._links[2]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'DELETE',
              rel: 'delete_user'
            })
            expect(response.body._links[3]).toMatchObject({
              href: `${ baseURL }/users`,
              method: 'GET',
              rel: 'user_list'
            })
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("PUT - Deve retornar 200 para o usuário estrangeiro que modifica seu local de nascimento e informa o CPF.", function() {
        const fixedForeignCPF = Generator.genCPF()
        let user = {
          id: "507f191e810c19729de860ea",
          name: "John Smith",
          email: "john_sm@hotmail.com",
          country: "BR",
          state: "AM",
          city: "Manaus",
          cpf: fixedForeignCPF,
        }
        return request.put(endpoints.toUpdate).send(user)
          .then(function(responsePUT) {
            expect(responsePUT.statusCode).toEqual(200)

            expect(responsePUT.body._links).toBeDefined()
            expect(responsePUT.body._links).toHaveLength(4)
            expect(responsePUT.body._links[0]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'GET',
              rel: 'self_user'
            })
            expect(responsePUT.body._links[1]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'PUT',
              rel: 'edit_user'
            })
            expect(responsePUT.body._links[2]).toMatchObject({
              href: `${ baseURL }/users/${ user.id }`,
              method: 'DELETE',
              rel: 'delete_user'
            })
            expect(responsePUT.body._links[3]).toMatchObject({
              href: `${ baseURL }/users`,
              method: 'GET',
              rel: 'user_list'
            })
            return request.get(`${ endpoints.toRead }/${ user.id }`)
              .then(function(responseGET) {
                const {
                  id,
                  name,
                  email,
                  country,
                  state,
                  city,
                  cpf,
                  passportNumber
                } = responseGET.body

                // ID
                expect(id).toBeDefined()
                expect(id).toBe(user.id)

                // Nome
                expect(name).toBeDefined()
                expect(name).toBe(user.name)

                // Email
                expect(email).toBeDefined()
                expect(email).toBe(user.email)

                // País de nascimento
                expect(country).toBeDefined()
                expect(country).toBe(user.country)

                // Estado de nascimento
                expect(state).toBeDefined()
                expect(state).toBe(user.state)

                // Cidade de nascimento
                expect(city).toBeDefined()
                expect(city).toBe(user.city)

                // CPF
                expect(cpf).toBeDefined()
                expect(cpf).toBe(user.cpf)

                // Número do passaporte
                expect(passportNumber).toBeDefined()
                expect(passportNumber).toBe('')
              })
              .catch(function(errorGET) {
                fail(errorGET)
              })
          })
          .catch(function(errorPUT) {
            fail(errorPUT)
          })
      })
      */
    })
    describe("Testes de FALHA.", function() {
      /*
      test("POST - Deve retornar 404, já que o ID não correponde a um usuário cadastrado.", function() {
        const user = {
          id: "5da9ea674234635bdff45d22",
          name: "Tobias de Oliveira",
          email: "tobias_atualizado@hotmail.com"
        }
        return request.put(endpoints.toUpdate).send(user)
          .then(function(response) {
            expect(response.statusCode).toEqual(404)
            expect(response.body.RestException.Code).toBe("3")
            expect(response.body.RestException.Message).toBe("Nenhum usuário com o ID informado está cadastrado")
            expect(response.body.RestException.Status).toBe("404")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/3`)
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 400, já que o usuário não mudou seu local de nascimento para Brasil.", function() {
        const user = {
          id: "600f191e810c19829de900ea",
          name: "Michael Ronald",
          email: "mi_ronald@gmail.com",
          cpf: `${ Generator.genCPF() }`
        }
        return request.put(endpoints.toUpdate).send(user)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("1")
            expect(response.body.RestException.Message).toBe("O campo de País de Nascimento é obrigatório")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 400, já que o usuário não mudou seu local de nascimento para um país estrangeiro.", function() {
        const user = {
          id: "507f1f77bcf86cd799439011",
          name: "Macunaíma Cruz",
          email: "macuna_curz@hotmail.com",
          passportNumber: `${ Generator.genPassportNumber() }`
        }
        return request.put(endpoints.toUpdate).send(user)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("1")
            expect(response.body.RestException.Message).toBe("O campo de País de Nascimento é obrigatório")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 400, já que o email informado já está cadastrado e NÃO pertence ao usuário que está sendo atualizado.", function() {
        const user = {
          id: "507f191e810c19729de860ea",
          name: "Tobias de Oliveira",
          email: "macuna_curz@hotmail.com"
        }
        return request.put(endpoints.toUpdate).send(user)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("4")
            expect(response.body.RestException.Message).toBe("O Email informado já foi cadastrado anteriormente")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/4`)
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 400, já que o número do CPF já está cadastrado e NÃO pertence ao usuário que está sendo atualizado.", function() {
        const user = {
          id: "5da9ea674234635bdff45c02",
          name: "Jeremias de Oliveira",
          email: "jere_oliveira@yahoo.com",
          country: "BR",
          state: "PA",
          city: "Belém",
          cpf: fixedCPF
        }
        return request.put(endpoints.toUpdate).send(user)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("4")
            expect(response.body.RestException.Message).toBe("O CPF informado já está cadastrado")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/4`)
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("POST - Deve retornar 400, já que o Número do Passaporte já está cadastrado e NÃO pertence ao usuário que está sendo atualizado.", function() {
        const user = {
          id: "507f191e810c19729de860ea",
          name: "John Smith",
          email: "john_sm@hotmail.com",
          country: "US",
          state: "NY",
          city: "New York City",
          passportNumber: fixedPassportNumber
        }
        return request.put(endpoints.toUpdate).send(user)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("4")
            expect(response.body.RestException.Message).toBe("Passport number already registred")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/4`)
          })
          .catch(function(error) {
            fail(error)
          })
      })
      */

      test("POST - Deve retornar 401, já que o usuário NÃO está AUTORIZADO.", function() {
        const user = {
          id: "507f191e810c19729de860ea",
          name: "John Smith",
          email: "john_sm@hotmail.com",
          country: "US",
          state: "NY",
          city: "New York City",
          passportNumber: fixedPassportNumber
        }
        return request.put(endpoints.toUpdate).send(user)
          .then(function(response) {
            expect(response.statusCode).toEqual(401)
            expect(response.body.RestException.Code).toBe('5')
            expect(response.body.RestException.Message).toBe('O usuário não está autorizado')
            expect(response.body.RestException.Status).toBe('401')
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/5`)
          })
          .catch(function(error) {
            fail(error)
          })
      })
    })
  })
  describe("DELETE", function() {
    /*
    describe("Testes de SUCESSO.", function() {
      test("DELETE - Deve retornar 200.", function() {
        return request.delete(`${ endpoints.toDelete }/507f191e810c19729de860ea`)
          .then(function(responseDelete) {
            expect(responseDelete.statusCode).toEqual(200)
          })
          .catch(function(error) {
            fail(error)
          })
      })
    })
    */
    describe("Testes de FALHA.", function() {
      test("DELETE - Deve retornar 401, já que ninguém está logado.", function() {
        return request.delete(`${ endpoints.toDelete }/d9d62beecdde62af82efd82c`)
          .then(function(responseDelete) {

            expect(responseDelete.statusCode).toEqual(401)

            expect(responseDelete.body.RestException.Code).toBe('5')
            expect(responseDelete.body.RestException.Message).toBe('O usuário não está autorizado')
            expect(responseDelete.body.RestException.Status).toBe('401')
            expect(responseDelete.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/5`)

            
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("DELETE - Deve retornar 403, já que ninguém está logado.", function() {
        return request.delete(`${ endpoints.toDelete }/02n07j2d1hf5a2f26djjj92a`).set('Authorization', tokens.cliente)
          .then(function(responseDelete) {

            expect(responseDelete.statusCode).toEqual(403)

            expect(responseDelete.body.RestException.Code).toBe('6')
            expect(responseDelete.body.RestException.Message).toBe('O usuário não está autenticado')
            expect(responseDelete.body.RestException.Status).toBe('403')
            expect(responseDelete.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/6`)
          })
          .catch(function(error) {
            fail(error)
          })
      })

      /*
      test("DELETE - Deve retornar 404 pelo ID não corresponder a um usuário.", function() {
        return request.delete(`${ endpoints.toDelete }/507f191e810c19729de86444`)
          .then(function(response) {
            expect(response.statusCode).toEqual(404)
            expect(response.body.RestException.Code).toBe('3')
            expect(response.body.RestException.Message).toBe('Nenhum usuário com o ID informado está cadastrado')
            expect(response.body.RestException.Status).toBe('404')
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/3`)
            expect(response.body.RestException.ErrorFields.field).toBe('iptClient')
            expect(response.body.RestException.ErrorFields.hasError.error).toBe('Nenhum usuário com o ID informado está cadastrado')
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("DELETE - Deve retornar 400, uma vez que o ID tem uma estrutura inválida.", function() {
        return request.delete(`${ endpoints.toDelete }/91e810*c19729de8644-`)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe('2')
            expect(response.body.RestException.Message).toBe('O ID do cliente/usuário contém caracteres inválidos')
            expect(response.body.RestException.Status).toBe('400')
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(response.body.RestException.ErrorFields.field).toBe('iptClient')
            expect(response.body.RestException.ErrorFields.hasError.error).toBe('O ID do cliente/usuário contém caracteres inválidos')
          })
          .catch(function(error) {
            fail(error)
          })
      })
      */
    })
  })
})