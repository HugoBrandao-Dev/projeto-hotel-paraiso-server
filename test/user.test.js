const app = require('../src/app')
const supertest = require('supertest')
const Generator = require('../src/tools/Generator')

const EndPoints = require('../src/routes/endpoints')
const endpoints = new EndPoints({ singular: 'user', plural: 'users' })

const request = supertest(app)

let baseURL = 'http://localhost:4000'
const projectLinks = {
  errors: 'https://projetohotelparaiso.dev/docs/erros'
}

let accounts = {
  cliente: {
    id: '',
    name: '',
    token: ''
  },
  cliente2: {
    id: '',
    name: '',
    token: ''
  },
  funcionario: {
    id: '',
    name: '',
    token: ''
  },
  funcionario2: {
    id: '',
    name: '',
    token: ''
  },
  gerente: {
    id: '',
    name: '',
    token: ''
  },  
  gerente2: {
    id: '',
    name: '',
    token: ''
  },
  gerente3: {
    id: '',
    name: '',
    token: ''
  },
  admin: {
    id: '',
    name: '',
    token: ''
  }
}


// Aumenta o tempo máximo para resposta - o padrão é 5000ms.
jest.setTimeout(100000)

function extractUserID(link) {
  return link.split('/').slice(-1)[0]
}

function register(user) {
  return new Promise((resolve, reject) => {
    return request.post(endpoints.toCreate).send(user)
      .then(response => {
        if (response.statusCode == 201) {

          let id = response.body._links[0].href.split('/').pop()
          let name = user.name
          let login = {
            email: user.email,
            password: user.password
          }
          resolve({ id, name, login })

        } else {
          reject(response.body.RestException.Message)
        }

      })
      .catch(error => {
        reject(error)
      })
  })
}

function login(login) {
  return new Promise((resolve, reject) => {
    return request.post(endpoints.toLogin).send(login)
      .then(response => {
        if (response.statusCode == 200) {
          resolve({ token: response.body.token })
        } else {
          reject(response.body.RestException.Message)
        }
      })
      .catch(error => {
        reject(error)
      })
  })
}

function updateRole(userID, role) {

  return new Promise((resolve, reject) => {

    return request.put(endpoints.toUpdate).send({
      id: userID,
      role
    }).set('Authorization', accounts.admin.token)
      .then(function(response) {

        if (response.statusCode == 200) {
          resolve(true)
        } else {
          reject(response.body.RestException.Message)
        }

      })
      .catch(function(error) {
        reject(error)
      })

  })

}

beforeAll(async () => {
  try {

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
      let registredAdmin = await register(userAdmin)
      let adminLogin = registredAdmin.login
      let tokenAdmin = await login(adminLogin)
      accounts.admin.id = registredAdmin.id
      accounts.admin.name = registredAdmin.name
      accounts.admin.token = `Bearer ${ tokenAdmin.token }`
    } catch (errorAdmin) {
      console.log(errorAdmin)
    }
    
    try {
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
      let registredCliente = await register(userCliente)
      let clienteLogin = registredCliente.login
      let tokenCliente = await login(clienteLogin)
      accounts.cliente.id = registredCliente.id
      accounts.cliente.name = registredCliente.name
      accounts.cliente.token = `Bearer ${ tokenCliente.token }`
    } catch (errorCliente) {
      console.log(errorCliente)
    }

    try {
      const userCliente2 = {
        name: "Doralice Cordeiro",
        email: "dora_cordeiro@gmail.com",
        password: "oiqwuerowq#&134890OIU@",
        phoneCode: "1",
        phoneNumber: "2129981212",
        birthDate: "1955-09-09",
        country: "BR",
        state: "PA",
        city: "Belém",
        cpf: "12222222222",
        neighborhood: "Jardim Nova São Paulo",
        road: "Rua Nina Simone",
        house_number: "2000",
        information: "Curabitur in vestibulum mi. Morbi vulputate ipsum ut eros pretium mollis. Maecenas auctor justo arcu, quis luctus turpis tempor euismod. Donec placerat gravida mattis. Vestibulum ornare quam ac porta ornare. Vestibulum a ex blandit, convallis dolor non, pretium est. Donec porttitor felis in ligula eleifend, luctus vulputate purus fringilla. Integer tristique mollis ex, at varius eros pretium non. Aenean tortor nisl, pellentesque non lacinia a, fringilla sit amet mi. Nulla facilisi. Nullam vitae ornare eros."
      }
      let registredCliente2 = await register(userCliente2)
      let clienteLogin2 = registredCliente2.login
      let tokenCliente2 = await login(clienteLogin2)
      accounts.cliente2.id = registredCliente2.id
      accounts.cliente2.name = registredCliente2.name
      accounts.cliente2.token = `Bearer ${ tokenCliente2.token }`
    } catch (errorCliente2) {
      console.log(errorCliente2)
    }

    try {
      const userFuncionario = {
        name: "Alan de Jesus",
        email: "alan_jesus@hotmail.com",
        password: "ksDOiu239847#@$qwER",
        phoneCode: "1",
        phoneNumber: "2129980000",
        birthDate: "1985-10-29",
        country: "BR",
        state: "CE",
        city: "Fortaleza",
        cpf: Generator.genCPF()
      }
      let registredFuncionario = await register(userFuncionario)
      let funcionarioLogin = registredFuncionario.login
      accounts.funcionario.id = registredFuncionario.id
      accounts.funcionario.name = registredFuncionario.name
      await updateRole(accounts.funcionario.id, '1')
      let tokenFuncionario = await login(funcionarioLogin)
      accounts.funcionario.token = `Bearer ${ tokenFuncionario.token }`
    } catch (errorFuncionario) {
      console.log(errorFuncionario)
    }

    try {
      const userFuncionario2 = {
        name: "Pedro Cruz",
        email: "pedro_cruz@hotmail.com",
        password: "213Erpoklsdf#@$qwER",
        phoneCode: "1",
        phoneNumber: "2129980000",
        birthDate: "1988-07-09",
        country: "BR",
        state: "CE",
        city: "Fortaleza",
        cpf: Generator.genCPF()
      }
      let registredFuncionario2 = await register(userFuncionario2)
      let funcionarioLogin2 = registredFuncionario2.login
      accounts.funcionario2.id = registredFuncionario2.id
      accounts.funcionario2.name = registredFuncionario2.name
      await updateRole(accounts.funcionario2.id, '1')
      let tokenFuncionario2 = await login(funcionarioLogin2)
      accounts.funcionario2.token = `Bearer ${ tokenFuncionario2.token }`
    } catch (errorFuncionario2) {
      console.log(errorFuncionario2)
    }

    try {
      const userGerente = {
        name: "Ana de Oliveira",
        email: "ana_oli@outlook.com",
        password: "&QoiWeroW$92381749&",
        phoneCode: "1",
        phoneNumber: "2129980000",
        birthDate: "2000-01-02",
        country: "BR",
        state: "CE",
        city: "Fortaleza",
        cpf: Generator.genCPF()
      }
      let registredGerente = await register(userGerente)
      let gerenteLogin = registredGerente.login
      accounts.gerente.id = registredGerente.id
      accounts.gerente.name = registredGerente.name
      await updateRole(accounts.gerente.id, '2')
      let tokenGerente = await login(gerenteLogin)
      accounts.gerente.token = `Bearer ${ tokenGerente.token }`
    } catch (errorGerente) {
      console.log(errorGerente)
    }

    try {
      const userGerente2 = {
        name: "Diogo Silva",
        email: "di_silva@outlook.com",
        password: "54df@qWEr797sa@#df!6qWE7",
        phoneCode: "1",
        phoneNumber: "2129980000",
        birthDate: "2000-01-02",
        country: "BR",
        state: "CE",
        city: "Fortaleza",
        cpf: Generator.genCPF()
      }
      let registredGerente2 = await register(userGerente2)
      let gerenteLogin2 = registredGerente2.login
      accounts.gerente2.id = registredGerente2.id
      accounts.gerente2.name = registredGerente2.name
      await updateRole(accounts.gerente2.id, '2')
      let tokenGerente2 = await login(gerenteLogin2)
      accounts.gerente2.token = `Bearer ${ tokenGerente2.token }`
    } catch (errorGerente2) {
      console.log(errorGerente2)
    }

    try {
      const userGerente3 = {
        name: "Luiz de Oliveira",
        email: "luiz_oli@gmail.com",
        password: "Wi89@!#7234ofq%&W8792",
        phoneCode: "1",
        phoneNumber: "2129941526",
        birthDate: "2001-08-22",
        country: "BR",
        state: "CE",
        city: "Fortaleza",
        cpf: Generator.genCPF()
      }
      let registredGerente3 = await register(userGerente3)
      let gerenteLogin3 = registredGerente3.login
      accounts.gerente3.id = registredGerente3.id
      accounts.gerente3.name = registredGerente3.naname
      await updateRole(accounts.gerente3.id, '2')
      let tokenGerente3 = await login(gerenteLogin3)
      accounts.gerente3.token = `Bearer ${ tokenGerente3.token }`
    } catch (errorGerente3) {
      console.log(errorGerente3)
    }

  } catch (error) {
    console.log(error)
  }
})

