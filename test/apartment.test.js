const app = require('../src/app')
const supertest = require('supertest')
const Generator = require('../src/tools/Generator')

const EndPoints = require('../src/routes/endpoints')
const endpoints = new EndPoints({ singular: 'apartment', plural: 'apartments' })

const request = supertest(app)

const baseURL = 'http://localhost:4000'
const projectLinks = {
  errors: 'https://projetohotelparaiso.dev/docs/erros'
}

let accounts = {
  admin: { id: '', token: '' },
  gerente: { id: '', token: '' },
  funcionario: { id: '', token: '' },
  cliente: { id: '', token: ''  }
}

// Aumenta o tempo máximo para resposta - o padrão é 5000ms.
jest.setTimeout(20000)

function register(user) {

  return new Promise((resolve, reject) => {

    return request.post('/user').send(user)
      .then(response => {

        if (response.statusCode == 201) {

          let id = response.body._links[0].href.split('/').pop()
          let login = {
            email: user.email,
            password: user.password
          }
          resolve({ id, login })

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

    return request.post('/login').send(login)
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

    return request.put('/user').send({
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
      accounts.admin.token = `Bearer ${ tokenAdmin.token }`
    } catch (errorAdmin) {
      console.log(errorAdmin)
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
      await updateRole(accounts.gerente.id, '2')
      let tokenGerente = await login(gerenteLogin)
      accounts.gerente.token = `Bearer ${ tokenGerente.token }`
    } catch (errorGerente) {
      console.log(errorGerente)
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
      await updateRole(accounts.funcionario.id, '1')
      let tokenFuncionario = await login(funcionarioLogin)
      accounts.funcionario.token = `Bearer ${ tokenFuncionario.token }`
    } catch (errorFuncionario) {
      console.log(errorFuncionario)
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
      accounts.cliente.token = `Bearer ${ tokenCliente.token }`
    } catch (errorCliente) {
      console.log(errorCliente)
    }

  } catch (error) {
    console.log(error)
  }

})

describe("Suite de testes das rotas de Apartment.", function() {
  describe("CREATE", function() {

    describe("Testes de SUCESSO.", function() {
      test("/POST - Deve retornar 201, para sucesso no cadastro de um apartamento.", function() {

        let apartment = {
          floor: "1",
          number: "3",
          rooms: [
            {
              room: 'sala de estar',
              quantity: '1'
            },
            {
              room: 'cozinha',
              quantity: '1'
            },
            {
              room: 'banheiro',
              quantity: '1'
            },
            {
              room: 'quarto',
              quantity: '1'
            }
          ],
          daily_price: '200'
        }

        return request.post(endpoints.toCreate).send(apartment).set('Authorization', accounts.admin.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(201)

            expect(responseCreate.body._links).toBeDefined()
            expect(responseCreate.body._links).toHaveLength(4)

          })
          .catch(function(error) {
            fail(error)
          })

      })

    })

    describe("Testes de FALHA.", function() {

      test("/POST - Deve retornar 401, o usuário não está AUTORIZADO.", function() {

        let apartment = {
          floor: "1",
          number: "3",
          rooms: [
            {
              room: 'sala de estar',
              quantity: '1'
            },
            {
              room: 'cozinha',
              quantity: '1'
            },
            {
              room: 'banheiro',
              quantity: '1'
            },
            {
              room: 'quarto',
              quantity: '1'
            }
          ],
          daily_price: '200'
        }

        return request.post(endpoints.toCreate).send(apartment)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(401)

            expect(responseCreate.body.RestException.Code).toBe('5')
            expect(responseCreate.body.RestException.Message).toBe('O usuário não está autorizado')
            expect(responseCreate.body.RestException.Status).toBe('401')
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/5`)

          })
          .catch(function(error) {
            fail(error)
          })

      })

      test("/POST - Deve retornar 403, um Funcionário não pode cadastrar um apartamento.", function() {

        let apartment = {
          floor: "1",
          number: "3",
          rooms: [
            {
              room: 'sala de estar',
              quantity: '1'
            },
            {
              room: 'cozinha',
              quantity: '1'
            },
            {
              room: 'banheiro',
              quantity: '1'
            },
            {
              room: 'quarto',
              quantity: '1'
            }
          ],
          daily_price: '200'
        }

        return request.post(endpoints.toCreate).send(apartment).set('Authorization', accounts.funcionario.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(403)

            expect(responseCreate.body.RestException.Code).toBe('6')
            expect(responseCreate.body.RestException.Message).toBe('O usuário não está autenticado')
            expect(responseCreate.body.RestException.Status).toBe('403')
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/6`)

          })
          .catch(function(error) {
            fail(error)
          })

      })

      test("/POST - Deve retornar 403, um Gerente não pode cadastrar um apartamento.", function() {

        let apartment = {
          floor: "1",
          number: "3",
          rooms: [
            {
              room: 'sala de estar',
              quantity: '1'
            },
            {
              room: 'cozinha',
              quantity: '1'
            },
            {
              room: 'banheiro',
              quantity: '1'
            },
            {
              room: 'quarto',
              quantity: '1'
            }
          ],
          daily_price: '200'
        }

        return request.post(endpoints.toCreate).send(apartment).set('Authorization', accounts.gerente.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(403)

            expect(responseCreate.body.RestException.Code).toBe('6')
            expect(responseCreate.body.RestException.Message).toBe('O usuário não está autenticado')
            expect(responseCreate.body.RestException.Status).toBe('403')
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/6`)

          })
          .catch(function(error) {
            fail(error)
          })

      })

      // Validação do Piso do apartamento.
      test("/POST - Deve retornar 400 pela ausência do campo de Piso (floor) do apartamento.", function() {

        let apartment = {
          floor: "",
          number: "9",
          rooms: [
            {
              room: 'sala de estar',
              quantity: '1'
            },
            {
              room: 'cozinha',
              quantity: '1'
            },
            {
              room: 'banheiro',
              quantity: '1'
            },
            {
              room: 'quarto',
              quantity: '1'
            }
          ],
          daily_price: '200'
        }

        return request.post(endpoints.toCreate).send(apartment).set('Authorization', accounts.admin.token)
          .then(function(response) {

            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("1")
            expect(response.body.RestException.Message).toBe("O campo de Piso do apartamento é obrigatório")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptFloor')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('O campo de Piso do apartamento é obrigatório')

          })
          .catch(function(error) {
            fail(error)
          })

      })

      test("/POST - Deve retornar 400, pelo valor do Piso (floor) do apartamento ser inválido.", function() {

        let apartment = {
          floor: "occuped",
          number: "9",
          rooms: [
            {
              room: 'sala de estar',
              quantity: '1'
            },
            {
              room: 'cozinha',
              quantity: '1'
            },
            {
              room: 'banheiro',
              quantity: '1'
            },
            {
              room: 'quarto',
              quantity: '1'
            }
          ],
          daily_price: '200'
        }

        // O valor de floor deve ser NUMÉRICO.
        return request.post(endpoints.toCreate).send(apartment).set('Authorization', accounts.admin.token)
          .then(function(response) {

            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O valor do campo do Piso do apartamento é inválido")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptFloor')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('O valor do campo do Piso do apartamento é inválido')

          })
          .catch(function(error) {
            fail(error)
          })

      })

      test("/POST - Deve retornar 400, pelo valor do Piso (floor) do apartamento ser inválido (estar fora do intervalo válido).", function() {

        let apartment = {
          floor: "88",
          number: "9",
          rooms: [
            {
              room: 'sala de estar',
              quantity: '1'
            },
            {
              room: 'cozinha',
              quantity: '1'
            },
            {
              room: 'banheiro',
              quantity: '1'
            },
            {
              room: 'quarto',
              quantity: '1'
            }
          ],
          daily_price: '200'
        }

        return request.post(endpoints.toCreate).send(apartment).set('Authorization', accounts.admin.token)
          .then(function(response) {

            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O Piso informado não existe")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptFloor')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('O Piso informado não existe')

          })
          .catch(function(error) {
            fail(error)
          })

      })

      // Validação do Número do apartamento.
      test("/POST - Deve retornar 400, pela ausência do campo de Número do apartamento.", function() {

        let apartment = {
          floor: "3",
          number: "",
          rooms: [
            {
              room: 'sala de estar',
              quantity: '1'
            },
            {
              room: 'cozinha',
              quantity: '1'
            },
            {
              room: 'banheiro',
              quantity: '1'
            },
            {
              room: 'quarto',
              quantity: '1'
            }
          ],
          daily_price: '200'
        }

        return request.post(endpoints.toCreate).send(apartment).set('Authorization', accounts.admin.token)
          .then(function(response) {

            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("1")
            expect(response.body.RestException.Message).toBe("O campo Número do Apartamento é obrigatório")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptNumber')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('O campo Número do Apartamento é obrigatório')

          })
          .catch(function(error) {
            fail(error)
          })

      })

      test("/POST - Deve retornar 400, pelo valor do Número do apartamento ser inválido.", function() {

        let apartment = {
          floor: "3",
          number: "um",
          rooms: [
            {
              room: 'sala de estar',
              quantity: '1'
            },
            {
              room: 'cozinha',
              quantity: '1'
            },
            {
              room: 'banheiro',
              quantity: '1'
            },
            {
              room: 'quarto',
              quantity: '1'
            }
          ],
          daily_price: '200'
        }

        // O valor de Número do Apartamento deve ser NUMÉRICO.
        return request.post(endpoints.toCreate).send(apartment).set('Authorization', accounts.admin.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("2")
            expect(responseCreate.body.RestException.Message).toBe("O valor do campo de Número do Apartamento é inválido")
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptNumber')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe('O valor do campo de Número do Apartamento é inválido')

          })
          .catch(function(error) {
            fail(error)
          })

      })

      test("/POST - Deve retornar 400, devido ao valor do Número do Apartamento já ter sido cadastrado anteriormente.", function() {

        let apartment = {
          floor: "3",
          number: "11",
          rooms: [
            {
              room: 'sala de estar',
              quantity: '1'
            },
            {
              room: 'cozinha',
              quantity: '1'
            },
            {
              room: 'banheiro',
              quantity: '1'
            },
            {
              room: 'quarto',
              quantity: '1'
            }
          ],
          daily_price: '200'
        }

        return request.post(endpoints.toCreate).send(apartment).set('Authorization', accounts.admin.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("4")
            expect(responseCreate.body.RestException.Message).toBe("O Número do Apartamento já está cadastrado")
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/4`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptNumber')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe("O Número do Apartamento já está cadastrado")

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      // Validação dos cômodos
      test("/POST - Deve retornar 400, pela ausência dos valores dos cômodos do apartamento.", function() {

        const apartment = {
          floor: "3",
          number: "10",
          rooms: [],
          daily_price: '200'
        }

        return request.post(endpoints.toCreate).send(apartment).set('Authorization', accounts.admin.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("1")
            expect(responseCreate.body.RestException.Message).toBe("O campo de Cômodos é obrigatório")
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptRooms')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de Cômodos é obrigatório")

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      test("/POST - Deve retornar 400, pela ausência do valor do nome do campo obrigatório.", function() {

        let apartment = {
          floor: "3",
          number: "10",
          rooms: [
            {
              room: '',
              quantity: '1'
            }
          ],
          daily_price: '200'
        }

        return request.post(endpoints.toCreate).send(apartment).set('Authorization', accounts.admin.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("2")
            expect(responseCreate.body.RestException.Message).toBe('Um dos campos dos comodos informados não possui valor')
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptRooms')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe('Um dos campos dos comodos informados não possui valor')

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      test("/POST - Deve retornar 400, pela presença de campos inválidos nos cômodos do apartamento.", function() {

        let apartment = {
          floor: "3",
          number: "10",
          rooms: [
            {
              // Não é 'rooms' e sim 'room'
              rooms: 'sala de estar',
              quantity: '1'
            }
          ],
          daily_price: '200'
        }

        return request.post(endpoints.toCreate).send(apartment).set('Authorization', accounts.admin.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("2")
            expect(responseCreate.body.RestException.Message).toBe('A lista de cômodos possui campos inválidos')
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptRooms')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe('A lista de cômodos possui campos inválidos')

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      test("/POST - Deve retornar 400, pela presença de um caracter inválido no nome do cômodo do apartamento.", function() {

        let apartment = {
          floor: "3",
          number: "10",
          rooms: [
            {
              room: 'sala de estar*',
              quantity: '1'
            }
          ],
          daily_price: '200'
        }

        return request.post(endpoints.toCreate).send(apartment).set('Authorization', accounts.admin.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("2")
            expect(responseCreate.body.RestException.Message).toBe(`'${ apartment.rooms[0].room }' possui caracteres inválidos`)
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptRooms')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe(`'${ apartment.rooms[0].room }' possui caracteres inválidos`)

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      test("/POST - Deve retornar 400, pela ausência de um campo no cômodo do apartamento.", function() {

        let apartment = {
          floor: "3",
          number: "10",
          rooms: [
            {
              quantity: '1'
            }
          ],
          daily_price: '200'
        }

        return request.post(endpoints.toCreate).send(apartment).set('Authorization', accounts.admin.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("2")
            expect(responseCreate.body.RestException.Message).toBe('Faltam campos em um dos cômodos informados')
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptRooms')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe('Faltam campos em um dos cômodos informados')

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      test("/POST - Deve retornar 400, devido a presença de caracteres inválidos na quantidade de um determinado comodo.", function() {

        let apartment = {
          floor: "3",
          number: "10",
          rooms: [
            {
              room: 'sala de estar',
              quantity: 'um'
            }
          ],
          daily_price: '200'
        }

        return request.post(endpoints.toCreate).send(apartment).set('Authorization', accounts.admin.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("2")
            expect(responseCreate.body.RestException.Message).toBe(`A quantidade de ${ apartment.rooms[0].room } possui caracteres inválidos`)
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptRooms')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe(`A quantidade de ${ apartment.rooms[0].room } possui caracteres inválidos`)

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      test("/POST - Deve retornar 400, devido ao valor da quantidade de cômodo estar fora do intervalo válido.", function() {

        let apartment = {
          floor: "3",
          number: "10",
          rooms: [
            {
              room: 'cozinha',
              quantity: '-1'
            }
          ],
          daily_price: '200'
        }

        return request.post(endpoints.toCreate).send(apartment).set('Authorization', accounts.admin.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("2")
            expect(responseCreate.body.RestException.Message).toBe(`A quantidade de ${ apartment.rooms[0].room } é inválida`)
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptRooms')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe(`A quantidade de ${ apartment.rooms[0].room } é inválida`)

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      test("/POST - Deve retornar 400, devido a presença de ponto na quantidade comodo.", function() {

        let apartment = {
          floor: "3",
          number: "10",
          rooms: [
            {
              room: 'cozinha',
              quantity: '1.2'
            }
          ],
          daily_price: '200'
        }

        return request.post(endpoints.toCreate).send(apartment).set('Authorization', accounts.admin.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("2")
            expect(responseCreate.body.RestException.Message).toBe(`A quantidade de ${ apartment.rooms[0].room } possui caracteres inválidos`)
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptRooms')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe(`A quantidade de ${ apartment.rooms[0].room } possui caracteres inválidos`)

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      test("/POST - Deve retornar 400, devido a presença de ponto na quantidade comodo.", function() {

        let apartment = {
          floor: "3",
          number: "10",
          rooms: [
            {
              room: 'cozinha',
              quantity: '1,2'
            }
          ],
          daily_price: '200'
        }

        return request.post(endpoints.toCreate).send(apartment).set('Authorization', accounts.admin.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("2")
            expect(responseCreate.body.RestException.Message).toBe(`A quantidade de ${ apartment.rooms[0].room } possui caracteres inválidos`)
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptRooms')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe(`A quantidade de ${ apartment.rooms[0].room } possui caracteres inválidos`)

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      // Validação da diária do apartamento.
      test("/POST - Deve retornar 400, devido a ausência do valor da diária.", function() {

        let apartment = {
          floor: "3",
          number: "10",
          rooms: [
            {
              room: 'sala de estar',
              quantity: '1'
            },
            {
              room: 'cozinha',
              quantity: '1'
            },
            {
              room: 'banheiro',
              quantity: '1'
            },
            {
              room: 'quarto',
              quantity: '1'
            }
          ],
          daily_price: ''
        }

        return request.post(endpoints.toCreate).send(apartment).set('Authorization', accounts.admin.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("1")
            expect(responseCreate.body.RestException.Message).toBe("O campo de Diária do Apartamento é obrigatório")
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptDailyPrice')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de Diária do Apartamento é obrigatório")

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      test("/POST - Deve retornar 400, devido ao valor da diária ser inválido.", function() {

        let apartment = {
          floor: "3",
          number: "10",
          rooms: [
            {
              room: 'sala de estar',
              quantity: '1'
            },
            {
              room: 'cozinha',
              quantity: '1'
            },
            {
              room: 'banheiro',
              quantity: '1'
            },
            {
              room: 'quarto',
              quantity: '1'
            }
          ],
          daily_price: '-800'
        }

        return request.post(endpoints.toCreate).send(apartment).set('Authorization', accounts.admin.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("2")
            expect(responseCreate.body.RestException.Message).toBe("O valor da diária é inválido")
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptDailyPrice')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe("O valor da diária é inválido")

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      test("/POST - Deve retornar 400, devido a presença de caracteres inválidos no valor da diária.", function() {

        let apartment = {
          floor: "3",
          number: "10",
          rooms: [
            {
              room: 'sala de estar',
              quantity: '1'
            },
            {
              room: 'cozinha',
              quantity: '1'
            },
            {
              room: 'banheiro',
              quantity: '1'
            },
            {
              room: 'quarto',
              quantity: '1'
            }
          ],
          daily_price: '800a'
        }

        return request.post(endpoints.toCreate).send(apartment).set('Authorization', accounts.admin.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("2")
            expect(responseCreate.body.RestException.Message).toBe("O valor da diária contém caracteres inválidos")
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptDailyPrice')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe("O valor da diária contém caracteres inválidos")

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      test("/POST - Deve retornar 400, devido a presença de caracteres inválidos no valor da diária.", function() {

        let apartment = {
          floor: "3",
          number: "10",
          rooms: [
            {
              room: 'sala de estar',
              quantity: '1'
            },
            {
              room: 'cozinha',
              quantity: '1'
            },
            {
              room: 'banheiro',
              quantity: '1'
            },
            {
              room: 'quarto',
              quantity: '1'
            }
          ],
          daily_price: '800,52'
        }

        return request.post(endpoints.toCreate).send(apartment).set('Authorization', accounts.admin.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("2")
            expect(responseCreate.body.RestException.Message).toBe("O separador de decimal do valor da diária é inválido")
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptDailyPrice')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe("O separador de decimal do valor da diária é inválido")

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      test("/POST - Deve retornar 400, devido a presença de caracteres inválidos no valor da diária.", function() {

        let apartment = {
          floor: "3",
          number: "10",
          rooms: [
            {
              room: 'sala de estar',
              quantity: '1'
            },
            {
              room: 'cozinha',
              quantity: '1'
            },
            {
              room: 'banheiro',
              quantity: '1'
            },
            {
              room: 'quarto',
              quantity: '1'
            }
          ],
          daily_price: '800.525'
        }

        return request.post(endpoints.toCreate).send(apartment).set('Authorization', accounts.admin.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("2")
            expect(responseCreate.body.RestException.Message).toBe("A quantidade de casas decimais é inválida")
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptDailyPrice')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe("A quantidade de casas decimais é inválida")

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

    })

  })

  describe("READ", function() {
    describe("Testes de SUCESSO.", function() {
      test("/GET - Deve retornar 200, para busca de um apartamento pelo seu ID.", function() {
        let apartment = { id: 'd9d62beecdde62af82efd82c' }
        return request.get(`${ endpoints.toRead }/${ apartment.id }`)
          .then(function(response) {
            const {
              id,
              floor,
              number,
              rooms,
              daily_price,
              reserve,
              created,
              updated,
              _links
            } = response.body

            expect(response.statusCode).toEqual(200)

            expect(id).toBeDefined()
            expect(id).toBe(apartment.id)

            expect(floor).toBeDefined()
            expect(floor).toBe("3")

            expect(number).toBeDefined()
            expect(number).toBe("12")

            expect(rooms).toBeDefined()
            expect(rooms).toHaveLength(4)

            expect(rooms[0]).toBeDefined()
            expect(rooms[0]).toMatchObject({
              room: "sala de estar",
              quantity: "1"
            })

            expect(rooms[1]).toBeDefined()
            expect(rooms[1]).toMatchObject({
              room: "cozinha",
              quantity: "1"
            })

            expect(rooms[2]).toBeDefined()
            expect(rooms[2]).toMatchObject({
              room: "banheiro",
              quantity: "2"
            })

            expect(rooms[3]).toBeDefined()
            expect(rooms[3]).toMatchObject({
              room: "quarto",
              quantity: "2"
            })

            expect(daily_price).toBeDefined()
            expect(daily_price).toEqual("500")

            expect(reserve).toBeDefined()
            expect(reserve).toMatchObject({
              status: "ocupado",
              user_id: "600f191e810c19829de900ea",
              date: "2022-08-12T22:49:04.421Z",
              start: "2022-11-12",
              end: "2023-01-12"
            })

            expect(created).toBeDefined()
            expect(created).toMatchObject({
              createdAt: "2022-06-12T22:01:20.596Z",
              createdBy: "5da9ea674234635bdff45c02"
            })

            expect(updated).toBeDefined()
            expect(updated).toMatchObject({
              updatedAt: "2023-01-12T10:25:49.045Z",
              updatedBy: "507f1f77bcf86cd799439011"
            })

            expect(_links).toBeDefined()
            expect(_links).toHaveLength(4)
            expect(_links[0]).toMatchObject({
              href: `${ baseURL }/apartments/${ id }`,
              method: 'GET',
              rel: 'self_apartment'
            })
            expect(_links[1]).toMatchObject({
              href: `${ baseURL }/apartments/${ id }`,
              method: 'PUT',
              rel: 'edit_apartment'
            })
            expect(_links[2]).toMatchObject({
              href: `${ baseURL }/apartments/${ id }`,
              method: 'DELETE',
              rel: 'delete_apartment'
            })
            expect(_links[3]).toMatchObject({
              href: `${ baseURL }/apartments`,
              method: 'GET',
              rel: 'apartment_list'
            })
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("GET - Deve retornar uma lista de apartamentos.", function() {
        return request.get(endpoints.toList)
          .then(function(response) {
            expect(response.statusCode).toEqual(200)

            expect(response.body).toHaveProperty('apartments')
            expect(response.body).toHaveProperty('hasNext')

            expect(response.body.hasNext).toBe(false)

            for (let apartment of response.body.apartments) {
              expect(apartment._links).toBeDefined()
              expect(apartment._links).toHaveLength(3)
            }
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("GET - Deve retornar uma lista de usuários, contendo limite de usuários.", function() {
        let url = endpoints.toList + '?offset=1&limit=3'
        return request.get(url)
          .then(function(response) {
            expect(response.statusCode).toEqual(200)
            expect(response.body.apartments.length).toEqual(2)

            expect(response.body).toHaveProperty('apartments')
            expect(response.body).toHaveProperty('hasNext')

            for (let user of response.body.apartments) {
              expect(user._links).toBeDefined()
              expect(user._links).toHaveLength(3)
            }
          })
          .catch(function(error) {
            fail(error)
          })
      })
    })

    describe("Testes de FALHA.", function() {

      // Leituras individuais de apartamentos
      test("/GET - Deve retornar 400, já que o ID do apartamento não foi informado.", function() {
        return request.get(`${ endpoints.toRead }/856377c88f8fd9fc65fd3ef*`)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O ID do apartamento contém caracteres inválidos")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/GET - Deve retornar 404, já que o ID não pertence a um apartamento cadastrado.", function() {
        return request.get(`${ endpoints.toRead }/d9d62beecdde62af82efd82d`)
          .then(function(response) {
            expect(response.statusCode).toEqual(404)

            expect(response.body.RestException.Code).toBe("3")
            expect(response.body.RestException.Message).toBe("Nenhum apartamento com o ID informado está cadastrado")
            expect(response.body.RestException.Status).toBe("404")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/3`)
          })
          .catch(function(error) {
            fail(error)
          })
      })
    })
  })

  describe("UPDATE", function() {
    describe("Testes de SUCESSO.", function() {
      test("/PUT - Deve retornar 200, para sucesso na atualização das informações de um apartamento.", function() {

        let apartment = {
          id: "d9d62beecdde62af82efd82c",
          floor: "3",
          number: "7",
          rooms: [
            {
              room: "sala de estar",
              quantity: "1"
            },
            {
              room: "cozinha",
              quantity: "1"
            },
            {
              room: "banheiro",
              quantity: "1"
            },
            {
              room: "quarto",
              quantity: "1"
            }
          ],
          daily_price: "400",
        }

        return request.put(endpoints.toUpdate).send(apartment)
          .then(function(responsePUT) {
            if (responsePUT.body.RestException) {
              console.log(responsePUT.body.RestException)
            }

            expect(responsePUT.statusCode).toEqual(200)

            expect(responsePUT.body._links).toBeDefined()
            expect(responsePUT.body._links).toHaveLength(4)
            expect(responsePUT.body._links[0]).toMatchObject({
              href: `${ baseURL }/apartments/${ apartment.id }`,
              method: 'GET',
              rel: 'self_apartment'
            })
            expect(responsePUT.body._links[1]).toMatchObject({
              href: `${ baseURL }/apartments/${ apartment.id }`,
              method: 'PUT',
              rel: 'edit_apartment'
            })
            expect(responsePUT.body._links[2]).toMatchObject({
              href: `${ baseURL }/apartments/${ apartment.id }`,
              method: 'DELETE',
              rel: 'delete_apartment'
            })
            expect(responsePUT.body._links[3]).toMatchObject({
              href: `${ baseURL }/apartments`,
              method: 'GET',
              rel: 'apartment_list'
            })

            return request.get(`${ endpoints.toRead }/${ apartment.id }`)
              .then(function(responseGET) {
                const {
                  id,
                  floor,
                  number,
                  rooms,
                  updated,
                  _links
                } = responseGET.body

                expect(id).toBeDefined()
                expect(id).toBe(apartment.id)

                expect(floor).toBeDefined()
                expect(floor).toBe("3")

                expect(number).toBeDefined()
                expect(number).toBe("7")

                expect(rooms).toBeDefined()
                expect(rooms).toHaveLength(4)

                expect(updated).toBeDefined()
                expect(updated).toMatchObject({
                  updatedAt: expect.any(String),
                  updatedBy: expect.any(String)
                })

                expect(_links).toBeDefined()
                expect(_links).toHaveLength(4)
                expect(_links[0]).toMatchObject({
                  href: `${ baseURL }/apartments/${ id }`,
                  method: 'GET',
                  rel: 'self_apartment'
                })
                expect(_links[1]).toMatchObject({
                  href: `${ baseURL }/apartments/${ id }`,
                  method: 'PUT',
                  rel: 'edit_apartment'
                })
                expect(_links[2]).toMatchObject({
                  href: `${ baseURL }/apartments/${ id }`,
                  method: 'DELETE',
                  rel: 'delete_apartment'
                })
                expect(_links[3]).toMatchObject({
                  href: `${ baseURL }/apartments`,
                  method: 'GET',
                  rel: 'apartment_list'
                })
              })
              .catch(function(errorGET) {
                fail(errorGET)
              })
          })
          .catch(function(errorPUT) {
            fail(errorPUT)
          })
      })

      test("/PUT - Deve retornar 200, para sucesso na atualização das informações de um apartamento, onde se faz uso de seu próprio número.", function() {

        let apartment = {
          id: "856377c88f8fd9fc65fd3ef5",
          floor: "3",
          number: "11",
          rooms: [
            {
              room: "sala de estar",
              quantity: "1"
            },
            {
              room: "cozinha",
              quantity: "1"
            },
            {
              room: "banheiro",
              quantity: "1"
            },
            {
              room: "quarto",
              quantity: "1"
            }
          ],
          daily_price: "400",
        }

        return request.put(endpoints.toUpdate).send(apartment)
          .then(function(responsePUT) {
            if (responsePUT.body.RestException) {
              console.log(responsePUT.body.RestException)
            }

            expect(responsePUT.statusCode).toEqual(200)

            return request.get(`${ endpoints.toRead }/${ apartment.id }`)
              .then(function(responseGET) {
                const {
                  id,
                  floor,
                  number,
                  rooms,
                  updated,
                  _links
                } = responseGET.body

                expect(id).toBeDefined()
                expect(id).toBe(apartment.id)

                expect(floor).toBeDefined()
                expect(floor).toBe("3")

                expect(number).toBeDefined()
                expect(number).toBe("11")

                expect(rooms).toBeDefined()
                expect(rooms).toHaveLength(4)

                expect(updated).toBeDefined()
                expect(updated).toMatchObject({
                  updatedAt: expect.any(String),
                  updatedBy: expect.any(String)
                })

                expect(_links).toBeDefined()
                expect(_links).toHaveLength(4)
                expect(_links[0]).toMatchObject({
                  href: `${ baseURL }/apartments/${ id }`,
                  method: 'GET',
                  rel: 'self_apartment'
                })
                expect(_links[1]).toMatchObject({
                  href: `${ baseURL }/apartments/${ id }`,
                  method: 'PUT',
                  rel: 'edit_apartment'
                })
                expect(_links[2]).toMatchObject({
                  href: `${ baseURL }/apartments/${ id }`,
                  method: 'DELETE',
                  rel: 'delete_apartment'
                })
                expect(_links[3]).toMatchObject({
                  href: `${ baseURL }/apartments`,
                  method: 'GET',
                  rel: 'apartment_list'
                })
              })
              .catch(function(errorGET) {
                fail(errorGET)
              })
          })
          .catch(function(errorPUT) {
            fail(errorPUT)
          })
      })

      test("/PUT - Deve retornar 200, para sucesso na atualização parcial das informações de um apartamento.", function() {

        let apartment = {
          id: "856377c88f8fd9fc65fd3ef5",
          rooms: [
            {
              room: "sala de estar",
              quantity: "1"
            },
            {
              room: "cozinha",
              quantity: "1"
            },
            {
              room: "banheiro",
              quantity: "2"
            },
            {
              room: "quarto",
              quantity: "3"
            }
          ],
          daily_price: "1000",
        }

        return request.put(endpoints.toUpdate).send(apartment)
          .then(function(responsePUT) {
            if (responsePUT.body.RestException) {
              console.log(responsePUT.body.RestException)
            }
            expect(responsePUT.statusCode).toEqual(200)

            return request.get(`${ endpoints.toRead }/${ apartment.id }`)
              .then(function(responseGET) {
                expect(responseGET.body.rooms[2]).toMatchObject({
                  room: "banheiro",
                  quantity: "2"
                })
                expect(responseGET.body.rooms[3]).toMatchObject({
                  room: "quarto",
                  quantity: "3"
                })
                expect(responseGET.body.daily_price).toBe('1000')
              })
              .catch(function(errorGET) {
                fail(errorGET)
              })
          })
          .catch(function(errorPUT) {
            fail(errorPUT)
          })
      })
    })
    describe("Testes de FALHA.", function() {
      test("/PUT - Deve retornar 400, uma vez que o ID informado é inválido.", function() {
        let apartment = { 
          id: 'ljb9kf3d5a65f17ljf2i0kc*',
          floor: "3",
          number: "9",
          rooms: [
            {
              room: 'sala de estar',
              quantity: '1'
            },
            {
              room: 'cozinha',
              quantity: '1'
            },
            {
              room: 'banheiro',
              quantity: '1'
            },
            {
              room: 'quarto',
              quantity: '1'
            }
          ],
          daily_price: '200'
        }
        return request.put(endpoints.toUpdate).send(apartment)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O ID do apartamento contém caracteres inválidos")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/PUT - Deve retornar 404, uma vez que o ID informado não pertence a um apartamento.", function() {
        let apartment = {
          id: 'ljb9kf3d5a65f17ljf2i0kc7',
          floor: "3",
          number: "9",
          rooms: [
            {
              room: 'sala de estar',
              quantity: '1'
            },
            {
              room: 'cozinha',
              quantity: '1'
            },
            {
              room: 'banheiro',
              quantity: '1'
            },
            {
              room: 'quarto',
              quantity: '1'
            }
          ],
          daily_price: '200'
        }
        return request.put(endpoints.toUpdate).send(apartment)
          .then(function(response) {
            expect(response.statusCode).toEqual(404)

            expect(response.body.RestException.Code).toBe("3")
            expect(response.body.RestException.Message).toBe("Nenhum apartamento com o ID informado está cadastrado")
            expect(response.body.RestException.Status).toBe("404")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/3`)
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/PUT - Deve retornar 400, já que o número informado já está cadastrado e NÃO pertence ao apartamento que está sendo atualizado.", function() {
        let apartment = {
          id: 'd9d62beecdde62af82efd82c',
          floor: "3",
          number: "11",
          rooms: [
            {
              room: 'sala de estar',
              quantity: '1'
            },
            {
              room: 'cozinha',
              quantity: '1'
            },
            {
              room: 'banheiro',
              quantity: '1'
            },
            {
              room: 'quarto',
              quantity: '1'
            }
          ],
          daily_price: '200'
        }
        return request.put(endpoints.toUpdate).send(apartment)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("4")
            expect(response.body.RestException.Message).toBe("O Número do Apartamento já está cadastrado")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/4`)
          })
          .catch(function(error) {
            fail(error)
          })
      })
    })
  })

  describe("DELETE", function() {
    describe("Testes de SUCESSO.", function() {
      test("Deve retornar 200, na delecao de um apartamento.", function() {
        return request.delete(`${ endpoints.toDelete }/856377c88f8fd9fc65fd3ef5`)
          .then(function(responseDELETE) {
            expect(responseDELETE.statusCode).toEqual(200)

            return request.get(`${ endpoints.toRead }/856377c88f8fd9fc65fd3ef5`)
              .then(function(responseGET) {
                expect(responseGET.statusCode).toEqual(404)

                expect(responseGET.body.RestException.Code).toBe("3")
                expect(responseGET.body.RestException.Message).toBe("Nenhum apartamento com o ID informado está cadastrado")
                expect(responseGET.body.RestException.Status).toBe("404")
                expect(responseGET.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/3`)
              })
              .catch(function(errorGET) {
                fail(errorGET)
              })
          })
          .catch(function(errorDELETE) {
            fail(errorDELETE)
          })
      })
    })

    describe("Testes de FALHA.", function() {
      test("/DELETE - Deve retornar 400, já que o ID possui caracteres inválidos.", function() {
        return request.delete(`${ endpoints.toDelete }/856377c88f8fd9fc65fd3e*5`)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O ID do apartamento contém caracteres inválidos")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/DELETE - Deve retornar 404, já que o ID não pertence a um apartamento.", function() {
        return request.delete(`${ endpoints.toDelete }/856377c88f8fd9fc65fd315`)
          .then(function(response) {
            expect(response.statusCode).toEqual(404)

            expect(response.body.RestException.Code).toBe("3")
            expect(response.body.RestException.Message).toBe("Nenhum apartamento com o ID informado está cadastrado")
            expect(response.body.RestException.Status).toBe("404")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/3`)
          })
          .catch(function(error) {
            fail(error)
          })
      })
    })
  })
})