describe("Suite de testes das rotas User.", function() {
  let fixedCPF = Generator.genCPF()
  let fixedPassportNumber = Generator.genPassportNumber()

  describe("CREATE", function() {

    describe("Testes de SUCESSO.", function() {

      test("/POST - Deve retornar 201, para inserção de dados obrigatórios + opcionais para brasileiros, inseridos pelo próprio CLIENTE.", async function() {

        try {

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

          const responseCreate = await request.post(endpoints.toCreate).send(user)

          expect(responseCreate.statusCode).toEqual(201)

          expect(responseCreate.body._links).toHaveLength(3)

          try {

            let userID = await extractUserID(responseCreate.body._links[0].href)

            const responseRead = await request.get(`${ endpoints.toRead }/${ userID }`)
              .set('Authorization', accounts.funcionario.token)

            expect(responseRead.statusCode).toEqual(200)

            const {
              id,
              created,
              updated,
            } = responseRead.body

            expect(created.createdAt).toBeDefined()
            expect(created.createdBy).toMatchObject({
              id,
              name: user.name
            })

            expect(updated.updatedAt).toBeDefined()
            expect(updated.updatedBy).toMatchObject({
              id: '',
              name: '',
            })

          } catch (errorRead) {
            fail(errorRead)
          }

        } catch (errorCreate) {
          fail(errorCreate)
        }

      })

      test("/POST - Deve retornar 201, para inserção dos dados obrigatórios de estrangeiros, inseridos pelo próprio CLIENTE.", async function() {

        try {

          const user = {
            name: "Josias Cruz",
            email: "josias_cruz@hotmail.com",
            password: "&iOupQwer238974!2",
            phoneCode: "1",
            phoneNumber: "2129981212",
            birthDate: "1999-01-09",
            country: "US",
            state: "NY",
            city: "New York City",
            passportNumber: Generator.genPassportNumber(),
          }

          const responseCreate = await request.post(endpoints.toCreate).send(user)

          expect(responseCreate.statusCode).toEqual(201)

          expect(responseCreate.body._links).toHaveLength(3)

          try {

            let userID = await extractUserID(responseCreate.body._links[0].href)

            const responseRead = await request.get(`${ endpoints.toRead }/${ userID }`)
              .set('Authorization', accounts.funcionario.token)

            expect(responseRead.statusCode).toEqual(200)

            const {
              id,
              created,
              updated,
            } = responseRead.body

            expect(created.createdAt).toBeDefined()
            expect(created.createdBy).toMatchObject({
              id,
              name: user.name
            })

            expect(updated.updatedAt).toBeDefined()
            expect(updated.updatedBy).toMatchObject({
              id: '',
              name: '',
            })

          } catch (errorRead) {
            fail(errorRead)
          }

        } catch (errorCreate) {
          fail(errorCreate)
        }

      })

      test("/POST - Deve retornar 201, para FUNCIONÁRIO que cadastra uma conta para o cliente.", async function() {

        try {

          const user = {
            name: "Júnior de Oliveira",
            email: "junior@hotmail.com",
            password: "qWoie#$uR19@382734",
            phoneCode: "55",
            phoneNumber: "11999847523",
            birthDate: "1985-06-09",
            country: "BR",
            state: "RJ",
            city: "Rio de Janeiro",
            cpf: `${ Generator.genCPF() }`,
            cep: "08391700",
            neighborhood: "Jardim Nova São Paulo",
            road: "Rua Nina Simone",
            house_number: "2000",
            information: "Nunc eleifend ante elit, a ornare risus gravida quis. Suspendisse venenatis felis ac tellus rutrum convallis. Integer tincidunt vehicula turpis, vel semper arcu mollis a. Proin auctor, ipsum ut finibus fringilla, orci sapien mattis mauris, et congue sapien metus vel augue. Nullam id ullamcorper neque. Integer dictum pharetra sapien non congue. Fusce libero elit, eleifend vitae viverra a, viverra id purus. Suspendisse sed nulla mauris. Sed venenatis tortor id nisi dictum tristique."
          }

          const responseCreate = await request.post(endpoints.toCreate).send(user).set('Authorization', accounts.funcionario.token)

          expect(responseCreate.statusCode).toEqual(201)

          expect(responseCreate.body._links).toHaveLength(4)

          try {

            let userID = await extractUserID(responseCreate.body._links[0].href)

            const responseRead = await request.get(`${ endpoints.toRead }/${ userID }`)
              .set('Authorization', accounts.funcionario2.token)

            expect(responseRead.statusCode).toEqual(200)

            const {
              id,
              created,
              updated,
            } = responseRead.body

            expect(created.createdAt).toBeDefined()
            expect(created.createdBy).toMatchObject({
              id: accounts.funcionario.id,
              name: accounts.funcionario.name
            })

            expect(updated.updatedAt).toBeDefined()
            expect(updated.updatedBy).toMatchObject({
              id: '',
              name: '',
            })

          } catch (errorRead) {
            fail(errorRead)
          }

        } catch (errorCreate) {
          fail(errorCreate)
        }

      })

    })

    describe("Testes de FALHA.", function() {

      // Testes no NOME
      test("/POST - Deve retornar 400, pela ausência do nome do User.", function() {

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

      test("/POST - Deve retornar 400, devido a presença de elementos inválidos do nome do User.", function() {

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
      test("/POST - Deve retornar 400, pela ausência do email do User.", function() {

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

      test("/POST - Deve retornar 400, devido a presença de elementos inválidos no email do User.", function() {

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

      test("/POST - Deve retornar 400, por passar um email já cadastrado.", function() {

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
      test("/POST - Deve retornar 400, pela ausência da data de nascimento do User.", function() {

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

      test("/POST - Deve retornar 400, por ter informado uma data de nascimento inválida.", function() {

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

      test("/POST - Deve retornar 400, pela idade do usuário ser menor que 18 anos.", function() {

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
      test("/POST - Deve retornar 400, pela ausência da senha do usuário.", function() {

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

      test("/POST - Deve retornar 400, devido a senha informada ser muito fraca.", function() {

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
      test("/POST - Deve retornar 400, pela ausência do código do telefone.", function() {

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

      test("/POST - Deve retornar 400, devido ao código de telefone informado ser invalido.", function() {

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

      test("/POST - Deve retornar 400, pela ausência do telefone do usuario.", function() {

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

      test("/POST - Deve retornar 400, devido ao número de telefone do usuário ser inválido.", function() {

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
      test("/POST - Deve retornar 400, pela ausência do país de nascimento do usuário.", function() {

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

      test("/POST - Deve retornar 400, devido ao ISO do pais de nascimento do usuário ser inválido.", function() {

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
      test("/POST - Deve retornar 400, pela ausência do estado de nascimento do usuário.", function() {

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

      test("/POST - Deve retornar 400, devido ao nome/sigla do estado de nascimento ser inválido.", function() {

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
      test("/POST - Deve retornar 400, pela ausência do nome da cidade de nascimento do usuário.", function() {

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

      test("/POST - Deve retornar 400, devido ao nome da cidade de nascimento do usuário ser inválido.", function() {

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
      test("/POST - Deve retornar 400, pela ausência do CPF do usuário nascido no Brasil.", function() {

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

      test("/POST - Deve retornar 400, devido ao valor do CPF do usuário ser inválido.", function() {

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

      test("/POST - Deve retornar 400, devido ao valor do CPF do usuário estar faltando dígitos.", function() {

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

      test("/POST - Deve retornar 400, devido ao CPF informado já estar cadastrado.", function() {

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
      test("/POST - Deve retornar 400, devido a ausência do número do passaporte de um usuário estrangeiro.", function() {

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

      test("/POST - Deve retornar 400, uma vez que o número do passaporte do usuario estrangeiro está errado.", function() {

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

      test("/POST - Deve retornar 400, uma vez que o número do passaporte do usuário estrangeiro já foi registrado anteriormente.", function() {

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
      test("/POST - Deve retornar 400, uma vez que o número do CEP não existe.", function() {

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

      test("/POST - Deve retornar 400, uma vez que o falta número do CEP informado.", function() {

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

      test("/POST - Deve retornar 400, devido ao número de CEP possuir caractere inválido.", function() {

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
      test("/POST - Deve retornar 400, devido a presença de caracteres inválidos no nome do bairro.", function() {

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

      test("/POST - Deve retornar 400, devido a presença de caracteres inválidos no nome da rua.", function() {

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
      test("/POST - Deve retornar 400, devido a presença de caracteres inválidos no numero da casa do usuario.", function() {

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
      test("/POST - Deve retornar 400, devido a presença de caracteres inválidos nas informações adicionais do usuario.", function() {

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

    })

  })

  describe("READ", function() {

    describe("Testes de SUCESSO.", function() {

      test("/GET - Deve retornar 200 para usuário que buscam suas próprias informações.", function() {

        let login = {
          email: "dino_oli@hotmail.com",
          password: "@QowierU12873094&28374@"
        }

        return request.post(endpoints.toLogin).send(login)
          .then(function(responseLogin) {

            expect(responseLogin.statusCode).toEqual(200)

            const { token, _links } = responseLogin.body

            // Pega o ID do usuário que fez login.
            let id = _links[0].href.split('/').pop()

            return request.get(`${ endpoints.toRead }/${ id }`).set('Authorization', `Bearer ${ token }`)
              .then(responseRead => {

                expect(responseRead.statusCode).toEqual(200)

                expect(responseRead.body).toMatchObject({
                  name: "Dinorá de Oliveira",
                  email: "dino_oli@hotmail.com",
                  phoneCode: "55",
                  phoneNumber: "11999847523",
                  birthDate: "1985-06-09",
                  address: {
                    country: "BR",
                    state: "SP",
                    city: "São Paulo",
                    cep: "08391700",
                    neighborhood: "Jardim Nova São Paulo",
                    road: "Rua Nina Simone",
                    house_number: "2000",
                    information: "Nunc eleifend ante elit, a ornare risus gravida quis. Suspendisse venenatis felis ac tellus rutrum convallis. Integer tincidunt vehicula turpis, vel semper arcu mollis a. Proin auctor, ipsum ut finibus fringilla, orci sapien mattis mauris, et congue sapien metus vel augue. Nullam id ullamcorper neque. Integer dictum pharetra sapien non congue. Fusce libero elit, eleifend vitae viverra a, viverra id purus. Suspendisse sed nulla mauris. Sed venenatis tortor id nisi dictum tristique."
                  },
                })

                expect(responseRead.body.created).toBeUndefined()
                expect(responseRead.body.updated).toBeUndefined()

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

      test("/GET - Deve retornar 200 e uma lista de usuários.", function() {

        return request.get(endpoints.toList).set('Authorization', accounts.admin.token)
          .then(function(response) {
            expect(response.statusCode).toEqual(200)

            expect(response.body).toHaveProperty('users')
            expect(response.body).toHaveProperty('hasNext')

            // A quantidade PADRÃO de itens a serem exibidos por página é 20.
            expect(response.body.hasNext).toBe(false)

            for (let user of response.body.users) {

              const {
                id,
                created,
                updated,
              } = user

              expect(created.createdAt).toBeDefined()
              expect(created.createdBy).toMatchObject({
                id: expect.any(String),
                name: expect.any(String),
              })

              expect(user._links).toBeDefined()
              expect(user._links).toHaveLength(3)
            }
          })
          .catch(function(error) {
            fail(error)
          })

      })

      test("/GET - Deve retornar 200 e uma lista de usuários que contém nome Doralice.", function() {

        const queryStringOBJ = {
          name: 'Doralice'
        }

        let url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

        return request.get(url).set('Authorization', accounts.admin.token)
          .then(function(response) {

            expect(response.statusCode).toEqual(200)
            expect(response.body.users).toHaveLength(2)

            for (let user of response.body.users) {

              expect(user.name).toEqual(expect.stringContaining(queryStringOBJ.name))

            }

          })
          .catch(function(error) {
            fail(error)
          })

      })

      test("/GET - Deve retornar 200 e uma lista de usuários que contém nome doralice (MINÚSCULO).", function() {

        const queryStringOBJ = {
          name: 'doralice'
        }

        let url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

        return request.get(url).set('Authorization', accounts.admin.token)
          .then(function(response) {

            expect(response.statusCode).toEqual(200)
            expect(response.body.users).toHaveLength(2)

            for (let user of response.body.users) {

              let userNameLower = user.name.toLowerCase()

              expect(userNameLower).toEqual(expect.stringContaining(queryStringOBJ.name))

            }

          })
          .catch(function(error) {
            fail(error)
          })

      })

      test("/GET - Deve retornar 200 e uma lista de usuários, contendo limite de usuários.", function() {

        let url = endpoints.toList + '?offset=1&limit=3'

        return request.get(url).set('Authorization', accounts.admin.token)
          .then(function(response) {

            expect(response.statusCode).toEqual(200)
            expect(response.body.users.length).toEqual(2)

            expect(response.body).toHaveProperty('users')
            expect(response.body).toHaveProperty('hasNext')

            for (let user of response.body.users) {

              const {
                id,
                created,
                updated,
              } = user

              expect(created.createdAt).toBeDefined()
              expect(created.createdBy).toMatchObject({
                id: expect.any(String),
                name: expect.any(String),
              })

              expect(user._links).toBeDefined()
              expect(user._links).toHaveLength(3)

            }

          })
          .catch(function(error) {
            fail(error)
          })

      })

      test("/POST - Deve retornar 200 e o email e o nome do usuário Brasileiro que corresponda com o CPF informado.", function() {

        const info = {
          cpf: '22222222222'
        }

        return request.post(endpoints.toSearch).send(info).set('Authorization', accounts.admin.token)
          .then(function(responseSearch) {

            expect(responseSearch.statusCode).toEqual(200)
            expect(responseSearch.body).toHaveLength(1)
            expect(responseSearch.body).toMatchObject([
              {
                name: "Macunaíma Cruz",
                email: "macuna_curz@hotmail.com",
                created: {
                  createdAt: expect.any(String),
                  createdBy: {
                    id: expect.any(String),
                    name: expect.any(String),
                  }
                },
                updated: {
                  updatedAt: expect.any(String),
                  updatedBy: {
                    id: "507f1f77bcf86cd799439011",
                    name: "Macunaíma Cruz",
                  }
                }
              }
            ])

            let { _links } = responseSearch.body[0]
            expect(_links).toBeDefined()
            expect(_links).toHaveLength(4)
          })
          .catch(function(errorSearch) {
            fail(errorSearch)
          })

      })

      test("/POST - Deve retornar 200 e o email e o nome do usuário estrangeiro que corresponda com o Numero de Passaporte informado.", function() {

        const info = {
          passportNumber: '303004786'
        }
        
        return request.post(endpoints.toSearch).send(info).set('Authorization', accounts.admin.token)
          .then(function(responseSearch) {
            expect(responseSearch.statusCode).toEqual(200)
            expect(responseSearch.body).toHaveLength(1)
            expect(responseSearch.body).toMatchObject([
              {
                name: "John Smith",
                email: "john_sm@hotmail.com",
                created: {
                  createdAt: expect.any(String),
                  createdBy: {
                    id: expect.any(String),
                    name: expect.any(String),
                  }
                },
                updated: {
                  updatedAt: expect.any(String),
                  updatedBy: {
                    id: "507f1f77bcf86cd799439011",
                    name: "Macunaíma Cruz",
                  }
                }
              }
            ])

            let { _links } = responseSearch.body[0]
            expect(_links).toBeDefined()
            expect(_links).toHaveLength(4)

          })
          .catch(function(errorSearch) {
            fail(errorSearch)
          })

      })

      test("/POST - Deve retornar 200 e o email e o nome do usuário estrangeiro que corresponda com o Nome informado, sendo a primeira letra MAIÚSCULA.", function() {

        const info = {
          name: 'Doralice'
        }
        
        return request.post(endpoints.toSearch).send(info).set('Authorization', accounts.admin.token)
          .then(function(responseSearch) {
            expect(responseSearch.statusCode).toEqual(200)
            expect(responseSearch.body).toHaveLength(2)

            for (let user of responseSearch.body) {
              expect(user._links).toBeDefined()
              expect(user._links).toHaveLength(4)
            }

          })
          .catch(function(errorSearch) {
            fail(errorSearch)
          })

      })

      test("/POST - Deve retornar 200 e o email e o nome do usuário estrangeiro que corresponda com o Nome informado, nome com todas as letras MINÚSCULAS.", function() {

        const info = {
          name: 'doralice'
        }
        
        return request.post(endpoints.toSearch).send(info).set('Authorization', accounts.admin.token)
          .then(function(responseSearch) {
            expect(responseSearch.statusCode).toEqual(200)
            expect(responseSearch.body).toHaveLength(2)

            for (let user of responseSearch.body) {
              expect(user._links).toBeDefined()
              expect(user._links).toHaveLength(4)
            }

          })
          .catch(function(errorSearch) {
            fail(errorSearch)
          })

      })

      test("/POST - Deve retornar 200 e um Token.", function() {

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

    })

    describe("Testes de FALHA.", function() {

      test("/POST - Deve retornar 400, por não ter informado um documento (CPF, Número de Passaporte ou Name) para busca de um usuário.", function() {
        return request.post(endpoints.toSearch).send({}).set('Authorization', accounts.funcionario.token)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("1")
            expect(response.body.RestException.Message).toBe("Nenhum CPF ou Número de Passaporte informado")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
            expect(response.body.RestException.ErrorFields).toMatchObject([
              {
                field: 'iptDoc',
                hasError: {
                  value: true,
                  type: 1,
                  error: 'Nenhum CPF ou Número de Passaporte informado'
                }
              }
            ])
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/POST - Deve retornar 400, por ter informado um campo inválido para busca de usuário por CPF, Número de Passaporte ou Name.", function() {
        return request.post(endpoints.toSearch).send({
          country: 'BR'
        }).set('Authorization', accounts.funcionario.token)
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

      test("/POST - Deve retornar 400, por ter informado um valor de CPF inválido.", function() {
        return request.post(endpoints.toSearch).send({
          cpf: '2222222222a'
        }).set('Authorization', accounts.funcionario.token)
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

      test("/POST - Deve retornar 404, por não existir um usuário com o CPF informado.", function() {

        let info = {
          cpf: fixedCPF
        }

        return request.post(endpoints.toSearch).send(info).set('Authorization', accounts.gerente.token)
          .then(function(responseSearch) {

            expect(responseSearch.statusCode).toEqual(404)

          })
          .catch(function(errorSearch) {
            fail(errorSearch)
          })

      })

      test("/POST - Deve retornar 400, por ter informado um valor de Número de Passaporte inválido.", function() {
        return request.post(endpoints.toSearch).send({
          passportNumber: 'C100100--'
        }).set('Authorization', accounts.funcionario.token)
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

      test("/POST - Deve retornar 400, por ter informado um valor de Número de Passaporte inválido.", function() {
        return request.post(endpoints.toSearch).send({
          name: 'Tobias--'
        }).set('Authorization', accounts.funcionario.token)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O campo Nome possui caracteres inválidos")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/POST - Deve retornar 404, por não existir um usuário com o Número de Passaporte informado.", function() {

        let info = {
          passportNumber: fixedPassportNumber
        }

        return request.post(endpoints.toSearch).send(info).set('Authorization', accounts.funcionario.token)
          .then(function(responseSearch) {

            expect(responseSearch.statusCode).toEqual(404)

          })
          .catch(function(errorSearch) {
            fail(errorSearch)
          })

      })

      test("/POST - Deve retornar 400, uma vez que o ID do usuário a ser buscado contém caracteres inválidos.", function() {

        let user = { id: '5da9ea674234635bdff4+-!7' }

        return request.get(`${ endpoints.toRead }/${ user.id }`).set('Authorization', accounts.admin.token)
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

      test("/POST - Deve retornar 404, uma vez que o usuário não existe.", function() {

        let user = { id: '507f1f77bcf86cd799431111' }

        return request.get(`${ endpoints.toRead }/${ user.id }`).set('Authorization', accounts.admin.token)
          .then(function(responseRead) {
            expect(responseRead.statusCode).toEqual(404)

            expect(responseRead.body.RestException.Code).toBe("3")
            expect(responseRead.body.RestException.Message).toBe("Nenhum usuário com o ID informado está cadastrado")
            expect(responseRead.body.RestException.Status).toBe("404")
            expect(responseRead.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/3`)
          })
          .catch(function(errorRead) {
            fail(errorRead)
          })
      })

      // Testes no Login
      test("/POST - Deve retornar 400, por não ter informado o Email para Login.", function() {

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

      test("/POST - Deve retornar 404, por ter informado um Email, para Login, que não foi cadastrado anteriormente.", function() {

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

      test("/POST - Deve retornar 400, por não ter informado uma senha para Login.", function() {

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
      test("/POST - Deve retornar 401, por tentar acessar a listagem de Usuários sem estar AUTORIZADO.", function() {

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

      test("/POST - Deve retornar 403, por tentar acessar a listagem de Usuários sem estar AUTENTICADO.", function() {

        return request.get(endpoints.toList).set('Authorization', accounts.cliente.token)
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

      test("/POST - Deve retornar 400, foi informado uma query inválida para a listagem.", function() {

        const queryStringOBJ = {
          cpf: '11111111111'
        }

        const url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

        return request.get(url).set('Authorization', accounts.funcionario.token)
          .then(function(responseList) {
            expect(responseList.statusCode).toEqual(400)
            expect(responseList.body.RestException.Code).toBe("2")
            expect(responseList.body.RestException.Message).toBe("O parâmetro 'cpf' é inválido")
            expect(responseList.body.RestException.Status).toBe("400")
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
          })
          .catch(function(errorList) {
            fail(errorList)
          })
      })

      test("/POST - Deve retornar 400, o filtro Name foi declarado, mas não possui valor.", function() {

        const queryStringOBJ = {
          name: ''
        }

        const url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

        return request.get(url).set('Authorization', accounts.funcionario.token)
          .then(function(responseList) {
            expect(responseList.statusCode).toEqual(400)
            expect(responseList.body.RestException.Code).toBe("1")
            expect(responseList.body.RestException.Message).toBe("O campo Nome é obrigatório")
            expect(responseList.body.RestException.Status).toBe("400")
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
          })
          .catch(function(errorList) {
            fail(errorList)
          })
      })

      test("/POST - Deve retornar 400, o filtro Name possui um valor inválido.", function() {

        const queryStringOBJ = {
          name: 'Tobias--'
        }

        const url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

        return request.get(url).set('Authorization', accounts.funcionario.token)
          .then(function(responseList) {
            expect(responseList.statusCode).toEqual(400)
            expect(responseList.body.RestException.Code).toBe("2")
            expect(responseList.body.RestException.Message).toBe("O campo Nome possui caracteres inválidos")
            expect(responseList.body.RestException.Status).toBe("400")
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
          })
          .catch(function(errorList) {
            fail(errorList)
          })
      })

      test("/POST - Deve retornar 400, o filtro Offset foi informado sem a presença do Limit.", function() {

        const queryStringOBJ = {
          offset: '1'
        }

        const url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

        return request.get(url).set('Authorization', accounts.funcionario.token)
          .then(function(responseList) {
            expect(responseList.statusCode).toEqual(400)
            expect(responseList.body.RestException.Code).toBe("1")
            expect(responseList.body.RestException.Message).toBe("O parâmetro OFFSET foi informado sem a presença do LIMIT")
            expect(responseList.body.RestException.Status).toBe("400")
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
          })
          .catch(function(errorList) {
            fail(errorList)
          })
      })

      test("/POST - Deve retornar 400, o filtro Offset foi declarado mas não possui valor do Limit.", function() {

        const queryStringOBJ = {
          offset: '',
          limit: '3'
        }

        const url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

        return request.get(url).set('Authorization', accounts.funcionario.token)
          .then(function(responseList) {
            expect(responseList.statusCode).toEqual(400)
            expect(responseList.body.RestException.Code).toBe("2")
            expect(responseList.body.RestException.Message).toBe("O valor do parâmetro Offset não foi informado")
            expect(responseList.body.RestException.Status).toBe("400")
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
          })
          .catch(function(errorList) {
            fail(errorList)
          })
      })

      test("/POST - Deve retornar 400, o filtro Offset foi declarado mas possui um valor inválido.", function() {

        const queryStringOBJ = {
          offset: '1a',
          limit: '3'
        }

        const url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

        return request.get(url).set('Authorization', accounts.funcionario.token)
          .then(function(responseList) {
            expect(responseList.statusCode).toEqual(400)
            expect(responseList.body.RestException.Code).toBe("2")
            expect(responseList.body.RestException.Message).toBe("O valor do parâmetro Offset é inválido")
            expect(responseList.body.RestException.Status).toBe("400")
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
          })
          .catch(function(errorList) {
            fail(errorList)
          })
      })

      test("/POST - Deve retornar 400, o filtro Limit foi declarado mas não possui valor.", function() {

        const queryStringOBJ = {
          offset: '2',
          limit: ''
        }

        const url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

        return request.get(url).set('Authorization', accounts.funcionario.token)
          .then(function(responseList) {
            expect(responseList.statusCode).toEqual(400)
            expect(responseList.body.RestException.Code).toBe("2")
            expect(responseList.body.RestException.Message).toBe("O valor do parâmetro Limit não foi informado")
            expect(responseList.body.RestException.Status).toBe("400")
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
          })
          .catch(function(errorList) {
            fail(errorList)
          })
      })

      test("/POST - Deve retornar 400, o filtro Limit possui valor inválido.", function() {

        const queryStringOBJ = {
          offset: '2',
          limit: '3a'
        }

        const url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

        return request.get(url).set('Authorization', accounts.funcionario.token)
          .then(function(responseList) {
            expect(responseList.statusCode).toEqual(400)
            expect(responseList.body.RestException.Code).toBe("2")
            expect(responseList.body.RestException.Message).toBe("O valor do parâmetro Limit é inválido")
            expect(responseList.body.RestException.Status).toBe("400")
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
          })
          .catch(function(errorList) {
            fail(errorList)
          })
      })

      // Testes para busca por documentação
      test("/POST - Deve retornar 401, por tentar buscar um Usuários pelo CPF sem estar AUTORIZADO.", function() {

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

      test("/POST - Deve retornar 403, por tentar buscar um Usuários pelo CPF sem estar AUTENTICADO.", function() {

        const info = {
          cpf: '11111111111'
        }

        return request.post(endpoints.toSearch).send(info).set('Authorization', accounts.cliente.token)
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

    })

  })

  describe("UPDATE", function() {

    describe("Testes de SUCESSO.", function() {

      test("/PUT - Deve retornar 200 e o usuário Brasileiro com suas informações atualizadas.", function() {

        let user = {
          id: accounts.cliente.id,
          email: "doralice@gmail.com",
          phoneNumber: "2129982222",
          country: "US",
          state: "OH",
          city: "Columbus"
        }

        // Envia o token do login para a rota de atualização, junto com as informações.
        return request.put(endpoints.toUpdate).send(user).set('Authorization', accounts.cliente.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(200)

            expect(responseUpdate.body._links).toBeDefined()
            expect(responseUpdate.body._links).toHaveLength(3)

            // Utilizando o ADMIN para verificar se as informações foram atualizadas.
            return request.get(`${ endpoints.toRead }/${ user.id }`).set('Authorization', accounts.cliente.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                expect(responseRead.body).toMatchObject({
                  id: user.id,
                  email: user.email,
                  phoneNumber: user.phoneNumber,
                  address: {
                    country: user.country,
                    state: user.state,
                    city: user.city,
                  }
                })

                expect(responseRead.body.created).toBeUndefined()
                expect(responseRead.body.updated).toBeUndefined()

              })
              .catch(function(errorRead) {
                fail(errorRead)
              })

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      test("/PUT - Deve retornar 200 para cliente que tem sua Função alterada para Funcionário pelo Admin.", function() {

        let user = {
          id: '600f191e810c19829de900ea',
          role: '1'
        }

        return request.put(`${ endpoints.toUpdate }`).send(user).set('Authorization', accounts.admin.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(200)

            expect(responseUpdate.body._links).toBeDefined()
            expect(responseUpdate.body._links).toHaveLength(4)

            return request.get(`${ endpoints.toRead }/600f191e810c19829de900ea`).set('Authorization', accounts.admin.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                expect(responseRead.body).toMatchObject({
                  id: '600f191e810c19829de900ea',
                  role: user.role
                })

              })
              .catch(function(errorRead) {
                fail(errorRead)
              })

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      test("/PUT - Deve retornar 200 para cliente que tem sua Função alterada para Gerente pelo Admin.", function() {

        let user = {
          id: accounts.gerente.id,
          role: '2'
        }

        return request.put(`${ endpoints.toUpdate }`).send(user).set('Authorization', accounts.admin.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(200)

            expect(responseUpdate.body._links).toBeDefined()
            expect(responseUpdate.body._links).toHaveLength(4)

            return request.get(`${ endpoints.toRead }/${ accounts.gerente.id }`).set('Authorization', accounts.admin.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                expect(responseRead.body).toMatchObject({
                  id: accounts.gerente.id,
                  role: user.role
                })

              })
              .catch(function(errorRead) {
                fail(errorRead)
              })

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      test("/PUT - Deve retornar 200 para cliente que tem sua Função alterada para Funcionário pelo Gerente.", function() {

        let user = {
          id: '600f191e810c19829de900ea',
          role: '1'
        }

        return request.put(`${ endpoints.toUpdate }`).send(user).set('Authorization', accounts.admin.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(200)

            expect(responseUpdate.body._links).toBeDefined()
            expect(responseUpdate.body._links).toHaveLength(4)

            return request.get(`${ endpoints.toRead }/${ user.id }`).set('Authorization', accounts.admin.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                expect(responseRead.body).toMatchObject({
                  id: user.id,
                  role: user.role
                })

              })
              .catch(function(errorRead) {
                fail(errorRead)
              })

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      test("/PUT - Deve retornar 200 para o Funcionário que atualiza as informações obrigatórias e opcionais/condicionais de um usuário Brasileiro.", function() {

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
          cep: "21051990",
          state: "RJ",
          city: "Rio de Janeiro",
          cpf: `${ fixedCPF }`,
          neighborhood: "Bairro: Março 29",
          road: "Rua 29 de março",
          house_number: "2300",
          information: "Vivamus vitae turpis fermentum, scelerisque neque eget, aliquet nibh. In consequat, urna quis rhoncus fringilla, elit nisi tincidunt metus, a tempus nibh turpis vel orci. Sed a tellus ac odio viverra blandit. Aenean neque odio, vulputate eget quam eu, commodo aliquam sem. Integer efficitur magna vel aliquam luctus. Interdum et malesuada fames ac ante ipsum primis in faucibus. Integer mollis tempor libero, a gravida orci suscipit eu. Morbi cursus odio in tempus tincidunt. Nulla facilisi."
        }

        return request.put(endpoints.toUpdate).send(user).set('Authorization', accounts.funcionario.token)
          .then(function(responseUpdate) {
            expect(responseUpdate.statusCode).toEqual(200)

            expect(responseUpdate.body._links).toBeDefined()
            expect(responseUpdate.body._links).toHaveLength(4)

            const HATEOAS = Generator.genHATEOAS(user.id, 'user', 'users', true)

            for (let cont = 0; cont < responseUpdate.body._links.length; cont++) {
              expect(responseUpdate.body._links[cont]).toMatchObject(HATEOAS[cont])
            }

            return request.get(`${ endpoints.toRead }/${ user.id }`).set('Authorization', accounts.funcionario.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                expect(responseRead.body).toMatchObject({
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  phoneCode: user.phoneCode,
                  phoneNumber: user.phoneNumber,
                  birthDate: user.birthDate,
                  cpf: user.cpf,
                  address: {
                    country: user.country,
                    state: user.state,
                    cep: user.cep,
                    city: user.city,
                    neighborhood: user.neighborhood,
                    road: user.road,
                    house_number: user.house_number,
                    information: user.information
                  }
                })

                const { updated } = responseRead.body

                expect(updated.updatedAt).toBeDefined()
                expect(updated.updatedBy).toMatchObject({
                  id: accounts.funcionario.id,
                  name: accounts.funcionario.name,
                })

              })
              .catch(function(errorGET) {
                fail(errorGET)
              })
          })

          .catch(function(errorPOST) {
            fail(errorPOST)
          })

      })

      test("/PUT - Deve retornar 200 para usuário Brasileiro que não querem ter o CPF atualizado pelo Funcionário.", function() {

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

        return request.put(endpoints.toUpdate).send(user).set('Authorization', accounts.funcionario.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(200)

            expect(responseUpdate.body._links).toBeDefined()
            expect(responseUpdate.body._links).toHaveLength(4)

            const HATEOAS = Generator.genHATEOAS(user.id, 'user', 'users', true)

            for (let cont = 0; cont < responseUpdate.body._links.length; cont++) {
              expect(responseUpdate.body._links[cont]).toMatchObject(HATEOAS[cont])
            }

            return request.get(`${ endpoints.toRead }/${ user.id }`).set('Authorization', accounts.funcionario.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                expect(responseRead.body).toMatchObject({
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  phoneCode: user.phoneCode,
                  phoneNumber: user.phoneNumber,
                  birthDate: user.birthDate,
                  address: {
                    country: user.country,
                    state: user.state,
                    city: user.city,
                  }
                })

              })
              .catch(function(errorRead) {
                fail(errorRead)
              })

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      test("/PUT - Deve retornar 200 para usuário Brasileiro que não querem ter o CPF e Cidade atualizados pelo Funcionário.", function() {

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

        return request.put(endpoints.toUpdate).send(user).set('Authorization', accounts.funcionario.token)
        .then(function(responseUpdate) {

          expect(responseUpdate.statusCode).toEqual(200)

          expect(responseUpdate.body._links).toBeDefined()
          expect(responseUpdate.body._links).toHaveLength(4)

          const HATEOAS = Generator.genHATEOAS(user.id, 'user', 'users', true)

          for (let cont = 0; cont < responseUpdate.body._links.length; cont++) {
            expect(responseUpdate.body._links[cont]).toMatchObject(HATEOAS[cont])
          }

          return request.get(`${ endpoints.toRead }/${ user.id }`).set('Authorization', accounts.funcionario.token)
            .then(function(responseGET) {

              expect(responseGET.statusCode).toEqual(200)

              expect(responseGET.body).toMatchObject({
                name: user.name,
                email: user.email,
                role: user.role,
                phoneCode: user.phoneCode,
                phoneNumber: user.phoneNumber,
                birthDate: user.birthDate,
              })

            })
            .catch(function(errorRead) {
              fail(errorRead)
            })

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      test("/PUT - Deve retornar 200 para usuário Brasileiro que não quer ter o CPF, Local e Data de Nascimento atualizados pelo Funcionário.", function() {

        let user = {
          id: "5da9ea674234635bdff45c02",
          name: "Josias de Oliveira",
          email: "joz_cruz_de_oliveir@gmail.com",
          password: "@JosiaS&654975@",
          role: '0',
          phoneCode: "55",
          phoneNumber: "11984222222"
        }

        return request.put(endpoints.toUpdate).send(user).set('Authorization', accounts.funcionario.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(200)

            expect(responseUpdate.body._links).toBeDefined()
            expect(responseUpdate.body._links).toHaveLength(4)

            const HATEOAS = Generator.genHATEOAS(user.id, 'user', 'users', true)

            for (let cont = 0; cont < responseUpdate.body._links.length; cont++) {
              expect(responseUpdate.body._links[cont]).toMatchObject(HATEOAS[cont])
            }

            return request.get(`${ endpoints.toRead }/${ user.id }`).set('Authorization', accounts.funcionario.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                expect(responseRead.body).toMatchObject({
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  phoneCode: user.phoneCode,
                  phoneNumber: user.phoneNumber,
                })

              })
              .catch(function(errorRead) {
                fail(errorRead)
              })

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      test("/PUT - Deve retornar 200 para Gerente que atualiza somente o Nome, Email, Senha e Função do cliente.", function() {

        let user = {
          id: "5da9ea674234635bdff45c02",
          name: "Josias de Oliveira",
          email: "Oliveira_jo@yahoo.com",
          password: "@JosiaS&654975@",
          role: '1'
        }

        return request.put(endpoints.toUpdate).send(user).set('Authorization', accounts.gerente.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(200)

            expect(responseUpdate.body._links).toBeDefined()
            expect(responseUpdate.body._links).toHaveLength(4)

            const HATEOAS = Generator.genHATEOAS(user.id, 'user', 'users', true)

            for (let cont = 0; cont < responseUpdate.body._links.length; cont++) {
              expect(responseUpdate.body._links[cont]).toMatchObject(HATEOAS[cont])
            }

            return request.get(`${ endpoints.toRead }/${ user.id }`).set('Authorization', accounts.funcionario.token)
              .then(function(responseGET) {

                expect(responseGET.statusCode).toEqual(200)

                expect(responseGET.body).toMatchObject({
                  name: user.name,
                  email: user.email,
                  role: user.role,
                })

              })
              .catch(function(errorRead) {
                fail(errorRead)
              })

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      test("/PUT - Deve retornar 200 Gerente que atualiza somente o Nome, Senha e Função do cliente.", function() {

        let user = {
          id: "5da9ea674234635bdff45c02",
          name: "Josias de Oliveira",
          password: "@JosiaS&654975@",
          role: '1'
        }

        return request.put(endpoints.toUpdate).send(user).set('Authorization', accounts.gerente.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(200)

            expect(responseUpdate.body._links).toBeDefined()
            expect(responseUpdate.body._links).toHaveLength(4)

            const HATEOAS = Generator.genHATEOAS(user.id, 'user', 'users', true)

            for (let cont = 0; cont < responseUpdate.body._links.length; cont++) {
              expect(responseUpdate.body._links[cont]).toMatchObject(HATEOAS[cont])
            }

            return request.get(`${ endpoints.toRead }/${ user.id }`).set('Authorization', accounts.funcionario.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                expect(responseRead.body).toMatchObject({
                  name: user.name,
                  role: user.role,
                })

              })
              .catch(function(errorRead) {
                fail(errorRead)
              })

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      test("/PUT - Deve retornar 200 Gerente que atualiza somente o Nome e Senha do cliente.", function() {

        let user = {
          id: "5da9ea674234635bdff45c02",
          name: "Josias de Oliveira",
          password: "oqwiEro1234uiqE@!#$@3"
        }

        return request.put(endpoints.toUpdate).send(user).set('Authorization', accounts.gerente.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(200)

            expect(responseUpdate.body._links).toBeDefined()
            expect(responseUpdate.body._links).toHaveLength(4)

            const HATEOAS = Generator.genHATEOAS(user.id, 'user', 'users', true)

            for (let cont = 0; cont < responseUpdate.body._links.length; cont++) {
              expect(responseUpdate.body._links[cont]).toMatchObject(HATEOAS[cont])
            }

            return request.get(`${ endpoints.toRead }/${ user.id }`).set('Authorization', accounts.funcionario.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                expect(responseRead.body).toMatchObject({
                  name: user.name
                })

              })
              .catch(function(errorRead) {
                fail(errorRead)
              })

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      test("/PUT - Deve retornar 200 Gerente que atualiza somente o Nome do cliente.", function() {

        let user = {
          id: "5da9ea674234635bdff45c02",
          name: "Josias de Oliveira Cruz"
        }

        return request.put(endpoints.toUpdate).send(user).set('Authorization', accounts.gerente.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(200)

            expect(responseUpdate.body._links).toBeDefined()
            expect(responseUpdate.body._links).toHaveLength(4)

            const HATEOAS = Generator.genHATEOAS(user.id, 'user', 'users', true)

            for (let cont = 0; cont < responseUpdate.body._links.length; cont++) {
              expect(responseUpdate.body._links[cont]).toMatchObject(HATEOAS[cont])
            }

            return request.get(`${ endpoints.toRead }/${ user.id }`).set('Authorization', accounts.funcionario.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                expect(responseRead.body).toMatchObject({
                  name: user.name
                })

              })
              .catch(function(errorRead) {
                fail(errorRead)
              })

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      test("/PUT - Deve retornar 200 para Admin que informa o mesmo Email para o cliente.", function() {

        let user = {
          id: "507f191e810c19729de860ea",
          name: "John Smith John",
          email: "john_sm@hotmail.com"
        }

        return request.put(endpoints.toUpdate).send(user).set('Authorization', accounts.admin.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(200)

            expect(responseUpdate.body._links).toBeDefined()
            expect(responseUpdate.body._links).toHaveLength(4)

            const HATEOAS = Generator.genHATEOAS(user.id, 'user', 'users', true)

            for (let cont = 0; cont < responseUpdate.body._links.length; cont++) {
              expect(responseUpdate.body._links[cont]).toMatchObject(HATEOAS[cont])
            }

            return request.get(`${ endpoints.toRead }/${ user.id }`).set('Authorization', accounts.funcionario.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                expect(responseRead.body).toMatchObject({
                  name: user.name,
                  email: user.email,
                })

              })
              .catch(function(errorRead) {
                fail(errorRead)
              })

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      test("/PUT - Deve retornar 200 para Funcionário que informa o mesmo CPF para o cliente.", function() {

        let user = {
          id: "507f1f77bcf86cd799439011",
          name: "Macunaíma Cruz",
          email: "macuna_cruz@hotmail.com",
          cpf: `${ fixedCPF }`,
        }

        return request.put(endpoints.toUpdate).send(user).set('Authorization', accounts.funcionario.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(200)

            expect(responseUpdate.body._links).toBeDefined()
            expect(responseUpdate.body._links).toHaveLength(4)

            const HATEOAS = Generator.genHATEOAS(user.id, 'user', 'users', true)

            for (let cont = 0; cont < responseUpdate.body._links.length; cont++) {
              expect(responseUpdate.body._links[cont]).toMatchObject(HATEOAS[cont])
            }

            return request.get(`${ endpoints.toRead }/${ user.id }`).set('Authorization', accounts.funcionario.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                expect(responseRead.body).toMatchObject({
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  cpf: user.cpf,
                })

              })
              .catch(function(errorRead) {
                fail(errorRead)
              })

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      test("/PUT - Deve retornar 200 para o Admin que modifica seu local de nascimento e informa o Número do Passaporte para Gerente.", function() {

        let user = {
          id: "5da9ea674234635bdff45c02",
          name: "Jeremias de Oliveira",
          email: "jere_oli@yahoo.com",
          country: "US",
          state: "MN",
          city: "Saint Paul",
          passportNumber: fixedPassportNumber,
        }

        return request.put(endpoints.toUpdate).send(user).set('Authorization', accounts.admin.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(200)

            expect(responseUpdate.body._links).toBeDefined()
            expect(responseUpdate.body._links).toHaveLength(4)

            const HATEOAS = Generator.genHATEOAS(user.id, 'user', 'users', true)

            for (let cont = 0; cont < responseUpdate.body._links.length; cont++) {
              expect(responseUpdate.body._links[cont]).toMatchObject(HATEOAS[cont])
            }

            return request.get(`${ endpoints.toRead }/${ user.id }`).set('Authorization', accounts.funcionario.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                expect(responseRead.body).toMatchObject({
                  name: user.name,
                  email: user.email,
                  passportNumber: user.passportNumber,
                  cpf: '',
                  address: {
                    country: user.country,
                    state: user.state,
                    city: user.city,
                  }
                })

              })
              .catch(function(errorRead) {
                fail(errorRead)
              })

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      test("/PUT - Deve retornar 200 para Admin que informa o mesmo Número de Passaporte para o Gerente.", function() {

        let user = {
          id: "507f191e810c19729de860ea",
          name: "John Smith John",
          email: "john_sms@hotmail.com",
          passportNumber: "303004786",
        }

        return request.put(endpoints.toUpdate).send(user).set('Authorization', accounts.admin.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(200)

            expect(responseUpdate.body._links).toBeDefined()
            expect(responseUpdate.body._links).toHaveLength(4)

            const HATEOAS = Generator.genHATEOAS(user.id, 'user', 'users', true)

            for (let cont = 0; cont < responseUpdate.body._links.length; cont++) {
              expect(responseUpdate.body._links[cont]).toMatchObject(HATEOAS[cont])
            }

            return request.get(`${ endpoints.toRead }/${ user.id }`).set('Authorization', accounts.funcionario.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                expect(responseRead.body).toMatchObject({
                  name: user.name,
                  email: user.email,
                  passportNumber: user.passportNumber,
                })

              })
              .catch(function(errorRead) {
                fail(errorRead)
              })

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      test("/PUT - Deve retornar 200 para o Admin que atualiza o Local de Nascimento e informa o CPF para Gerente.", function() {

        const fixedForeignCPF = Generator.genCPF()
        let user = {
          id: "507f191e810c19729de860ea",
          name: "John Smith",
          email: "john_sm@hotmail.com",
          cpf: fixedForeignCPF,
          country: "BR",
          state: "AM",
          city: "Manaus",
        }

        return request.put(endpoints.toUpdate).send(user).set('Authorization', accounts.admin.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(200)

            expect(responseUpdate.body._links).toBeDefined()
            expect(responseUpdate.body._links).toHaveLength(4)

            const HATEOAS = Generator.genHATEOAS(user.id, 'user', 'users', true)

            for (let cont = 0; cont < responseUpdate.body._links.length; cont++) {
              expect(responseUpdate.body._links[cont]).toMatchObject(HATEOAS[cont])
            }

            return request.get(`${ endpoints.toRead }/${ user.id }`).set('Authorization', accounts.funcionario.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                expect(responseRead.body).toMatchObject({
                  name: user.name,
                  email: user.email,
                  cpf: user.cpf,
                  passportNumber: '',
                  address: {
                    country: user.country,
                    state: user.state,
                    city: user.city,
                  }
                })

              })
              .catch(function(errorRead) {
                fail(errorRead)
              })

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      test("/PUT - Deve retornar 200 para Funcionário que atualiza suas próprias informações.", function() {

        let user = {
          id: accounts.funcionario.id,
          name: "Alan Jesus",
          phoneNumber: "2129984444",
          birthDate: "1995-11-21",
        }

        return request.put(endpoints.toUpdate).send(user).set('Authorization', accounts.funcionario.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(200)

            return request.get(`${ endpoints.toRead }/${ user.id }`).set('Authorization', accounts.funcionario.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                expect(responseRead.body).toMatchObject({
                  id: user.id,
                  name: user.name,
                  phoneNumber: user.phoneNumber,
                  birthDate: user.birthDate,
                })

              })
              .catch(function(errorRead) {
                fail(errorRead)
              })

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      test("/PUT - Deve retornar 200 para Gerente que atualiza suas próprias informações.", function() {

        let user = {
          id: accounts.gerente.id,
          name: "Ana Cruz",
          phoneNumber: "2129989999",
          birthDate: "1998-07-01",
        }

        return request.put(endpoints.toUpdate).send(user).set('Authorization', accounts.gerente.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(200)

            return request.get(`${ endpoints.toRead }/${ user.id }`).set('Authorization', accounts.gerente.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                expect(responseRead.body).toMatchObject({
                  id: user.id,
                  name: user.name,
                  phoneNumber: user.phoneNumber,
                  birthDate: user.birthDate,
                })
                
              })
              .catch(function(errorRead) {
                fail(errorRead)
              })

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      test("/PUT - Deve retornar 200 para Admin que atualiza suas próprias informações.", function() {

        let user = {
          id: accounts.admin.id,
          name: "Tobias de Oliveira Cruz",
          phoneCode: "55",
          phoneNumber: "69984751212",
          birthDate: "1987-02-09",
        }

        return request.put(endpoints.toUpdate).send(user).set('Authorization', accounts.admin.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(200)

            return request.get(`${ endpoints.toRead }/${ user.id }`).set('Authorization', accounts.admin.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                expect(responseRead.body).toMatchObject({
                  id: user.id,
                  name: user.name,
                  phoneNumber: user.phoneNumber,
                  birthDate: user.birthDate,
                })
                
              })
              .catch(function(errorRead) {
                fail(errorRead)
              })

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      test("/PUT - Deve retornar 200, para Admin que modifica a Função de um Gerente para Funcionário.", function() {

        let user = {
          id: accounts.gerente3.id,
          role: '1'
        }

        return request.put(endpoints.toUpdate).send(user).set('Authorization', accounts.admin.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(200)

            return request.get(`${ endpoints.toRead }/${ user.id }`).set('Authorization', accounts.admin.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                expect(responseRead.body.role).toEqual(user.role)

              })
              .catch(function(errorRead) {
                fail(errorRead)
              })

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      test("/PUT - Deve retornar 200, para Admin que modifica a Função de um Gerente para Funcionário.", function() {

        // Esse gerente foi alterado no teste anterior para Funcionário.
        let user = {
          id: accounts.gerente3.id,
          role: '0'
        }

        return request.put(endpoints.toUpdate).send(user).set('Authorization', accounts.gerente.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(200)

            return request.get(`${ endpoints.toRead }/${ user.id }`).set('Authorization', accounts.gerente.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                expect(responseRead.body.role).toEqual(user.role)

              })
              .catch(function(errorRead) {
                fail(errorRead)
              })

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

    })

    describe("Testes de FALHA.", function() {
      test("/PUT - Deve retornar 401, já que o usuário NÃO está AUTORIZADO.", function() {

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

      test("/PUT - Deve retornar 403, já que o cliente NÃO está AUTENTICADO a mudar sua própria função.", function() {

        let login = {
          email: "dino_oli@hotmail.com",
          password: "@QowierU12873094&28374@",
        }

        return request.post(endpoints.toLogin).send(login)
          .then(function(responseLogin) {

            expect(responseLogin.statusCode).toEqual(200)

            expect(responseLogin.body.token).toBeDefined()
            
            expect(responseLogin.body._links).toBeDefined()
            expect(responseLogin.body._links).toHaveLength(3)


            let { _links, token } = responseLogin.body

            // Pega o ID do usuário logado.
            let id = _links[0].href.split('/').pop()

            const user = {
              id: id,
              name: "Dino Oli",
              email: "dino_oli@hotmail.com",
              password: "@QowierU12873094&28374@",
              role: "1",
              country: "US",
              state: "NY",
              city: "New York City",
              passportNumber: Generator.genPassportNumber()
            }

            return request.put(endpoints.toUpdate).send(user).set("Authorization", `Bearer ${ token }`)
              .then(function(responseUpdate) {

                expect(responseUpdate.statusCode).toEqual(403)

                expect(responseUpdate.body.RestException.Code).toBe('6')
                expect(responseUpdate.body.RestException.Message).toBe('O usuário não está autenticado')
                expect(responseUpdate.body.RestException.Status).toBe('403')
                expect(responseUpdate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/6`)
              })
              .catch(function(errorUpdate) {
                fail(errorUpdate)
              })
          })
          .catch(function(errorLogin) {
            fail(errorLogin)
          })

      })

      test("/PUT - Deve retornar 403, já que o funcionário não pode alterar a Função de uma conta (nenhuma conta)", function() {

        let user = {
          id: accounts.cliente.id,
          role: '1'
        }

        return request.put(endpoints.toUpdate).send(user).set('Authorization', accounts.funcionario.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(403)

            expect(responseUpdate.body.RestException.Code).toBe('6')
            expect(responseUpdate.body.RestException.Message).toBe('O usuário não está autenticado')
            expect(responseUpdate.body.RestException.Status).toBe('403')
            expect(responseUpdate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/6`)

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      test("/PUT - Deve retornar 403, já que o Gerente NÃO tem autenticação alterar a conta do cliente para Gerente.", function() {

        let user = {
          id: accounts.cliente.id,
          role: '2'
        }

        return request.put(endpoints.toUpdate).send(user).set('Authorization', accounts.gerente.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(403)

            expect(responseUpdate.body.RestException.Code).toBe('6')
            expect(responseUpdate.body.RestException.Message).toBe('O usuário não está autenticado')
            expect(responseUpdate.body.RestException.Status).toBe('403')
            expect(responseUpdate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/6`)

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      // Testes na FUNÇÃO DA CONTA QUE ESTÁ SENDO CRIADA (role)
      test("/PUT - Deve retornar 400, devido a função (role) informada ter caracteres inválidos.", function() {

        let user = {
          id: accounts.cliente.id,
          name: "Doralice Cruz",
          email: "dora_cruz@hotmail.com",
          password: "%QiouewR*123423%",
          role: "cliente", // role deve ser um valor numérico
          phoneCode: "55",
          phoneNumber: "11984752352",
          birthDate: "2000-02-11",
          country: "BR",
          state: "SP",
          city: "São Paulo",
          cpf: Generator.genCPF()
        }

        return request.put(endpoints.toUpdate).send(user).set('Authorization', accounts.admin.token)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O campo de Role possui caracteres inválidos")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptRole')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de Role possui caracteres inválidos")
          })
          .catch(function(error) {
            fail(error)
          })

      })

      test("/PUT - Deve retornar 400, devido ao valor da função (role) ser de uma função inexistente.", function() {

        let user = {
          id: accounts.cliente.id,
          name: "Doralice Cruz",
          email: "dora_cruz@hotmail.com",
          password: "%QiouewR*123423%",
          role: "10",
          phoneCode: "55",
          phoneNumber: "11984752352",
          birthDate: "2000-02-11",
          country: "BR",
          state: "SP",
          city: "São Paulo",
          cpf: Generator.genCPF(),
        }

        return request.put(endpoints.toUpdate).send(user).set('Authorization', accounts.admin.token)
          .then(function(response) {

            expect(response.statusCode).toEqual(400)
            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O valor de Role é de uma função inexistente")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptRole')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O valor de Role é de uma função inexistente")

          })
          .catch(function(error) {
            fail(error)
          })

      })

      test("/PUT - Deve retornar 404, já que o ID não correponde a um usuário cadastrado.", function() {

        const user = {
          id: "5da9ea674234635bdff45d22",
          name: "Tobias de Oliveira",
          email: "tobias_atualizado@hotmail.com"
        }

        return request.put(endpoints.toUpdate).send(user).set('Authorization', accounts.funcionario.token)
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

      test("/PUT - Deve retornar 400, já que o usuário não mudou seu local de nascimento para Brasil.", function() {

        const user = {
          id: "600f191e810c19829de900ea",
          name: "Michael Ronald",
          email: "mi_ronald@gmail.com",
          cpf: `${ Generator.genCPF() }`
        }

        return request.put(endpoints.toUpdate).send(user).set('Authorization', accounts.funcionario.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(400)
            expect(responseUpdate.body.RestException.Code).toBe("1")
            expect(responseUpdate.body.RestException.Message).toBe("O campo de País de Nascimento é obrigatório")
            expect(responseUpdate.body.RestException.Status).toBe("400")
            expect(responseUpdate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      test("/PUT - Deve retornar 400, já que o usuário não mudou seu local de nascimento para um país estrangeiro.", function() {

        const user = {
          id: "507f1f77bcf86cd799439011",
          name: "Macunaíma Cruz",
          email: "macuna_curz@hotmail.com",
          passportNumber: `${ Generator.genPassportNumber() }`
        }

        return request.put(endpoints.toUpdate).send(user).set('Authorization', accounts.funcionario.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(400)
            expect(responseUpdate.body.RestException.Code).toBe("1")
            expect(responseUpdate.body.RestException.Message).toBe("O campo de País de Nascimento é obrigatório")
            expect(responseUpdate.body.RestException.Status).toBe("400")
            expect(responseUpdate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      test("/PUT - Deve retornar 400, já que o email informado já está cadastrado e NÃO pertence ao usuário que está sendo atualizado.", function() {

        const user = {
          id: "507f191e810c19729de860ea",
          name: "Tobias de Oliveira",
          email: "luiz_oli@gmail.com"
        }

        return request.put(endpoints.toUpdate).send(user).set('Authorization', accounts.funcionario.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(400)
            expect(responseUpdate.body.RestException.Code).toBe("4")
            expect(responseUpdate.body.RestException.Message).toBe("O Email informado já foi cadastrado anteriormente")
            expect(responseUpdate.body.RestException.Status).toBe("400")
            expect(responseUpdate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/4`)

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      test("/PUT - Deve retornar 400, já que o número do CPF já está cadastrado e NÃO pertence ao usuário que está sendo atualizado.", function() {

        const user = {
          id: "5da9ea674234635bdff45c02",
          name: "Jeremias de Oliveira",
          email: "jere_oliveira@yahoo.com",
          country: "BR",
          state: "PA",
          city: "Belém",
          cpf: fixedCPF
        }

        return request.put(endpoints.toUpdate).send(user).set('Authorization', accounts.funcionario.token)
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

      test("/PUT - Deve retornar 400, já que o Número do Passaporte já está cadastrado e NÃO pertence ao usuário que está sendo atualizado.", function() {

        const user = {
          id: "507f191e810c19729de860ea",
          name: "John Smith",
          email: "john_sm@hotmail.com",
          country: "US",
          state: "NY",
          city: "New York City",
          passportNumber: fixedPassportNumber
        }

        return request.put(endpoints.toUpdate).send(user).set('Authorization', accounts.funcionario.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(400)
            expect(responseUpdate.body.RestException.Code).toBe("4")
            expect(responseUpdate.body.RestException.Message).toBe("Passport number already registred")
            expect(responseUpdate.body.RestException.Status).toBe("400")
            expect(responseUpdate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/4`)

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

    })

  })

  describe("DELETE", function() {

    describe("Testes de SUCESSO.", function() {
      test("/DELETE - Deve retornar 200, para um cliente que deleta a própria conta.", function() {

        let login = {
          email: "josias_cruz@hotmail.com",
          password: "&iOupQwer238974!2",
        }

        return request.post(endpoints.toLogin).send(login)
          .then(function(responseLogin) {

            expect(responseLogin.statusCode).toEqual(200)

            expect(responseLogin.body.token).toBeDefined()

            expect(responseLogin.body._links).toBeDefined()
            expect(responseLogin.body._links).toHaveLength(3)

            let { _links, token } = responseLogin.body

            // Pega o ID do usuário que fez login.
            let id = _links[0].href.split('/').pop()

            return request.delete(`${ endpoints.toDelete }/${ id }`).set('Authorization', `Bearer ${ token }`)
              .then(function(responseDelete) {
                expect(responseDelete.statusCode).toEqual(200)
              })
              .catch(function(error) {
                fail(error)
              })
          })
          .catch(function(errorLogin) {
            fail(errorLogin)
          })
      })

      test("/DELETE - Deve retornar 200, para um funcionário++ que deleta a conta do cliente.", function() {

        let login = {
          email: "tobias@gmail.com",
          password: "@TobiaS&591022@"
        }

        return request.post(endpoints.toLogin).send(login)
          .then(function(responseLogin) {

            expect(responseLogin.statusCode).toEqual(200)

            expect(responseLogin.body.token).toBeDefined()

            expect(responseLogin.body._links).toBeDefined()
            expect(responseLogin.body._links).toHaveLength(4)

            return request.delete(`${ endpoints.toDelete }/600f191e810c19829de900ea`).set('Authorization', `Bearer ${ responseLogin.body.token }`)
              .then(function(responseDelete) {
                expect(responseDelete.statusCode).toEqual(200)
              })
              .catch(function(error) {
                fail(error)
              })
          })
          .catch(function(errorLogin) {
            fail(errorLogin)
          })
      })
    })

    describe("Testes de FALHA.", function() {
      test("/DELETE - Deve retornar 401, já que ninguém está logado.", function() {
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

      test("/DELETE - Deve retornar 403, já um cliente não pode deletar a conta de outro.", function() {
        return request.delete(`${ endpoints.toDelete }/02n07j2d1hf5a2f26djjj92a`).set('Authorization', accounts.cliente.token)
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

      test("/DELETE - Deve retornar 403, já um Cliente não pode deletar a conta de um Funcionário.", function() {
        return request.delete(`${ endpoints.toDelete }/${ accounts.funcionario.id }`).set('Authorization', accounts.cliente.token)
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

      test("/DELETE - Deve retornar 403, já um Cliente não pode deletar a conta de um Gerente.", function() {
        return request.delete(`${ endpoints.toDelete }/${ accounts.gerente.id }`).set('Authorization', accounts.cliente.token)
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

      test("/DELETE - Deve retornar 403, já um Cliente não pode deletar a conta de um Admin.", function() {
        return request.delete(`${ endpoints.toDelete }/${ accounts.admin.id }`).set('Authorization', accounts.cliente.token)
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

      test("/DELETE - Deve retornar 403, já que Funcionário não pode deletar a conta de outro Funcionário.", function() {

        return request.delete(`${ endpoints.toDelete }/${ accounts.funcionario2.id }`).set('Authorization', accounts.funcionario.token)
          .then(function(responseDelete) {

            expect(responseDelete.statusCode).toEqual(403)

            expect(responseDelete.body.RestException.Code).toBe('6')
            expect(responseDelete.body.RestException.Message).toBe('O usuário não está autenticado')
            expect(responseDelete.body.RestException.Status).toBe('403')
            expect(responseDelete.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/6`)

          })
          .catch(function(errorDelete) {
            fail(errorDelete)
          })

      })

      test("/DELETE - Deve retornar 403, já que Funcionário não pode deletar a conta de um Gerente.", function() {

        return request.delete(`${ endpoints.toDelete }/${ accounts.gerente.id }`).set('Authorization', accounts.funcionario.token)
          .then(function(responseDelete) {

            expect(responseDelete.statusCode).toEqual(403)

            expect(responseDelete.body.RestException.Code).toBe('6')
            expect(responseDelete.body.RestException.Message).toBe('O usuário não está autenticado')
            expect(responseDelete.body.RestException.Status).toBe('403')
            expect(responseDelete.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/6`)

          })
          .catch(function(errorDelete) {
            fail(errorDelete)
          })

      })

      test("/DELETE - Deve retornar 403, já que Funcionário não pode deletar a conta de um Admin.", function() {

        return request.delete(`${ endpoints.toDelete }/${ accounts.admin.id }`).set('Authorization', accounts.funcionario.token)
          .then(function(responseDelete) {

            expect(responseDelete.statusCode).toEqual(403)

            expect(responseDelete.body.RestException.Code).toBe('6')
            expect(responseDelete.body.RestException.Message).toBe('O usuário não está autenticado')
            expect(responseDelete.body.RestException.Status).toBe('403')
            expect(responseDelete.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/6`)

          })
          .catch(function(errorDelete) {
            fail(errorDelete)
          })

      })

      test("/DELETE - Deve retornar 403, já que Gerente não pode deletar a conta de outro Gerente.", function() {

        return request.delete(`${ endpoints.toDelete }/${ accounts.gerente2.id }`).set('Authorization', accounts.gerente.token)
          .then(function(responseDelete) {

            expect(responseDelete.statusCode).toEqual(403)

            expect(responseDelete.body.RestException.Code).toBe('6')
            expect(responseDelete.body.RestException.Message).toBe('O usuário não está autenticado')
            expect(responseDelete.body.RestException.Status).toBe('403')
            expect(responseDelete.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/6`)

          })
          .catch(function(errorDelete) {
            fail(errorDelete)
          })

      })

      test("/DELETE - Deve retornar 403, já que Gerente não pode deletar a conta de um Admin.", function() {

        return request.delete(`${ endpoints.toDelete }/${ accounts.admin.id }`).set('Authorization', accounts.gerente.token)
          .then(function(responseDelete) {

            expect(responseDelete.statusCode).toEqual(403)

            expect(responseDelete.body.RestException.Code).toBe('6')
            expect(responseDelete.body.RestException.Message).toBe('O usuário não está autenticado')
            expect(responseDelete.body.RestException.Status).toBe('403')
            expect(responseDelete.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/6`)

          })
          .catch(function(errorDelete) {
            fail(errorDelete)
          })

      })

      test("/DELETE - Deve retornar 404 pelo ID não corresponder a um usuário.", function() {

        return request.delete(`${ endpoints.toDelete }/507f191e810c19729de86444`).set('Authorization', accounts.funcionario.token)
          .then(function(responseDelete) {

            expect(responseDelete.statusCode).toEqual(404)
            expect(responseDelete.body.RestException.Code).toBe('3')
            expect(responseDelete.body.RestException.Message).toBe('Nenhum usuário com o ID informado está cadastrado')
            expect(responseDelete.body.RestException.Status).toBe('404')
            expect(responseDelete.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/3`)
            expect(responseDelete.body.RestException.ErrorFields[0].field).toBe('iptClient')
            expect(responseDelete.body.RestException.ErrorFields[0].hasError.error).toBe('Nenhum usuário com o ID informado está cadastrado')

          })
          .catch(function(errorDelete) {
            fail(errorDelete)
          })

      })

      test("/DELETE - Deve retornar 400, uma vez que o ID tem uma estrutura inválida.", function() {

        return request.delete(`${ endpoints.toDelete }/91e810*c19729de8644-`).set('Authorization', accounts.funcionario.token)
          .then(function(responseDelete) {

            expect(responseDelete.statusCode).toEqual(400)
            expect(responseDelete.body.RestException.Code).toBe('2')
            expect(responseDelete.body.RestException.Message).toBe('O ID do cliente/usuário contém caracteres inválidos')
            expect(responseDelete.body.RestException.Status).toBe('400')
            expect(responseDelete.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseDelete.body.RestException.ErrorFields[0].field).toBe('iptClient')
            expect(responseDelete.body.RestException.ErrorFields[0].hasError.error).toBe('O ID do cliente/usuário contém caracteres inválidos')

          })
          .catch(function(errorDelete) {
            fail(errorDelete)
          })

      })

    })

  })

})