const app = require('../src/app')
const supertest = require('supertest')
const Generator = require('../src/tools/Generator')

const DateFormated = require('../src/tools/DateFormated')
const dateNow = new DateFormated('mongodb')

const EndPoints = require('../src/routes/endpoints')
const endpoints = new EndPoints({ singular: 'reserve', plural: 'reserves' })

let request = supertest(app)

let baseURL = 'http://localhost:4000'
const projectLinks = {
  errors: 'https://projetohotelparaiso.dev/docs/erros'
}

let accounts = {
  admin: { id: '', token: '' },
  gerente: { id: '', token: '' },
  funcionario: { id: '', token: '' },
  funcionario2: { id: '', token: '' },
  cliente: { id: '', token: ''  },
  cliente2: { id: '', token: '' },
}

// Aumenta o tempo máximo para resposta - o padrão é 5000ms.
jest.setTimeout(100000)

function getDateWithNextMonth(_date) {
  let date = null

  let dateArray = _date.split('-')
  let year = parseInt(dateArray[0])
  let month = parseInt(dateArray[1])
  let day = null

  // Define o próximo mês.
  let nextYear = null
  let nextMonth = null
  if (month == 12) {
    nextMonth = '01'
    nextYear = year + 1
  } else {
    nextYear = year
    nextMonth = month + 1
    if (nextMonth < 10) {
      nextMonth = '0' + nextMonth
    }
  }

  // Define o dia.
  let maxDay = null
  if (nextMonth % 2 == 0) {
    if (nextMonth == 2) {
      if ((nextYear % 4 == 0 && nextYear % 100 != 0) || (nextYear % 400 == 0)) {
        maxDay = 29
      } else {
        maxDay = 28
      }
    } else {
      maxDay = 31
    }
  } else {
    maxDay = 30
  }
  day = Math.floor(Math.random() * maxDay) + 1


  dateArray[0] = nextYear
  dateArray[1] = nextMonth
  dateArray[2] = day < 10 ? `0${ day }` : `${ day }`

  date = dateArray.join('-')

  return date
}

function getDateWithLastMonth(_date) {
  let date = null

  let dateArray = _date.split('-')
  let year = parseInt(dateArray[0])
  let month = parseInt(dateArray[1])
  let day = null

  let lastYear = null
  let lastMonth = null
  if (month == 1) {
    lastYear = year - 1
    lastMonth = '12'
  } else {
    lastYear = year
    lastMonth = month - 1
    if (lastMonth < 10) {
      lastMonth = '0' + lastMonth
    }
  }

  // Define o dia.
  let maxDay = null
  if (lastMonth % 2 == 0) {
    if (lastMonth == 2) {
      if ((lastYear % 4 == 0 && lastYear % 100 != 0) || (lastYear % 400 == 0)) {
        maxDay = 29
      } else {
        maxDay = 28
      }
    } else {
      maxDay = 31
    }
  } else {
    maxDay = 30
  }
  day = Math.floor(Math.random() * maxDay) + 1

  dateArray[0] = lastYear
  dateArray[1] = lastMonth
  dateArray[2] = day < 10 ? `0${ day }` : `${ day }`

  date = dateArray.join('-')

  return date
}

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
      await updateRole(accounts.funcionario2.id, '1')
      let tokenFuncionario2 = await login(funcionarioLogin2)
      accounts.funcionario2.token = `Bearer ${ tokenFuncionario2.token }`
    } catch (errorFuncionario2) {
      console.log(errorFuncionario2)
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

    try {
      const userCliente2 = {
        name: "Jeremias Cruz",
        email: "jere_cruz@gmail.com",
        password: "&asdf$sdf7qwer97QWER",
        phoneCode: "1",
        phoneNumber: "2129981212",
        birthDate: "1992-01-02",
        country: "BR",
        state: "AM",
        city: "Manaus",
        cpf: Generator.genCPF()
      }
      let registredCliente2 = await register(userCliente2)
      let clienteLogin2 = registredCliente2.login
      let tokenCliente2 = await login(clienteLogin2)
      accounts.cliente2.id = registredCliente2.id
      accounts.cliente2.token = `Bearer ${ tokenCliente2.token }`
    } catch (errorCliente2) {
      console.log(errorCliente2)
    }

  } catch (error) {
    console.log(error)
  }

})

describe("Suite de teste para as Reservas.", function() {

  describe("CREATE", function() {

    describe("Teste de SUCESSO", function() {

      test("/POST - Deve retornar 201, para sucesso no cadastrado de uma reserva pelo Cliente.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        let reserve = {
          apartment_id: "27ibm1he7gl4ei9i7jcacbl6",
          start,
          end,
        }

        return request.post(endpoints.toUpdate).send(reserve).set('Authorization', accounts.cliente.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(201)

            expect(responseUpdate.body._links).toBeDefined()
            expect(responseUpdate.body._links).toHaveLength(3)
            expect(responseUpdate.body._links[0]).toMatchObject({
              href: `${ baseURL }${ endpoints.toRead }/${ reserve.apartment_id }`,
              method: 'GET',
              rel: 'self_reserve'
            })
            expect(responseUpdate.body._links[1]).toMatchObject({
              href: `${ baseURL }${ endpoints.toUpdate }`,
              method: 'PUT',
              rel: 'edit_reserve'
            })
            expect(responseUpdate.body._links[2]).toMatchObject({
              href: `${ baseURL }${ endpoints.toDelete }/${ reserve.apartment_id }`,
              method: 'DELETE',
              rel: 'delete_reserve'
            })

            return request.get(`${ endpoints.toRead }/${ reserve.apartment_id }`).set('Authorization', accounts.cliente.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                const {
                  reservedIn,
                  _links
                } = responseRead.body

                expect(responseRead.body).toMatchObject({
                  apartment_id: reserve.apartment_id,
                  status: 'reservado',
                  user_id: accounts.cliente.id,
                  start: reserve.start,
                  end: reserve.end,
                })

                expect(responseRead.body.reservedIn).toBeDefined()

                expect(responseRead.body._links).toBeDefined()
                expect(responseRead.body._links).toHaveLength(3)
                expect(responseRead.body._links[0]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toRead }/${ reserve.apartment_id }`,
                  method: 'GET',
                  rel: 'self_reserve'
                })
                expect(responseRead.body._links[1]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toUpdate }`,
                  method: 'PUT',
                  rel: 'edit_reserve'
                })
                expect(responseRead.body._links[2]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toDelete }/${ reserve.apartment_id }`,
                  method: 'DELETE',
                  rel: 'delete_reserve'
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

      test("/POST - Deve retornar 201, para sucesso no cadastrado de uma reserva pelo Cliente.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        let reserve = {
          apartment_id: "mmfel7oi6p43kjj6jebln8dn97",
          start,
          end,
        }

        return request.post(endpoints.toUpdate).send(reserve).set('Authorization', accounts.cliente2.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(201)

            expect(responseUpdate.body._links).toBeDefined()
            expect(responseUpdate.body._links).toHaveLength(3)
            expect(responseUpdate.body._links[0]).toMatchObject({
              href: `${ baseURL }${ endpoints.toRead }/${ reserve.apartment_id }`,
              method: 'GET',
              rel: 'self_reserve'
            })
            expect(responseUpdate.body._links[1]).toMatchObject({
              href: `${ baseURL }${ endpoints.toUpdate }`,
              method: 'PUT',
              rel: 'edit_reserve'
            })
            expect(responseUpdate.body._links[2]).toMatchObject({
              href: `${ baseURL }${ endpoints.toDelete }/${ reserve.apartment_id }`,
              method: 'DELETE',
              rel: 'delete_reserve'
            })

            return request.get(`${ endpoints.toRead }/${ reserve.apartment_id }`).set('Authorization', accounts.cliente2.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                const {
                  reservedIn,
                  _links
                } = responseRead.body

                expect(responseRead.body).toMatchObject({
                  apartment_id: reserve.apartment_id,
                  status: 'reservado',
                  user_id: accounts.cliente2.id,
                  start: reserve.start,
                  end: reserve.end,
                })

                expect(responseRead.body.reservedIn).toBeDefined()

                expect(responseRead.body._links).toBeDefined()
                expect(responseRead.body._links).toHaveLength(3)
                expect(responseRead.body._links[0]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toRead }/${ reserve.apartment_id }`,
                  method: 'GET',
                  rel: 'self_reserve'
                })
                expect(responseRead.body._links[1]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toUpdate }`,
                  method: 'PUT',
                  rel: 'edit_reserve'
                })
                expect(responseRead.body._links[2]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toDelete }/${ reserve.apartment_id }`,
                  method: 'DELETE',
                  rel: 'delete_reserve'
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

      test("/POST - Deve retornar 201, para sucesso no cadastrado de uma reserva pelo Funcionário.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        let reserve = {
          apartment_id: "48421917gjm6g8dhjj52lb7j",
          status: "reservado",
          user_id: accounts.cliente.id,
          start,
          end,
        }

        return request.post(endpoints.toUpdate).send(reserve).set('Authorization', accounts.funcionario.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(201)

            expect(responseUpdate.body._links).toBeDefined()
            expect(responseUpdate.body._links).toHaveLength(4)
            expect(responseUpdate.body._links[0]).toMatchObject({
              href: `${ baseURL }${ endpoints.toRead }/${ reserve.apartment_id }`,
              method: 'GET',
              rel: 'self_reserve'
            })
            expect(responseUpdate.body._links[1]).toMatchObject({
              href: `${ baseURL }${ endpoints.toUpdate }`,
              method: 'PUT',
              rel: 'edit_reserve'
            })
            expect(responseUpdate.body._links[2]).toMatchObject({
              href: `${ baseURL }${ endpoints.toDelete }/${ reserve.apartment_id }`,
              method: 'DELETE',
              rel: 'delete_reserve'
            })
            expect(responseUpdate.body._links[3]).toMatchObject({
              href: `${ baseURL }${ endpoints.toList }`,
              method: 'GET',
              rel: 'reserve_list'
            })

            return request.get(`${ endpoints.toRead }/${ reserve.apartment_id }`).set('Authorization', accounts.cliente.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                const {
                  reservedIn,
                  _links
                } = responseRead.body

                expect(responseRead.body).toMatchObject({
                  apartment_id: reserve.apartment_id,
                  status: 'reservado',
                  user_id: accounts.cliente.id,
                  start: reserve.start,
                  end: reserve.end,
                })

                expect(responseRead.body.reservedIn).toBeDefined()

                expect(responseRead.body._links).toBeDefined()
                expect(responseRead.body._links).toHaveLength(3)
                expect(responseRead.body._links[0]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toRead }/${ reserve.apartment_id }`,
                  method: 'GET',
                  rel: 'self_reserve'
                })
                expect(responseRead.body._links[1]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toUpdate }`,
                  method: 'PUT',
                  rel: 'edit_reserve'
                })
                expect(responseRead.body._links[2]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toDelete }/${ reserve.apartment_id }`,
                  method: 'DELETE',
                  rel: 'delete_reserve'
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

      test("/POST - Deve retornar 201, para sucesso no cadastrado de uma reserva pelo Gerente.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        let reserve = {
          apartment_id: "cljn205e58dcmh6fb0ffabgg",
          status: "reservado",
          user_id: accounts.cliente.id,
          start,
          end,
        }

        return request.post(endpoints.toUpdate).send(reserve).set('Authorization', accounts.gerente.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(201)

            expect(responseUpdate.body._links).toBeDefined()
            expect(responseUpdate.body._links).toHaveLength(4)
            expect(responseUpdate.body._links[0]).toMatchObject({
              href: `${ baseURL }${ endpoints.toRead }/${ reserve.apartment_id }`,
              method: 'GET',
              rel: 'self_reserve'
            })
            expect(responseUpdate.body._links[1]).toMatchObject({
              href: `${ baseURL }${ endpoints.toUpdate }`,
              method: 'PUT',
              rel: 'edit_reserve'
            })
            expect(responseUpdate.body._links[2]).toMatchObject({
              href: `${ baseURL }${ endpoints.toDelete }/${ reserve.apartment_id }`,
              method: 'DELETE',
              rel: 'delete_reserve'
            })
            expect(responseUpdate.body._links[3]).toMatchObject({
              href: `${ baseURL }${ endpoints.toList }`,
              method: 'GET',
              rel: 'reserve_list'
            })

            return request.get(`${ endpoints.toRead }/${ reserve.apartment_id }`).set('Authorization', accounts.cliente.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                const {
                  reservedIn,
                  _links
                } = responseRead.body

                expect(responseRead.body).toMatchObject({
                  apartment_id: reserve.apartment_id,
                  status: 'reservado',
                  user_id: accounts.cliente.id,
                  start: reserve.start,
                  end: reserve.end,
                })

                expect(responseRead.body.reservedIn).toBeDefined()

                expect(responseRead.body._links).toBeDefined()
                expect(responseRead.body._links).toHaveLength(3)
                expect(responseRead.body._links[0]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toRead }/${ reserve.apartment_id }`,
                  method: 'GET',
                  rel: 'self_reserve'
                })
                expect(responseRead.body._links[1]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toUpdate }`,
                  method: 'PUT',
                  rel: 'edit_reserve'
                })
                expect(responseRead.body._links[2]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toDelete }/${ reserve.apartment_id }`,
                  method: 'DELETE',
                  rel: 'delete_reserve'
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

      test("/POST - Deve retornar 201, para sucesso no cadastrado de uma reserva pelo Admin.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        let reserve = {
          apartment_id: "n0kj2b1e0g9h22in405c9c6g",
          status: "reservado",
          user_id: accounts.cliente.id,
          start,
          end,
        }

        return request.post(endpoints.toUpdate).send(reserve).set('Authorization', accounts.admin.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(201)

            expect(responseUpdate.body._links).toBeDefined()
            expect(responseUpdate.body._links).toHaveLength(4)
            expect(responseUpdate.body._links[0]).toMatchObject({
              href: `${ baseURL }${ endpoints.toRead }/${ reserve.apartment_id }`,
              method: 'GET',
              rel: 'self_reserve'
            })
            expect(responseUpdate.body._links[1]).toMatchObject({
              href: `${ baseURL }${ endpoints.toUpdate }`,
              method: 'PUT',
              rel: 'edit_reserve'
            })
            expect(responseUpdate.body._links[2]).toMatchObject({
              href: `${ baseURL }${ endpoints.toDelete }/${ reserve.apartment_id }`,
              method: 'DELETE',
              rel: 'delete_reserve'
            })
            expect(responseUpdate.body._links[3]).toMatchObject({
              href: `${ baseURL }${ endpoints.toList }`,
              method: 'GET',
              rel: 'reserve_list'
            })

            return request.get(`${ endpoints.toRead }/${ reserve.apartment_id }`).set('Authorization', accounts.cliente.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                const {
                  reservedIn,
                  _links
                } = responseRead.body

                expect(responseRead.body).toMatchObject({
                  apartment_id: reserve.apartment_id,
                  status: 'reservado',
                  user_id: accounts.cliente.id,
                  start: reserve.start,
                  end: reserve.end,
                })

                expect(responseRead.body.reservedIn).toBeDefined()

                expect(responseRead.body._links).toBeDefined()
                expect(responseRead.body._links).toHaveLength(3)
                expect(responseRead.body._links[0]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toRead }/${ reserve.apartment_id }`,
                  method: 'GET',
                  rel: 'self_reserve'
                })
                expect(responseRead.body._links[1]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toUpdate }`,
                  method: 'PUT',
                  rel: 'edit_reserve'
                })
                expect(responseRead.body._links[2]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toDelete }/${ reserve.apartment_id }`,
                  method: 'DELETE',
                  rel: 'delete_reserve'
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

    })

    describe("Testes de FALHA.", function() {

      test("/POST - Deve retornar 401, o usuário não está AUTORIZADO.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        let reserve = {
          status: "reservado",
          user_id: "507f1f77bcf86cd799439011",
          start,
          end,
        }

        return request.post(endpoints.toCreate).set(reserve)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(401)

            expect(responseCreate.body.RestException.Code).toBe('5')
            expect(responseCreate.body.RestException.Message).toBe('O usuário não está autorizado')
            expect(responseCreate.body.RestException.Status).toBe('401')
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/5`)

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      /* ############ CLIENTE ############ */

      test("/POST - Deve retornar 403, o Cliente não pode mudar o Status DIRETAMENTE.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        let reserve = {
          apartment_id: "02n07j2d1hf5a2f26djjj92a",
          status: "reservado",
          user_id: "507f1f77bcf86cd799439011",
          start,
          end,
        }

        return request.post(endpoints.toCreate).send(reserve).set('Authorization', accounts.cliente.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(403)

            expect(responseCreate.body.RestException.Code).toBe('6')
            expect(responseCreate.body.RestException.Message).toBe('O usuário não está autenticado')
            expect(responseCreate.body.RestException.Status).toBe('403')
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/6`)

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      test("/POST - Deve retornar 403, o Cliente não pode informar o campo de ID de outro Cliente.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        let reserve = {
          apartment_id: "02n07j2d1hf5a2f26djjj92a",
          user_id: "507f1f77bcf86cd799439011",
          start,
          end,
        }

        return request.post(endpoints.toCreate).send(reserve).set('Authorization', accounts.cliente.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(403)

            expect(responseCreate.body.RestException.Code).toBe('6')
            expect(responseCreate.body.RestException.Message).toBe('O usuário não está autenticado')
            expect(responseCreate.body.RestException.Status).toBe('403')
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/6`)

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      // Testes no ID do apartamento.
      test("/POST - Deve retornar 400, por não conter o ID do apartamento a ser reservado.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        let reserve = {
          apartment_id: "",
          start,
          end,
        }

        return request.post(endpoints.toCreate).send(reserve).set('Authorization', accounts.cliente.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("1")
            expect(responseCreate.body.RestException.Message).toBe("O ID do apartamento é obrigatório")
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptApartment')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe('O ID do apartamento é obrigatório')

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      test("/POST - Deve retornar 400, por conter caracteres inválidos no ID do apartamento.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        let reserve = {
          apartment_id: "sdf*q98-we7",
          start,
          end,
        }

        return request.post(endpoints.toCreate).send(reserve).set('Authorization', accounts.cliente.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("2")
            expect(responseCreate.body.RestException.Message).toBe("O ID do apartamento contém caracteres inválidos")
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptApartment')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe('O ID do apartamento contém caracteres inválidos')

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      test("/POST - Deve retornar 400, por conter caracteres inválidos no ID do apartamento.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        let reserve = {
          apartment_id: "sdf*q98-we7",
          start,
          end,
        }

        return request.post(endpoints.toCreate).send(reserve).set('Authorization', accounts.cliente.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("2")
            expect(responseCreate.body.RestException.Message).toBe("O ID do apartamento contém caracteres inválidos")
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptApartment')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe('O ID do apartamento contém caracteres inválidos')

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      test("/POST - Deve retornar 404, pelo ID do apartamento não pertencer a um apartamento.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        let reserve = {
          apartment_id: "856377c88f8fd9fc65fd6666",
          start,
          end
        }

        return request.post(endpoints.toCreate).send(reserve).set('Authorization', accounts.cliente.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(404)
            
            expect(responseCreate.body.RestException.Code).toBe("3")
            expect(responseCreate.body.RestException.Message).toBe("Nenhum apartamento com o ID informado está cadastrado")
            expect(responseCreate.body.RestException.Status).toBe("404")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/3`)

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      // Testes de Data de Início da reserva.
      test("/POST - Deve retornar 400, a Data de Início da reserva não foi informada.", function() {

        let date = dateNow.getDate()
        let end = getDateWithNextMonth(date)

        let reserve = {
          apartment_id: "02n07j2d1hf5a2f26djjj92a",
          end
        }

        return request.post(endpoints.toCreate).send(reserve).set('Authorization', accounts.cliente.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("1")
            expect(responseCreate.body.RestException.Message).toBe("O campo de Data de Início da reserva é obrigatório")
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptStartDate')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de Data de Início da reserva é obrigatório")

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      test("/POST - Deve retornar 400, a Data de Início contém caracteres inválidos.", function() {

        // Coloca caractere * no dia da data.
        let date = dateNow.getDate()

        let dateWithChar = date.slice(0, -1) + '*'
        let end = getDateWithNextMonth(date)

        let reserve = {
          apartment_id: "02n07j2d1hf5a2f26djjj92a",
          start: dateWithChar,
          end
        }

        return request.post(endpoints.toCreate).send(reserve).set('Authorization', accounts.cliente.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("2")
            expect(responseCreate.body.RestException.Message).toBe("A Data de Início escolhida é inválida")
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptStartDate')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe("A Data de Início escolhida é inválida")

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      test("/POST - Deve retornar 400, a Data de Início é inválida (não existe 31 de fev.).", function() {

        let date = dateNow.getDate()
        let year = parseInt(date.split('-')[0])
        let end = getDateWithNextMonth(date)

        let reserve = {
          apartment_id: "02n07j2d1hf5a2f26djjj92a",
          start: `${ year }-02-31`,
          end
        }

        return request.post(endpoints.toCreate).send(reserve).set('Authorization', accounts.cliente.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("2")
            expect(responseCreate.body.RestException.Message).toBe("A Data de Início escolhida é inválida")
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptStartDate')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe("A Data de Início escolhida é inválida")

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      test("/POST - Deve retornar 400, a Data de Início é anterior a Data Atual.", function() {

        let date = dateNow.getDate()
        let start = getDateWithLastMonth(date)
        let end = getDateWithNextMonth(date)

        let reserve = {
          apartment_id: "02n07j2d1hf5a2f26djjj92a",
          start,
          end
        }

        return request.post(endpoints.toCreate).send(reserve).set('Authorization', accounts.cliente.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("2")
            expect(responseCreate.body.RestException.Message).toBe("A Data de Início escolhida é inválida")
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptStartDate')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe("A Data de Início escolhida é inválida")

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      // Testes de Data de Fim da reserva.
      test("/POST - Deve retornar 400, a Data de Fim da reserva não foi informada.", function() {

        let reserve = {
          apartment_id: "02n07j2d1hf5a2f26djjj92a",
          start: dateNow.getDate()
        }

        return request.post(endpoints.toCreate).send(reserve).set('Authorization', accounts.cliente.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("1")
            expect(responseCreate.body.RestException.Message).toBe("O campo de Data de Fim da reserva é obrigatório")
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptEndDate')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de Data de Fim da reserva é obrigatório")

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      test("/POST - Deve retornar 400, a Data de Fim contém caracteres inválidos.", function() {

        // Coloca caractere * no dia da data.
        let date = dateNow.getDate()
        let dateWithChar = date.slice(0, -1) + '*'

        let reserve = {
          apartment_id: "02n07j2d1hf5a2f26djjj92a",
          start: dateNow.getDate(),
          end: dateWithChar
        }

        return request.post(endpoints.toCreate).send(reserve).set('Authorization', accounts.cliente.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("2")
            expect(responseCreate.body.RestException.Message).toBe("A Data de Fim escolhida é inválida")
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptEndDate')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe("A Data de Fim escolhida é inválida")

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      test("/POST - Deve retornar 400, a Data de Fim é inválida (não existe 31 de fev.).", function() {

        let date = dateNow.getDate()
        let year = parseInt(date.split('-')[0])

        let reserve = {
          apartment_id: "02n07j2d1hf5a2f26djjj92a",
          start: date,
          end: `${ year + 1 }-02-31`
        }

        return request.post(endpoints.toCreate).send(reserve).set('Authorization', accounts.cliente.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("2")
            expect(responseCreate.body.RestException.Message).toBe("A Data de Fim escolhida é inválida")
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptEndDate')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe("A Data de Fim escolhida é inválida")

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      test("/POST - Deve retornar 400, a Data de Fim é anterior a Data de Início.", function() {

        let date = dateNow.getDate()
        let end = getDateWithLastMonth(date)

        let reserve = {
          apartment_id: "02n07j2d1hf5a2f26djjj92a",
          start: date,
          end
        }

        return request.post(endpoints.toCreate).send(reserve).set('Authorization', accounts.cliente.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("2")
            expect(responseCreate.body.RestException.Message).toBe("A Data de Fim escolhida é inválida")
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptEndDate')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe("A Data de Fim escolhida é inválida")

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      /* ############ FUNCIONÁRIO ############ */

      // Testes no Status
      test("/POST - Deve retornar 400, uma vez que NÃO foi informado o Status.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        let reserve = {
          apartment_id: "856377c88f8fd9fc65fd3ef5",
          status: "",
          user_id: "507f1f77bcf86cd799439011",
          start,
          end
        }

        return request.post(endpoints.toCreate).send(reserve).set('Authorization', accounts.funcionario.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("1")
            expect(responseCreate.body.RestException.Message).toBe("O campo de Status é obrigatório")
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptStatus')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe('O campo de Status é obrigatório')

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })


      test("/POST - Deve retornar 400, já que o valor de Status é inválido.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        let reserve = {
          apartment_id: "856377c88f8fd9fc65fd3ef5",
          status: "1",
          user_id: "507f1f77bcf86cd799439011",
          start,
          end
        }

        return request.post(endpoints.toCreate).send(reserve).set('Authorization', accounts.funcionario.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("2")
            expect(responseCreate.body.RestException.Message).toBe("O valor do campo de Status é inválido")
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptStatus')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe('O valor do campo de Status é inválido')

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      test("/POST - Deve retornar 400, já que o apartamento já está reservado, ocupado ou indisponível.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        let reserve = {
          apartment_id: "856377c88f8fd9fc65fd3ef5",
          status: "reservado",
          user_id: "507f1f77bcf86cd799439011",
          start,
          end
        }

        return request.post(endpoints.toCreate).send(reserve).set('Authorization', accounts.funcionario.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("4")
            expect(responseCreate.body.RestException.Message).toBe("O apartamento escolhido já está Reservado, Ocupado ou Indisponível")
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/4`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptStatus')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe("O apartamento escolhido já está Reservado, Ocupado ou Indisponível")

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      // Testes no ID do cliente.
      test("/POST - Deve retornar 400, já que não foi informado o cliente que ocupará o apartamento.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        let reserve = {
          apartment_id: "02n07j2d1hf5a2f26djjj92a",
          status: "reservado",
          user_id: "",
          start,
          end
        }

        return request.post(endpoints.toCreate).send(reserve).set('Authorization', accounts.funcionario.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("1")
            expect(responseCreate.body.RestException.Message).toBe("O ID do cliente/usuário é obrigatório")
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptClient')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe("O ID do cliente/usuário é obrigatório")

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      test("/POST - Deve retornar 400, já que ID do cliente contém caractere inválido.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        let reserve = {
          apartment_id: "02n07j2d1hf5a2f26djjj92a",
          user_id: "507f1f77bcf86cd79943901*",
          status: "reservado",
          start,
          end
        }

        return request.post(endpoints.toCreate).send(reserve).set('Authorization', accounts.funcionario.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("2")
            expect(responseCreate.body.RestException.Message).toBe("O ID do cliente/usuário contém caracteres inválidos")
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptClient')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe("O ID do cliente/usuário contém caracteres inválidos")

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      test("/POST - Deve retornar 404, já que ID do cliente não foi encontrado.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        let reserve = {
          apartment_id: "02n07j2d1hf5a2f26djjj92a",
          user_id: "6kde3ibi8a1d4187c1ji73bj",
          status: "reservado",
          start,
          end
        }

        return request.post(endpoints.toCreate).send(reserve).set('Authorization', accounts.funcionario.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(404)

            expect(responseCreate.body.RestException.Code).toBe("3")
            expect(responseCreate.body.RestException.Message).toBe("Nenhum usuário com o ID informado está cadastrado")
            expect(responseCreate.body.RestException.Status).toBe("404")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/3`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptClient')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe("Nenhum usuário com o ID informado está cadastrado")

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      test("/POST - Deve retornar 403, já que o Funcionário não pode fazer a reserva para outro Funcionário.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        const reserve = {
          apartment_id: '02n07j2d1hf5a2f26djjj92a',
          status: 'ocupado',
          user_id: accounts.funcionario2.id,
          start,
          end
        }

        return request.post(endpoints.toCreate).send(reserve).set('Authorization', accounts.funcionario.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(403)

            expect(responseCreate.body.RestException.Code).toBe('6')
            expect(responseCreate.body.RestException.Message).toBe('O usuário não está autenticado')
            expect(responseCreate.body.RestException.Status).toBe('403')
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/6`)

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      test("/POST - Deve retornar 403, já que o Funcionário não pode fazer a reserva para um Gerente.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        const reserve = {
          apartment_id: '02n07j2d1hf5a2f26djjj92a',
          status: 'ocupado',
          user_id: accounts.gerente.id,
          start,
          end
        }

        return request.post(endpoints.toCreate).send(reserve).set('Authorization', accounts.funcionario.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(403)

            expect(responseCreate.body.RestException.Code).toBe('6')
            expect(responseCreate.body.RestException.Message).toBe('O usuário não está autenticado')
            expect(responseCreate.body.RestException.Status).toBe('403')
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/6`)

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

    })

  })

  describe("READ", function() {

    describe("Testes de SUCESSO.", function() {

      /* ################## CLIENTES ################## */

      test("/GET - Deve retornar 200, na listagem de reservas.", function() {

        return request.get(endpoints.toList).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(200)

            const { reserves, hasNext } = responseList.body

            for (let reserve of reserves) {
              expect(reserve).toBeDefined()
              expect(reserve.user_id).toBe(accounts.cliente.id)
              expect(reserve.reservedIn).toBeDefined()
            }
            expect(hasNext).toEqual(false)

          })
          .catch(function(errorList) {
            fail(errorList)
          })

      })

      test("/GET - Deve retornar 200, na listagem de reservas LIVRES para o Cliente.", function() {

        let params = {
          status: 'livre'
        }

        let queryString = `status=${ params.status }`

        return request.get(`${ endpoints.toList }?${ queryString }`).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(200)

            const { reserves, hasNext } = responseList.body

            expect(reserves).toHaveLength(0)
            expect(hasNext).toEqual(false)

          })
          .catch(function(errorList) {
            fail(errorList)
          })

      })

      test("/GET - Deve retornar 200, na listagem de apartamento/reservas RESERVADOS para o Cliente.", function() {

        let params = {
          status: 'reservado'
        }

        let queryString = `status=${ params.status }`

        return request.get(`${ endpoints.toList }?${ queryString }`).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(200)

            const { reserves, hasNext } = responseList.body

            for (let reserve of reserves) {
              expect(reserve).toBeDefined()
              expect(reserve.user_id).toBe(accounts.cliente.id)
              expect(reserve.reservedIn).toBeDefined()
              expect(reserve._links).toHaveLength(3)
            }

            expect(hasNext).toEqual(false)

          })
          .catch(function(errorList) {
            fail(errorList)
          })

      })

      test("/GET - Deve retornar 200, na listagem de apartamento/reservas OCUPADO para o Cliente.", function() {

        let params = {
          status: 'ocupado'
        }

        let queryString = `status=${ params.status }`

        return request.get(`${ endpoints.toList }?${ queryString }`).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(200)

            const { reserves, hasNext } = responseList.body

            expect(reserves).toHaveLength(0)
            expect(hasNext).toEqual(false)

          })
          .catch(function(errorList) {
            fail(errorList)
          })

      })

      /* ################## FUNCIONÁRIO ################## */

      // Busca por uma única reserva, baseada no ID do apartamento.
      test("/GET - Deve retornar 200, na busca de uma reserva baseada no ID do apartamento.", function() {

        const apartment = { id: '856377c88f8fd9fc65fd3ef5' }

        return request.get(`${ endpoints.toRead }/${ apartment.id }`).set('Authorization', accounts.funcionario.token)
          .then(function(responseRead) {

            expect(responseRead.statusCode).toEqual(200)

            const {
              reservedIn,
              _links
            } = responseRead.body

            expect(responseRead.body).toMatchObject({
              apartment_id: apartment.id,
              status: "reservado",
              user_id: "507f1f77bcf86cd799439011",
              start: "2023-11-12",
              end: "2024-01-12"
            })
            
            expect(reservedIn).toBeDefined()
            expect(_links).toBeDefined()
            expect(_links).toHaveLength(4)
            expect(_links[0]).toMatchObject({
              href: `${ baseURL }${ endpoints.toRead }/${ apartment.id }`,
              method: 'GET',
              rel: 'self_reserve'
            })
            expect(_links[1]).toMatchObject({
              href: `${ baseURL }${ endpoints.toUpdate }`,
              method: 'PUT',
              rel: 'edit_reserve'
            })
            expect(_links[2]).toMatchObject({
              href: `${ baseURL }${ endpoints.toDelete }/${ apartment.id }`,
              method: 'DELETE',
              rel: 'delete_reserve'
            })
            expect(_links[3]).toMatchObject({
              href: `${ baseURL }${ endpoints.toList }`,
              method: 'GET',
              rel: 'reserve_list'
            })

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      // Busca várias reservas.
      test("/GET - Deve retornar 200, na listagem de reservas.", function() {

        return request.get(endpoints.toList).set('Authorization', accounts.funcionario.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(200)

            const { reserves, hasNext } = responseList.body

            for (let reserve of reserves) {
              expect(reserve).toBeDefined()
              expect(reserve.reservedIn).toBeDefined()              
              expect(reserve._links).toHaveLength(4)
            }
            expect(hasNext).toEqual(false)

          })
          .catch(function(errorList) {
            fail(errorList)
          })

      })

      // Busca reservas que possuem um determinado Status.
      test("/GET - Deve retornar 200, na listagem de reservas LIVRES para o Funcionário.", function() {

        let params = {
          status: 'livre'
        }

        let queryString = `status=${ params.status }`

        return request.get(`${ endpoints.toList }?${ queryString }`).set('Authorization', accounts.funcionario.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(200)

            const { reserves, hasNext } = responseList.body

            for (let reserve of reserves) {
              expect(reserve).toBeDefined()
              expect(reserve.reservedIn).toBeDefined()
              expect(reserve.status).toBe('livre')
            }

            expect(hasNext).toEqual(false)

          })
          .catch(function(errorList) {
            fail(errorList)
          })

      })

      test("/GET - Deve retornar 200, na listagem de apartamento/reservas RESERVADOS para o Funcionário.", function() {

        let params = {
          status: 'reservado'
        }

        let queryString = `status=${ params.status }`

        return request.get(`${ endpoints.toList }?${ queryString }`).set('Authorization', accounts.funcionario.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(200)

            const { reserves, hasNext } = responseList.body

            for (let reserve of reserves) {
              expect(reserve).toBeDefined()
              expect(reserve.reservedIn).toBeDefined()
              expect(reserve._links).toHaveLength(4)
            }

            expect(hasNext).toEqual(false)

          })
          .catch(function(errorList) {
            fail(errorList)
          })

      })

      test("/GET - Deve retornar 200, na listagem de apartamento/reservas OCUPADO para o Funcionário.", function() {

        let params = {
          status: 'ocupado'
        }

        let queryString = `status=${ params.status }`

        return request.get(`${ endpoints.toList }?${ queryString }`).set('Authorization', accounts.funcionario.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(200)

            const { reserves, hasNext } = responseList.body

            for (let reserve of reserves) {
              expect(reserve).toBeDefined()
              expect(reserve.reservedIn).toBeDefined()
              expect(reserve.status).toBe('ocupado')
            }

            expect(hasNext).toEqual(false)

          })
          .catch(function(errorList) {
            fail(errorList)
          })

      })

      test("/GET - Deve retornar 200, na listagem de apartamento/reservas INDISPONÍVEL.", function() {

        let params = {
          status: 'indisponível'
        }

        let queryString = `status=${ params.status }`

        return request.get(`${ endpoints.toList }?${ queryString }`).set('Authorization', accounts.funcionario.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(200)

            const { reserves, hasNext } = responseList.body

            for (let reserve of reserves) {
              expect(reserve).toBeDefined()
              expect(reserve.status).toBe('indisponível')
            }

            expect(hasNext).toEqual(false)

          })
          .catch(function(errorList) {
            fail(errorList)
          })

      })

      test("/GET - Deve retornar 200, com a listagem de apartamento/reservas LIVRE, com offset e limit para o Funcionário.", function() {

        let params = {
          status: 'livre',
          offset: 1,
          limit: 3,
        }

        let queryString = `status=${ params.status }&offset=${ params.offset }&limit=${ params.limit }`

        return request.get(`${ endpoints.toList }?${ queryString }`).set('Authorization', accounts.funcionario.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(200)

            const { reserves, hasNext } = responseList.body

            expect(reserves).toHaveLength(params.limit)

            for (let reserve of reserves) {
              expect(reserve).toBeDefined()
              expect(reserve.status).toBe('livre')
            }

            expect(hasNext).toEqual(true)

          })
          .catch(function(errorList) {
            fail(errorList)
          })

      })

      test("/GET - Deve retornar 200, com a listagem de apartamento/reservas RESERVADO, com offset e limit para o Funcionário.", function() {

        let params = {
          status: 'reservado',
          offset: 1,
          limit: 3,
        }

        let queryString = `status=${ params.status }&offset=${ params.offset }&limit=${ params.limit }`

        return request.get(`${ endpoints.toList }?${ queryString }`).set('Authorization', accounts.funcionario.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(200)

            const { reserves, hasNext } = responseList.body

            expect(reserves).toHaveLength(params.limit)

            for (let reserve of reserves) {
              expect(reserve).toBeDefined()
              expect(reserve.status).toBe('reservado')
            }

            expect(hasNext).toEqual(true)

          })
          .catch(function(errorList) {
            fail(errorList)
          })

      })

      test("/GET - Deve retornar 200, com a listagem de apartamento/reservas OCUPADO, com offset e limit para o Funcionário.", function() {

        let params = {
          status: 'ocupado',
          offset: 2,
          limit: 1,
        }

        let queryString = `status=${ params.status }&offset=${ params.offset }&limit=${ params.limit }`

        return request.get(`${ endpoints.toList }?${ queryString }`).set('Authorization', accounts.funcionario.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(200)

            const { reserves, hasNext } = responseList.body

            expect(reserves).toHaveLength(params.limit)

            for (let reserve of reserves) {
              expect(reserve).toBeDefined()
              expect(reserve.status).toBe('ocupado')
            }

            expect(hasNext).toEqual(true)

          })
          .catch(function(errorList) {
            fail(errorList)
          })

      })

      /* ################## GERENTE ################## */

      test("/GET - Deve retornar 200, com a listagem de apartamento/reservas LIVRE, com offset e limit para o Gerente.", function() {

        let params = {
          status: 'livre',
          offset: 1,
          limit: 3,
        }

        let queryString = `status=${ params.status }&offset=${ params.offset }&limit=${ params.limit }`

        return request.get(`${ endpoints.toList }?${ queryString }`).set('Authorization', accounts.gerente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(200)

            const { reserves, hasNext } = responseList.body

            expect(reserves).toHaveLength(params.limit)

            for (let reserve of reserves) {
              expect(reserve).toBeDefined()
              expect(reserve.status).toBe('livre')
            }

            expect(hasNext).toEqual(true)

          })
          .catch(function(errorList) {
            fail(errorList)
          })

      })

      test("/GET - Deve retornar 200, com a listagem de apartamento/reservas RESERVADO, com offset e limit para o Gerente.", function() {

        let params = {
          status: 'reservado',
          offset: 1,
          limit: 3,
        }

        let queryString = `status=${ params.status }&offset=${ params.offset }&limit=${ params.limit }`

        return request.get(`${ endpoints.toList }?${ queryString }`).set('Authorization', accounts.gerente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(200)

            const { reserves, hasNext } = responseList.body

            expect(reserves).toHaveLength(params.limit)

            for (let reserve of reserves) {
              expect(reserve).toBeDefined()
              expect(reserve.status).toBe('reservado')
            }

            expect(hasNext).toEqual(true)

          })
          .catch(function(errorList) {
            fail(errorList)
          })

      })

      test("/GET - Deve retornar 200, com a listagem de apartamento/reservas OCUPADO, com offset e limit para o Gerente.", function() {

        let params = {
          status: 'ocupado',
          offset: 2,
          limit: 1,
        }

        let queryString = `status=${ params.status }&offset=${ params.offset }&limit=${ params.limit }`

        return request.get(`${ endpoints.toList }?${ queryString }`).set('Authorization', accounts.gerente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(200)

            const { reserves, hasNext } = responseList.body

            expect(reserves).toHaveLength(params.limit)

            for (let reserve of reserves) {
              expect(reserve).toBeDefined()
              expect(reserve.status).toBe('ocupado')
            }

            expect(hasNext).toEqual(true)

          })
          .catch(function(errorList) {
            fail(errorList)
          })

      })

      test("/GET - Deve retornar 200, com a listagem de apartamento/reservas INDISPONÍVEL, com offset e limit para o Gerente.", function() {

        let params = {
          status: 'ocupado',
          offset: 1,
          limit: 2,
        }

        let queryString = `status=${ params.status }&offset=${ params.offset }&limit=${ params.limit }`

        return request.get(`${ endpoints.toList }?${ queryString }`).set('Authorization', accounts.gerente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(200)

            const { reserves, hasNext } = responseList.body

            expect(reserves).toHaveLength(params.limit)

            for (let reserve of reserves) {
              expect(reserve).toBeDefined()
              expect(reserve.status).toBe('ocupado')
            }

            expect(hasNext).toEqual(true)

          })
          .catch(function(errorList) {
            fail(errorList)
          })

      })

      /* ################## ADMIN ################## */

      test("/GET - Deve retornar 200, com a listagem de apartamento/reservas LIVRE, com offset e limit para o Admin.", function() {

        let params = {
          status: 'livre',
          offset: 1,
          limit: 3,
        }

        let queryString = `status=${ params.status }&offset=${ params.offset }&limit=${ params.limit }`

        return request.get(`${ endpoints.toList }?${ queryString }`).set('Authorization', accounts.admin.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(200)

            const { reserves, hasNext } = responseList.body

            expect(reserves).toHaveLength(params.limit)

            for (let reserve of reserves) {
              expect(reserve).toBeDefined()
              expect(reserve.status).toBe('livre')
            }

            expect(hasNext).toEqual(true)

          })
          .catch(function(errorList) {
            fail(errorList)
          })

      })

    })

    describe("Testes de FALHA.", function() {

      /* ################## LEITURA DE UMA ÚNICA RESERVA ################## */

      test("/GET - Deve retornar 401, o usuário não está AUTORIZADO.", function() {

        const apartment = {
          id: '856377c88f8fd9fc65fd3ef5'
        }

        return request.get(`${ endpoints.toRead }/${ apartment.id }`)
          .then(function(responseRead) {

            expect(responseRead.statusCode).toEqual(401)

            expect(responseRead.body.RestException.Code).toBe('5')
            expect(responseRead.body.RestException.Message).toBe('O usuário não está autorizado')
            expect(responseRead.body.RestException.Status).toBe('401')
            expect(responseRead.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/5`)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      test("/GET - Deve retornar 403, o Cliente não pode acessar essa área (não está AUTENTICADO).", function() {

        const apartment = {
          id: '856377c88f8fd9fc65fd3ef5'
        }

        return request.get(`${ endpoints.toRead }/${ apartment.id }`).set('Authorization', accounts.cliente.token)
          .then(function(responseRead) {

            expect(responseRead.statusCode).toEqual(403)

            expect(responseRead.body.RestException.Code).toBe('6')
            expect(responseRead.body.RestException.Message).toBe('O usuário não está autenticado')
            expect(responseRead.body.RestException.Status).toBe('403')
            expect(responseRead.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/6`)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      test("/GET - Deve retornar 400, pelo ID do apartamento conter caracteres inválidos.", function() {

        return request.get(`${ endpoints.toRead }/856377c88f8fd9fc65fd3e*5`).set('Authorization', accounts.funcionario.token)
          .then(function(responseRead) {

            expect(responseRead.statusCode).toEqual(400)
            
            expect(responseRead.body.RestException.Code).toBe("2")
            expect(responseRead.body.RestException.Message).toBe("O ID do apartamento contém caracteres inválidos")
            expect(responseRead.body.RestException.Status).toBe("400")
            expect(responseRead.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      test("/GET - Deve retornar 400, pelo ID do apartamento não pertencer a um apartamento.", function() {

        return request.get(`${ endpoints.toRead }/856377c88f8fd9fc65fd6666`).set('Authorization', accounts.funcionario.token)
          .then(function(responseRead) {

            expect(responseRead.statusCode).toEqual(404)
            
            expect(responseRead.body.RestException.Code).toBe("3")
            expect(responseRead.body.RestException.Message).toBe("Nenhum apartamento com o ID informado está cadastrado")
            expect(responseRead.body.RestException.Status).toBe("404")
            expect(responseRead.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/3`)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      /* ################## LISTAGEM ################## */

      test("/GET - Deve retornar 401, o usuário não está AUTORIZADO.", function() {

        return request.get(`${ endpoints.toList }`)
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

      // Listagem para clientes com Query String

      test("/GET - Deve retornar 400, informado o parâmetro de consulta inválido.", function() {

        let params = {
          status: 'livre'
        }

        let queryString = `staus=${ params.status }`

        return request.get(`${ endpoints.toList }?${ queryString }`).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe("2")
            expect(responseList.body.RestException.Message).toBe("O parâmetro \'staus\' é inválido")
            expect(responseList.body.RestException.Status).toBe("400")
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)

          })
          .catch(function(errorList) {
            fail(errorList)
          })

      })

      test("/GET - Deve retornar 400, o valor de Status da Query String de listagem é inválido.", function() {

        let params = {
          status: 'live'
        }

        let queryString = `status=${ params.status }`

        return request.get(`${ endpoints.toList }?${ queryString }`).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe("2")
            expect(responseList.body.RestException.Message).toBe("O valor do campo de Status é inválido")
            expect(responseList.body.RestException.Status).toBe("400")
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseList.body.RestException.ErrorParams[0].field).toBe('iptStatus')
            expect(responseList.body.RestException.ErrorParams[0].hasError.error).toBe('O valor do campo de Status é inválido')

          })
          .catch(function(errorList) {
            fail(errorList)
          })

      })

      test("/GET - Deve retornar 400, informado o parâmetro de consulta inválido, como segundo query string.", function() {

        let params = {
          status: 'livre',
          offset: 0
        }

        let queryString = `status=livre&offse=${ params.offset }`

        return request.get(`${ endpoints.toList }?${ queryString }`).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe("2")
            expect(responseList.body.RestException.Message).toBe("O parâmetro \'offse\' é inválido")
            expect(responseList.body.RestException.Status).toBe("400")
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)

          })
          .catch(function(errorList) {
            fail(errorList)
          })

      })

      test("/GET - Deve retornar 400, o valor de Offset da Query String de listagem é inválido.", function() {

        let params = {
          status: 'livre',
          offset: '1a',
          limit: 3
        }

        let queryString = `status=${ params.status }&offset=${ params.offset }&limit=${ params.limit }`

        return request.get(`${ endpoints.toList }?${ queryString }`).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe("2")
            expect(responseList.body.RestException.Message).toBe("O valor do parâmetro Offset é inválido")
            expect(responseList.body.RestException.Status).toBe("400")
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseList.body.RestException.ErrorParams[0].field).toBe('offset')
            expect(responseList.body.RestException.ErrorParams[0].hasError.error).toBe('O valor do parâmetro Offset é inválido')

          })
          .catch(function(errorList) {
            fail(errorList)
          })

      })

      test("/GET - Deve retornar 400, informado o parâmetro de consulta inválido, como a terceira query string.", function() {

        let params = {
          status: 'livre',
          offset: 2,
          limit: 2
        }

        let queryString = `status=livre&offset=${ params.offset }&limi=${ params.limit }`

        return request.get(`${ endpoints.toList }?${ queryString }`).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe("2")
            expect(responseList.body.RestException.Message).toBe("O parâmetro \'limi\' é inválido")
            expect(responseList.body.RestException.Status).toBe("400")
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)

          })
          .catch(function(errorList) {
            fail(errorList)
          })

      })

      test("/GET - Deve retornar 400, o valor de Limit da Query String de listagem é inválido.", function() {

        let params = {
          status: 'livre',
          offset: 2,
          limit: 0
        }

        let queryString = `status=${ params.status }&offset=${ params.offset }&limit=${ params.limit }`

        return request.get(`${ endpoints.toList }?${ queryString }`).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe("2")
            expect(responseList.body.RestException.Message).toBe("O valor do parâmetro Limit é inválido")
            expect(responseList.body.RestException.Status).toBe("400")
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseList.body.RestException.ErrorParams[0].field).toBe('limit')
            expect(responseList.body.RestException.ErrorParams[0].hasError.error).toBe("O valor do parâmetro Limit é inválido")

          })
          .catch(function(errorList) {
            fail(errorList)
          })

      })

      // Listagem para funcionários com Query String

      test("/GET - Deve retornar 400, informado o parâmetro de consulta inválido pelo funcionario.", function() {

        let params = {
          status: 'livre'
        }

        let queryString = `staus=${ params.status }`

        return request.get(`${ endpoints.toList }?${ queryString }`).set('Authorization', accounts.funcionario.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe("2")
            expect(responseList.body.RestException.Message).toBe("O parâmetro \'staus\' é inválido")
            expect(responseList.body.RestException.Status).toBe("400")
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)

          })
          .catch(function(errorList) {
            fail(errorList)
          })

      })

      test("/GET - Deve retornar 400, o valor de Status da Query String de listagem é inválido, pelo Funcionário.", function() {

        let params = {
          status: 'live'
        }

        let queryString = `status=${ params.status }`

        return request.get(`${ endpoints.toList }?${ queryString }`).set('Authorization', accounts.funcionario.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe("2")
            expect(responseList.body.RestException.Message).toBe("O valor do campo de Status é inválido")
            expect(responseList.body.RestException.Status).toBe("400")
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseList.body.RestException.ErrorParams[0].field).toBe('iptStatus')
            expect(responseList.body.RestException.ErrorParams[0].hasError.error).toBe('O valor do campo de Status é inválido')

          })
          .catch(function(errorList) {
            fail(errorList)
          })

      })

      test("/GET - Deve retornar 400, informado o parâmetro de consulta inválido, como segundo query string pelo Funcionário.", function() {

        let params = {
          status: 'livre',
          offset: 0
        }

        let queryString = `status=livre&offse=${ params.offset }`

        return request.get(`${ endpoints.toList }?${ queryString }`).set('Authorization', accounts.funcionario.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe("2")
            expect(responseList.body.RestException.Message).toBe("O parâmetro \'offse\' é inválido")
            expect(responseList.body.RestException.Status).toBe("400")
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)

          })
          .catch(function(errorList) {
            fail(errorList)
          })

      })

      test("/GET - Deve retornar 400, o valor de Offset da Query String de listagem é inválido pelo Funcionário.", function() {

        let params = {
          status: 'livre',
          offset: '1a',
          limit: 3
        }

        let queryString = `status=${ params.status }&offset=${ params.offset }&limit=${ params.limit }`

        return request.get(`${ endpoints.toList }?${ queryString }`).set('Authorization', accounts.funcionario.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe("2")
            expect(responseList.body.RestException.Message).toBe("O valor do parâmetro Offset é inválido")
            expect(responseList.body.RestException.Status).toBe("400")
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseList.body.RestException.ErrorParams[0].field).toBe('offset')
            expect(responseList.body.RestException.ErrorParams[0].hasError.error).toBe('O valor do parâmetro Offset é inválido')

          })
          .catch(function(errorList) {
            fail(errorList)
          })

      })

      test("/GET - Deve retornar 400, informado o parâmetro de consulta inválido, como a terceira query string pelo Funcionário.", function() {

        let params = {
          status: 'livre',
          offset: 2,
          limit: 2
        }

        let queryString = `status=livre&offset=${ params.offset }&limi=${ params.limit }`

        return request.get(`${ endpoints.toList }?${ queryString }`).set('Authorization', accounts.funcionario.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe("2")
            expect(responseList.body.RestException.Message).toBe("O parâmetro \'limi\' é inválido")
            expect(responseList.body.RestException.Status).toBe("400")
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)

          })
          .catch(function(errorList) {
            fail(errorList)
          })

      })

      test("/GET - Deve retornar 400, o valor de Limit da Query String de listagem é inválido pelo Funcionário.", function() {

        let params = {
          status: 'livre',
          offset: 2,
          limit: 0
        }

        let queryString = `status=${ params.status }&offset=${ params.offset }&limit=${ params.limit }`

        return request.get(`${ endpoints.toList }?${ queryString }`).set('Authorization', accounts.funcionario.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe("2")
            expect(responseList.body.RestException.Message).toBe("O valor do parâmetro Limit é inválido")
            expect(responseList.body.RestException.Status).toBe("400")
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseList.body.RestException.ErrorParams[0].field).toBe('limit')
            expect(responseList.body.RestException.ErrorParams[0].hasError.error).toBe("O valor do parâmetro Limit é inválido")

          })
          .catch(function(errorList) {
            fail(errorList)
          })

      })

    })

  })

  describe("UPDATE", function() {

    describe("Testes de SUCESSO.", function() {

      test("/PUT - Deve retornar 200, para sucesso na atualização de uma reserva pelo Cliente.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        let reserve = {
          apartment_id: "27ibm1he7gl4ei9i7jcacbl6",
          start,
          end,
        }

        return request.put(endpoints.toUpdate).send(reserve).set('Authorization', accounts.cliente.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(200)

            expect(responseUpdate.body._links).toBeDefined()
            expect(responseUpdate.body._links).toHaveLength(3)
            expect(responseUpdate.body._links[0]).toMatchObject({
              href: `${ baseURL }${ endpoints.toRead }/${ reserve.apartment_id }`,
              method: 'GET',
              rel: 'self_reserve'
            })
            expect(responseUpdate.body._links[1]).toMatchObject({
              href: `${ baseURL }${ endpoints.toUpdate }`,
              method: 'PUT',
              rel: 'edit_reserve'
            })
            expect(responseUpdate.body._links[2]).toMatchObject({
              href: `${ baseURL }${ endpoints.toDelete }/${ reserve.apartment_id }`,
              method: 'DELETE',
              rel: 'delete_reserve'
            })

            return request.get(`${ endpoints.toRead }/${ reserve.apartment_id }`).set('Authorization', accounts.cliente.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                expect(responseRead.body).toMatchObject({
                  apartment_id: reserve.apartment_id,
                  start: reserve.start,
                  end: reserve.end,
                })

                expect(responseRead.body.date).toBeDefined()

                expect(responseRead.body._links).toBeDefined()
                expect(responseRead.body._links).toHaveLength(3)
                expect(responseRead.body._links[0]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toRead }/${ reserve.apartment_id }`,
                  method: 'GET',
                  rel: 'self_reserve'
                })
                expect(responseRead.body._links[1]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toUpdate }`,
                  method: 'PUT',
                  rel: 'edit_reserve'
                })
                expect(responseRead.body._links[2]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toDelete }/${ reserve.apartment_id }`,
                  method: 'DELETE',
                  rel: 'delete_reserve'
                })

              })
              .catch(function(responseRead) {
                fail(responseRead)
              })

          })
          .catch(function(responseUpdate) {
            fail(responseUpdate)
          })

      })

      /* ################## FUNCIONÁRIO ################## */

      test("/PUT - Deve retornar 200, para sucesso na atualização de uma reserva pelo Funcionário.", function() {

        let reserve = {
          apartment_id: "48421917gjm6g8dhjj52lb7j",
          status: "ocupado"
        }

        return request.put(endpoints.toUpdate).send(reserve).set('Authorization', accounts.funcionario.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(200)

            expect(responseUpdate.body._links).toBeDefined()
            expect(responseUpdate.body._links).toHaveLength(4)
            expect(responseUpdate.body._links[0]).toMatchObject({
              href: `${ baseURL }${ endpoints.toRead }/${ reserve.apartment_id }`,
              method: 'GET',
              rel: 'self_reserve'
            })
            expect(responseUpdate.body._links[1]).toMatchObject({
              href: `${ baseURL }${ endpoints.toUpdate }`,
              method: 'PUT',
              rel: 'edit_reserve'
            })
            expect(responseUpdate.body._links[2]).toMatchObject({
              href: `${ baseURL }${ endpoints.toDelete }/${ reserve.apartment_id }`,
              method: 'DELETE',
              rel: 'delete_reserve'
            })
            expect(responseUpdate.body._links[3]).toMatchObject({
              href: `${ baseURL }${ endpoints.toList }`,
              method: 'GET',
              rel: 'reserve_list'
            })

            return request.get(`${ endpoints.toRead }/${ reserve.apartment_id }`).set('Authorization', accounts.cliente.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                const {
                  reservedIn,
                  _links
                } = responseRead.body

                expect(responseRead.body).toMatchObject({
                  apartment_id: reserve.apartment_id,
                  status: reserve.status
                })

                expect(responseRead.body.reservedIn).toBeDefined()

                expect(responseRead.body._links).toBeDefined()
                expect(responseRead.body._links).toHaveLength(3)
                expect(responseRead.body._links[0]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toRead }/${ reserve.apartment_id }`,
                  method: 'GET',
                  rel: 'self_reserve'
                })
                expect(responseRead.body._links[1]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toUpdate }`,
                  method: 'PUT',
                  rel: 'edit_reserve'
                })
                expect(responseRead.body._links[2]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toDelete }/${ reserve.apartment_id }`,
                  method: 'DELETE',
                  rel: 'delete_reserve'
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

      test("/PUT - Deve retornar 200, para atualizar Data de Início e Fim de uma reserva pelo Funcionário.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        let reserve = {
          apartment_id: "48421917gjm6g8dhjj52lb7j",
          status: "ocupado",
          start,
          end
        }

        return request.put(endpoints.toUpdate).send(reserve).set('Authorization', accounts.funcionario.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(200)

            expect(responseUpdate.body._links).toBeDefined()
            expect(responseUpdate.body._links).toHaveLength(4)
            expect(responseUpdate.body._links[0]).toMatchObject({
              href: `${ baseURL }${ endpoints.toRead }/${ reserve.apartment_id }`,
              method: 'GET',
              rel: 'self_reserve'
            })
            expect(responseUpdate.body._links[1]).toMatchObject({
              href: `${ baseURL }${ endpoints.toUpdate }`,
              method: 'PUT',
              rel: 'edit_reserve'
            })
            expect(responseUpdate.body._links[2]).toMatchObject({
              href: `${ baseURL }${ endpoints.toDelete }/${ reserve.apartment_id }`,
              method: 'DELETE',
              rel: 'delete_reserve'
            })
            expect(responseUpdate.body._links[3]).toMatchObject({
              href: `${ baseURL }${ endpoints.toList }`,
              method: 'GET',
              rel: 'reserve_list'
            })

            return request.get(`${ endpoints.toRead }/${ reserve.apartment_id }`).set('Authorization', accounts.cliente.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                const {
                  reservedIn,
                  _links
                } = responseRead.body

                expect(responseRead.body).toMatchObject({
                  apartment_id: reserve.apartment_id,
                  status: reserve.status,
                  start: reserve.start,
                  end: reserve.end
                })

                expect(responseRead.body.reservedIn).toBeDefined()

                expect(responseRead.body._links).toBeDefined()
                expect(responseRead.body._links).toHaveLength(3)
                expect(responseRead.body._links[0]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toRead }/${ reserve.apartment_id }`,
                  method: 'GET',
                  rel: 'self_reserve'
                })
                expect(responseRead.body._links[1]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toUpdate }`,
                  method: 'PUT',
                  rel: 'edit_reserve'
                })
                expect(responseRead.body._links[2]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toDelete }/${ reserve.apartment_id }`,
                  method: 'DELETE',
                  rel: 'delete_reserve'
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

      test("/PUT - Deve retornar 200, o Funcionário modifica o Status da reserva de Ocupado para Reservado.", function() {

        let reserve = {
          apartment_id: "48421917gjm6g8dhjj52lb7j",
          status: "reservado",
        }

        return request.put(endpoints.toUpdate).send(reserve).set('Authorization', accounts.funcionario.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(200)

            expect(responseUpdate.body._links).toBeDefined()
            expect(responseUpdate.body._links).toHaveLength(4)
            expect(responseUpdate.body._links[0]).toMatchObject({
              href: `${ baseURL }${ endpoints.toRead }/${ reserve.apartment_id }`,
              method: 'GET',
              rel: 'self_reserve'
            })
            expect(responseUpdate.body._links[1]).toMatchObject({
              href: `${ baseURL }${ endpoints.toUpdate }`,
              method: 'PUT',
              rel: 'edit_reserve'
            })
            expect(responseUpdate.body._links[2]).toMatchObject({
              href: `${ baseURL }${ endpoints.toDelete }/${ reserve.apartment_id }`,
              method: 'DELETE',
              rel: 'delete_reserve'
            })
            expect(responseUpdate.body._links[3]).toMatchObject({
              href: `${ baseURL }${ endpoints.toList }`,
              method: 'GET',
              rel: 'reserve_list'
            })

            return request.get(`${ endpoints.toRead }/${ reserve.apartment_id }`).set('Authorization', accounts.cliente.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                const {
                  reservedIn,
                  _links
                } = responseRead.body

                expect(responseRead.body).toMatchObject({
                  apartment_id: reserve.apartment_id,
                  status: reserve.status,
                })

                expect(responseRead.body.reservedIn).toBeDefined()

                expect(responseRead.body._links).toBeDefined()
                expect(responseRead.body._links).toHaveLength(3)
                expect(responseRead.body._links[0]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toRead }/${ reserve.apartment_id }`,
                  method: 'GET',
                  rel: 'self_reserve'
                })
                expect(responseRead.body._links[1]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toUpdate }`,
                  method: 'PUT',
                  rel: 'edit_reserve'
                })
                expect(responseRead.body._links[2]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toDelete }/${ reserve.apartment_id }`,
                  method: 'DELETE',
                  rel: 'delete_reserve'
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

      /* ################## GERENTE ################## */

      test("/PUT - Deve retornar 200, para sucesso na atualização de uma reserva pelo Gerente.", function() {

        let reserve = {
          apartment_id: "cljn205e58dcmh6fb0ffabgg",
          status: "ocupado"
        }

        return request.put(endpoints.toUpdate).send(reserve).set('Authorization', accounts.gerente.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(200)

            expect(responseUpdate.body._links).toBeDefined()
            expect(responseUpdate.body._links).toHaveLength(4)
            expect(responseUpdate.body._links[0]).toMatchObject({
              href: `${ baseURL }${ endpoints.toRead }/${ reserve.apartment_id }`,
              method: 'GET',
              rel: 'self_reserve'
            })
            expect(responseUpdate.body._links[1]).toMatchObject({
              href: `${ baseURL }${ endpoints.toUpdate }`,
              method: 'PUT',
              rel: 'edit_reserve'
            })
            expect(responseUpdate.body._links[2]).toMatchObject({
              href: `${ baseURL }${ endpoints.toDelete }/${ reserve.apartment_id }`,
              method: 'DELETE',
              rel: 'delete_reserve'
            })
            expect(responseUpdate.body._links[3]).toMatchObject({
              href: `${ baseURL }${ endpoints.toList }`,
              method: 'GET',
              rel: 'reserve_list'
            })

            return request.get(`${ endpoints.toRead }/${ reserve.apartment_id }`).set('Authorization', accounts.cliente.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                const {
                  reservedIn,
                  _links
                } = responseRead.body

                expect(responseRead.body).toMatchObject({
                  apartment_id: reserve.apartment_id,
                  status: reserve.status
                })

                expect(responseRead.body.reservedIn).toBeDefined()

                expect(responseRead.body._links).toBeDefined()
                expect(responseRead.body._links).toHaveLength(3)
                expect(responseRead.body._links[0]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toRead }/${ reserve.apartment_id }`,
                  method: 'GET',
                  rel: 'self_reserve'
                })
                expect(responseRead.body._links[1]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toUpdate }`,
                  method: 'PUT',
                  rel: 'edit_reserve'
                })
                expect(responseRead.body._links[2]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toDelete }/${ reserve.apartment_id }`,
                  method: 'DELETE',
                  rel: 'delete_reserve'
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

      test("/PUT - Deve retornar 200, para atualizar Data de Início e Fim de uma reserva pelo Gerente.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        let reserve = {
          apartment_id: "cljn205e58dcmh6fb0ffabgg",
          status: "ocupado",
          start,
          end
        }

        return request.put(endpoints.toUpdate).send(reserve).set('Authorization', accounts.gerente.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(200)

            expect(responseUpdate.body._links).toBeDefined()
            expect(responseUpdate.body._links).toHaveLength(4)
            expect(responseUpdate.body._links[0]).toMatchObject({
              href: `${ baseURL }${ endpoints.toRead }/${ reserve.apartment_id }`,
              method: 'GET',
              rel: 'self_reserve'
            })
            expect(responseUpdate.body._links[1]).toMatchObject({
              href: `${ baseURL }${ endpoints.toUpdate }`,
              method: 'PUT',
              rel: 'edit_reserve'
            })
            expect(responseUpdate.body._links[2]).toMatchObject({
              href: `${ baseURL }${ endpoints.toDelete }/${ reserve.apartment_id }`,
              method: 'DELETE',
              rel: 'delete_reserve'
            })
            expect(responseUpdate.body._links[3]).toMatchObject({
              href: `${ baseURL }${ endpoints.toList }`,
              method: 'GET',
              rel: 'reserve_list'
            })

            return request.get(`${ endpoints.toRead }/${ reserve.apartment_id }`).set('Authorization', accounts.cliente.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                const {
                  reservedIn,
                  _links
                } = responseRead.body

                expect(responseRead.body).toMatchObject({
                  apartment_id: reserve.apartment_id,
                  status: reserve.status,
                  start: reserve.start,
                  end: reserve.end
                })

                expect(responseRead.body.reservedIn).toBeDefined()

                expect(responseRead.body._links).toBeDefined()
                expect(responseRead.body._links).toHaveLength(3)
                expect(responseRead.body._links[0]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toRead }/${ reserve.apartment_id }`,
                  method: 'GET',
                  rel: 'self_reserve'
                })
                expect(responseRead.body._links[1]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toUpdate }`,
                  method: 'PUT',
                  rel: 'edit_reserve'
                })
                expect(responseRead.body._links[2]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toDelete }/${ reserve.apartment_id }`,
                  method: 'DELETE',
                  rel: 'delete_reserve'
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

      test("/PUT - Deve retornar 200, o Gerente modifica o Status da reserva de Ocupado para Reservado.", function() {

        let reserve = {
          apartment_id: "cljn205e58dcmh6fb0ffabgg",
          status: "reservado",
        }

        return request.put(endpoints.toUpdate).send(reserve).set('Authorization', accounts.gerente.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(200)

            expect(responseUpdate.body._links).toBeDefined()
            expect(responseUpdate.body._links).toHaveLength(4)
            expect(responseUpdate.body._links[0]).toMatchObject({
              href: `${ baseURL }${ endpoints.toRead }/${ reserve.apartment_id }`,
              method: 'GET',
              rel: 'self_reserve'
            })
            expect(responseUpdate.body._links[1]).toMatchObject({
              href: `${ baseURL }${ endpoints.toUpdate }`,
              method: 'PUT',
              rel: 'edit_reserve'
            })
            expect(responseUpdate.body._links[2]).toMatchObject({
              href: `${ baseURL }${ endpoints.toDelete }/${ reserve.apartment_id }`,
              method: 'DELETE',
              rel: 'delete_reserve'
            })
            expect(responseUpdate.body._links[3]).toMatchObject({
              href: `${ baseURL }${ endpoints.toList }`,
              method: 'GET',
              rel: 'reserve_list'
            })

            return request.get(`${ endpoints.toRead }/${ reserve.apartment_id }`).set('Authorization', accounts.cliente.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                const {
                  reservedIn,
                  _links
                } = responseRead.body

                expect(responseRead.body).toMatchObject({
                  apartment_id: reserve.apartment_id,
                  status: reserve.status,
                })

                expect(responseRead.body.reservedIn).toBeDefined()

                expect(responseRead.body._links).toBeDefined()
                expect(responseRead.body._links).toHaveLength(3)
                expect(responseRead.body._links[0]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toRead }/${ reserve.apartment_id }`,
                  method: 'GET',
                  rel: 'self_reserve'
                })
                expect(responseRead.body._links[1]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toUpdate }`,
                  method: 'PUT',
                  rel: 'edit_reserve'
                })
                expect(responseRead.body._links[2]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toDelete }/${ reserve.apartment_id }`,
                  method: 'DELETE',
                  rel: 'delete_reserve'
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

      /* ################## ADMIN ################## */

      test("/PUT - Deve retornar 200, para sucesso na atualização de uma reserva pelo Gerente.", function() {

        let reserve = {
          apartment_id: "n0kj2b1e0g9h22in405c9c6g",
          status: "ocupado"
        }

        return request.put(endpoints.toUpdate).send(reserve).set('Authorization', accounts.admin.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(200)

            expect(responseUpdate.body._links).toBeDefined()
            expect(responseUpdate.body._links).toHaveLength(4)
            expect(responseUpdate.body._links[0]).toMatchObject({
              href: `${ baseURL }${ endpoints.toRead }/${ reserve.apartment_id }`,
              method: 'GET',
              rel: 'self_reserve'
            })
            expect(responseUpdate.body._links[1]).toMatchObject({
              href: `${ baseURL }${ endpoints.toUpdate }`,
              method: 'PUT',
              rel: 'edit_reserve'
            })
            expect(responseUpdate.body._links[2]).toMatchObject({
              href: `${ baseURL }${ endpoints.toDelete }/${ reserve.apartment_id }`,
              method: 'DELETE',
              rel: 'delete_reserve'
            })
            expect(responseUpdate.body._links[3]).toMatchObject({
              href: `${ baseURL }${ endpoints.toList }`,
              method: 'GET',
              rel: 'reserve_list'
            })

            return request.get(`${ endpoints.toRead }/${ reserve.apartment_id }`).set('Authorization', accounts.cliente.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                const {
                  reservedIn,
                  _links
                } = responseRead.body

                expect(responseRead.body).toMatchObject({
                  apartment_id: reserve.apartment_id,
                  status: reserve.status
                })

                expect(responseRead.body.reservedIn).toBeDefined()

                expect(responseRead.body._links).toBeDefined()
                expect(responseRead.body._links).toHaveLength(3)
                expect(responseRead.body._links[0]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toRead }/${ reserve.apartment_id }`,
                  method: 'GET',
                  rel: 'self_reserve'
                })
                expect(responseRead.body._links[1]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toUpdate }`,
                  method: 'PUT',
                  rel: 'edit_reserve'
                })
                expect(responseRead.body._links[2]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toDelete }/${ reserve.apartment_id }`,
                  method: 'DELETE',
                  rel: 'delete_reserve'
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

      test("/PUT - Deve retornar 200, para atualizar Data de Início e Fim de uma reserva pelo Admin.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        let reserve = {
          apartment_id: "n0kj2b1e0g9h22in405c9c6g",
          status: "ocupado",
          start,
          end
        }

        return request.put(endpoints.toUpdate).send(reserve).set('Authorization', accounts.admin.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(200)

            expect(responseUpdate.body._links).toBeDefined()
            expect(responseUpdate.body._links).toHaveLength(4)
            expect(responseUpdate.body._links[0]).toMatchObject({
              href: `${ baseURL }${ endpoints.toRead }/${ reserve.apartment_id }`,
              method: 'GET',
              rel: 'self_reserve'
            })
            expect(responseUpdate.body._links[1]).toMatchObject({
              href: `${ baseURL }${ endpoints.toUpdate }`,
              method: 'PUT',
              rel: 'edit_reserve'
            })
            expect(responseUpdate.body._links[2]).toMatchObject({
              href: `${ baseURL }${ endpoints.toDelete }/${ reserve.apartment_id }`,
              method: 'DELETE',
              rel: 'delete_reserve'
            })
            expect(responseUpdate.body._links[3]).toMatchObject({
              href: `${ baseURL }${ endpoints.toList }`,
              method: 'GET',
              rel: 'reserve_list'
            })

            return request.get(`${ endpoints.toRead }/${ reserve.apartment_id }`).set('Authorization', accounts.cliente.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                const {
                  reservedIn,
                  _links
                } = responseRead.body

                expect(responseRead.body).toMatchObject({
                  apartment_id: reserve.apartment_id,
                  status: reserve.status,
                  start: reserve.start,
                  end: reserve.end
                })

                expect(responseRead.body.reservedIn).toBeDefined()

                expect(responseRead.body._links).toBeDefined()
                expect(responseRead.body._links).toHaveLength(3)
                expect(responseRead.body._links[0]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toRead }/${ reserve.apartment_id }`,
                  method: 'GET',
                  rel: 'self_reserve'
                })
                expect(responseRead.body._links[1]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toUpdate }`,
                  method: 'PUT',
                  rel: 'edit_reserve'
                })
                expect(responseRead.body._links[2]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toDelete }/${ reserve.apartment_id }`,
                  method: 'DELETE',
                  rel: 'delete_reserve'
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

      test("/PUT - Deve retornar 200, o Admin modifica o Status da reserva de Ocupado para Reservado.", function() {

        let reserve = {
          apartment_id: "cljn205e58dcmh6fb0ffabgg",
          status: "reservado",
        }

        return request.put(endpoints.toUpdate).send(reserve).set('Authorization', accounts.admin.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(200)

            expect(responseUpdate.body._links).toBeDefined()
            expect(responseUpdate.body._links).toHaveLength(4)
            expect(responseUpdate.body._links[0]).toMatchObject({
              href: `${ baseURL }${ endpoints.toRead }/${ reserve.apartment_id }`,
              method: 'GET',
              rel: 'self_reserve'
            })
            expect(responseUpdate.body._links[1]).toMatchObject({
              href: `${ baseURL }${ endpoints.toUpdate }`,
              method: 'PUT',
              rel: 'edit_reserve'
            })
            expect(responseUpdate.body._links[2]).toMatchObject({
              href: `${ baseURL }${ endpoints.toDelete }/${ reserve.apartment_id }`,
              method: 'DELETE',
              rel: 'delete_reserve'
            })
            expect(responseUpdate.body._links[3]).toMatchObject({
              href: `${ baseURL }${ endpoints.toList }`,
              method: 'GET',
              rel: 'reserve_list'
            })

            return request.get(`${ endpoints.toRead }/${ reserve.apartment_id }`).set('Authorization', accounts.cliente.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                const {
                  reservedIn,
                  _links
                } = responseRead.body

                expect(responseRead.body).toMatchObject({
                  apartment_id: reserve.apartment_id,
                  status: reserve.status,
                })

                expect(responseRead.body.reservedIn).toBeDefined()

                expect(responseRead.body._links).toBeDefined()
                expect(responseRead.body._links).toHaveLength(3)
                expect(responseRead.body._links[0]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toRead }/${ reserve.apartment_id }`,
                  method: 'GET',
                  rel: 'self_reserve'
                })
                expect(responseRead.body._links[1]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toUpdate }`,
                  method: 'PUT',
                  rel: 'edit_reserve'
                })
                expect(responseRead.body._links[2]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toDelete }/${ reserve.apartment_id }`,
                  method: 'DELETE',
                  rel: 'delete_reserve'
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

      test("/PUT - Deve retornar 200, o Admin modifica o Status da reserva para Indisponível.", function() {

        let reserve = {
          apartment_id: "cljn205e58dcmh6fb0ffabgg",
          status: "indisponível",
        }

        return request.put(endpoints.toUpdate).send(reserve).set('Authorization', accounts.admin.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(200)

            expect(responseUpdate.body._links).toBeDefined()
            expect(responseUpdate.body._links).toHaveLength(4)
            expect(responseUpdate.body._links[0]).toMatchObject({
              href: `${ baseURL }${ endpoints.toRead }/${ reserve.apartment_id }`,
              method: 'GET',
              rel: 'self_reserve'
            })
            expect(responseUpdate.body._links[1]).toMatchObject({
              href: `${ baseURL }${ endpoints.toUpdate }`,
              method: 'PUT',
              rel: 'edit_reserve'
            })
            expect(responseUpdate.body._links[2]).toMatchObject({
              href: `${ baseURL }${ endpoints.toDelete }/${ reserve.apartment_id }`,
              method: 'DELETE',
              rel: 'delete_reserve'
            })
            expect(responseUpdate.body._links[3]).toMatchObject({
              href: `${ baseURL }${ endpoints.toList }`,
              method: 'GET',
              rel: 'reserve_list'
            })

            return request.get(`${ endpoints.toRead }/${ reserve.apartment_id }`).set('Authorization', accounts.admin.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(200)

                const {
                  _links
                } = responseRead.body

                expect(responseRead.body).toMatchObject({
                  apartment_id: reserve.apartment_id,
                  status: reserve.status,
                  user_id: '',
                  start: '',
                  end: '',
                  reservedIn: '',
                })

                expect(responseRead.body._links).toBeDefined()
                expect(responseRead.body._links).toHaveLength(4)
                expect(responseRead.body._links[0]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toRead }/${ reserve.apartment_id }`,
                  method: 'GET',
                  rel: 'self_reserve'
                })
                expect(responseRead.body._links[1]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toUpdate }`,
                  method: 'PUT',
                  rel: 'edit_reserve'
                })
                expect(responseRead.body._links[2]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toDelete }/${ reserve.apartment_id }`,
                  method: 'DELETE',
                  rel: 'delete_reserve'
                })
                expect(responseUpdate.body._links[3]).toMatchObject({
                  href: `${ baseURL }${ endpoints.toList }`,
                  method: 'GET',
                  rel: 'reserve_list'
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

    })

    describe("Testes de FALHA.", function() {

      test("/PUT - Deve retornar 401, o usuário não está AUTORIZADO.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        let reserve = {
          apartment_id: "02n07j2d1hf5a2f26djjj92a",
          status: "reservado",
          user_id: accounts.cliente.id,
          start,
          end,
        }

        return request.put(endpoints.toUpdate).send(reserve)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(401)

            expect(responseUpdate.body.RestException.Code).toBe('5')
            expect(responseUpdate.body.RestException.Message).toBe('O usuário não está autorizado')
            expect(responseUpdate.body.RestException.Status).toBe('401')
            expect(responseUpdate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/5`)

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      // Falhas no ID do apartamento escolhido.
      test("/PUT - Deve retornar 400, por não conter o ID do apartamento a ser reservado.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        let reserve = {
          apartment_id: "",
          status: "reservado",
          user_id: accounts.cliente.id,
          start,
          end,
        }

        return request.put(endpoints.toUpdate).send(reserve).set('Authorization', accounts.funcionario.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(400)

            expect(responseUpdate.body.RestException.Code).toBe("1")
            expect(responseUpdate.body.RestException.Message).toBe("O ID do apartamento é obrigatório")
            expect(responseUpdate.body.RestException.Status).toBe("400")
            expect(responseUpdate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
            expect(responseUpdate.body.RestException.ErrorFields[0].field).toBe('iptApartment')
            expect(responseUpdate.body.RestException.ErrorFields[0].hasError.error).toBe('O ID do apartamento é obrigatório')

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      test("/PUT - Deve retornar 400, por conter caracteres inválidos no ID do apartamento.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        let reserve = {
          apartment_id: "sdf*q98-we7",
          status: "reservado",
          user_id: accounts.cliente.id,
          start,
          end,
        }

        return request.put(endpoints.toUpdate).send(reserve).set('Authorization', accounts.funcionario.token)

          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(400)

            expect(responseUpdate.body.RestException.Code).toBe("2")
            expect(responseUpdate.body.RestException.Message).toBe("O ID do apartamento contém caracteres inválidos")
            expect(responseUpdate.body.RestException.Status).toBe("400")
            expect(responseUpdate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseUpdate.body.RestException.ErrorFields[0].field).toBe('iptApartment')
            expect(responseUpdate.body.RestException.ErrorFields[0].hasError.error).toBe('O ID do apartamento contém caracteres inválidos')

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      test("/PUT - Deve retornar 404, o ID informado não pertence a um apartamento.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        let reserve = {
          apartment_id: "4d4i4kgh2ijg22led9g57nhl",
          status: "reservado",
          user_id: accounts.cliente.id,
          start,
          end,
        }

        return request.put(endpoints.toUpdate).send(reserve).set('Authorization', accounts.funcionario.token)

          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(404)

            expect(responseUpdate.body.RestException.Code).toBe("3")
            expect(responseUpdate.body.RestException.Message).toBe("Nenhum apartamento com o ID informado está cadastrado")
            expect(responseUpdate.body.RestException.Status).toBe("404")
            expect(responseUpdate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/3`)
            expect(responseUpdate.body.RestException.ErrorFields[0].field).toBe('iptApartment')
            expect(responseUpdate.body.RestException.ErrorFields[0].hasError.error).toBe('Nenhum apartamento com o ID informado está cadastrado')

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      test("/PUT - Deve retornar 403, já que o apartamento está INDISPONÍVEL.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        let reserve = {
          apartment_id: "52bdn4eecffeh7gagdn6c4nl",
          status: "reservado",
          user_id: accounts.cliente.id,
          start,
          end,
        }

        return request.put(endpoints.toUpdate).send(reserve).set('Authorization', accounts.funcionario.token)
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

      // Falhas no Status da reserva.
      test("/PUT - Deve retornar 400, já que o valor de Status é inválido.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        let reserve = {
          apartment_id: "856377c88f8fd9fc65fd3ef5",
          status: "1",
          user_id: accounts.cliente.id,
          start,
          end,
        }

        return request.put(endpoints.toUpdate).send(reserve).set('Authorization', accounts.funcionario.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(400)

            expect(responseUpdate.body.RestException.Code).toBe("2")
            expect(responseUpdate.body.RestException.Message).toBe("O valor do campo de Status é inválido")
            expect(responseUpdate.body.RestException.Status).toBe("400")
            expect(responseUpdate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseUpdate.body.RestException.ErrorFields[0].field).toBe('iptStatus')
            expect(responseUpdate.body.RestException.ErrorFields[0].hasError.error).toBe('O valor do campo de Status é inválido')

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      test("/PUT - Deve retornar 403, já que o Cliente não pode alterar o Status.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        // Esse apartamento foi cadastrado para o cliente, na Suite de CREATE.
        let reserve = {
          apartment_id: "48421917gjm6g8dhjj52lb7j",
          status: "ocupado",
          user_id: accounts.cliente.id,
          start,
          end,
        }

        return request.put(endpoints.toUpdate).send(reserve).set('Authorization', accounts.cliente.token)
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

      test("/PUT - Deve retornar 403, o Funcionário não pode tornar um apto Indisponível.", function() {

        let reserve = {
          apartment_id: "02n07j2d1hf5a2f26djjj92a",
          status: "indisponível"
        }

        return request.put(endpoints.toUpdate).send(reserve).set('Authorization', accounts.funcionario.token)
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

      test("/PUT - Deve retornar 403, o Gerente não pode tornar um apto Indisponível se o mesmo já estiver Ocupado.", function() {

        let reserve = {
          apartment_id: "d9d62beecdde62af82efd82c",
          status: "indisponível",
        }

        return request.put(endpoints.toUpdate).send(reserve).set('Authorization', accounts.gerente.token)
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

      // Falhas no ID do cliente.
      test("/PUT - Deve retornar 400, já que ID do cliente contém caractere inválido.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        let reserve = {
          apartment_id: "27ibm1he7gl4ei9i7jcacbl6",
          status: "ocupado",
          user_id: accounts.cliente.id.slice(0, -1) + "*",
          start,
          end,
        }

        return request.put(endpoints.toUpdate).send(reserve).set('Authorization', accounts.funcionario.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(400)

            expect(responseUpdate.body.RestException.Code).toBe("2")
            expect(responseUpdate.body.RestException.Message).toBe("O ID do cliente/usuário contém caracteres inválidos")
            expect(responseUpdate.body.RestException.Status).toBe("400")
            expect(responseUpdate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseUpdate.body.RestException.ErrorFields[0].field).toBe('iptClient')
            expect(responseUpdate.body.RestException.ErrorFields[0].hasError.error).toBe("O ID do cliente/usuário contém caracteres inválidos")

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      test("/PUT - Deve retornar 404, já que ID do cliente não foi encontrado.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        let reserve = {
          apartment_id: "27ibm1he7gl4ei9i7jcacbl6",
          status: "ocupado",
          user_id: "6kde3ibi8a1d4187c1ji73bj",
          start,
          end,
        }

        return request.put(endpoints.toUpdate).send(reserve).set('Authorization', accounts.funcionario.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(404)

            expect(responseUpdate.body.RestException.Code).toBe("3")
            expect(responseUpdate.body.RestException.Message).toBe("Nenhum usuário com o ID informado está cadastrado")
            expect(responseUpdate.body.RestException.Status).toBe("404")
            expect(responseUpdate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/3`)
            expect(responseUpdate.body.RestException.ErrorFields[0].field).toBe('iptClient')
            expect(responseUpdate.body.RestException.ErrorFields[0].hasError.error).toBe("Nenhum usuário com o ID informado está cadastrado")

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      // Falhas na Data de Início da reserva.
      test("/PUT - Deve retornar 400, devido a presença de caracteres inválidos na Data de Início da reserva.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        let reserve = {
          apartment_id: "27ibm1he7gl4ei9i7jcacbl6",
          status: "ocupado",
          user_id: accounts.cliente.id,
          start: start.slice(0, -1) + '*',
          end,
        }

        return request.put(endpoints.toUpdate).send(reserve).set('Authorization', accounts.funcionario.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(400)

            expect(responseUpdate.body.RestException.Code).toBe("2")
            expect(responseUpdate.body.RestException.Message).toBe("A Data de Início escolhida é inválida")
            expect(responseUpdate.body.RestException.Status).toBe("400")
            expect(responseUpdate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseUpdate.body.RestException.ErrorFields[0].field).toBe('iptStartDate')
            expect(responseUpdate.body.RestException.ErrorFields[0].hasError.error).toBe("A Data de Início escolhida é inválida")

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      test("/PUT - Deve retornar 400, já que a Data de Início é anterior a data Atual.", function() {

        let date = dateNow.getDate()
        let start = getDateWithLastMonth(date)
        let end = getDateWithNextMonth(date)

        let reserve = {
          apartment_id: "27ibm1he7gl4ei9i7jcacbl6",
          status: "ocupado",
          user_id: accounts.cliente.id,
          start,
          end,
        }

        return request.put(endpoints.toUpdate).send(reserve).set('Authorization', accounts.funcionario.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(400)

            expect(responseUpdate.body.RestException.Code).toBe("2")
            expect(responseUpdate.body.RestException.Message).toBe("A Data de Início escolhida é inválida")
            expect(responseUpdate.body.RestException.Status).toBe("400")
            expect(responseUpdate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseUpdate.body.RestException.ErrorFields[0].field).toBe('iptStartDate')
            expect(responseUpdate.body.RestException.ErrorFields[0].hasError.error).toBe("A Data de Início escolhida é inválida")

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      // Falhas na Data de Fim da reserva.
      test("/PUT - Deve retornar 400, devido a presença de caracteres inválidos na Data de Fim da reserva.", function() {

        let start = dateNow.getDate()
        let end = getDateWithNextMonth(start)

        let reserve = {
          apartment_id: "27ibm1he7gl4ei9i7jcacbl6",
          status: "ocupado",
          user_id: accounts.cliente.id,
          start,
          end: end.slice(0, -1) + '*'
        }

        return request.put(endpoints.toUpdate).send(reserve).set('Authorization', accounts.funcionario.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(400)

            expect(responseUpdate.body.RestException.Code).toBe("2")
            expect(responseUpdate.body.RestException.Message).toBe("A Data de Fim escolhida é inválida")
            expect(responseUpdate.body.RestException.Status).toBe("400")
            expect(responseUpdate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseUpdate.body.RestException.ErrorFields[0].field).toBe('iptEndDate')
            expect(responseUpdate.body.RestException.ErrorFields[0].hasError.error).toBe("A Data de Fim escolhida é inválida")

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      test("/PUT - Deve retornar 400, por ter informado uma Data de Fim anterior a Data de Início da reserva.", function() {

        let date = dateNow.getDate()
        let start = getDateWithNextMonth(date)
        let end = getDateWithLastMonth(date)

        let reserve = {
          apartment_id: "27ibm1he7gl4ei9i7jcacbl6",
          status: "ocupado",
          user_id: accounts.cliente.id,
          start,
          end,
        }

        return request.put(endpoints.toUpdate).send(reserve).set('Authorization', accounts.funcionario.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(400)

            expect(responseUpdate.body.RestException.Code).toBe("2")
            expect(responseUpdate.body.RestException.Message).toBe("A Data de Fim escolhida é inválida")
            expect(responseUpdate.body.RestException.Status).toBe("400")
            expect(responseUpdate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseUpdate.body.RestException.ErrorFields[0].field).toBe('iptEndDate')
            expect(responseUpdate.body.RestException.ErrorFields[0].hasError.error).toBe("A Data de Fim escolhida é inválida")

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

    })

  })

  // A Deletação/Cancelamento de uma reserva se baseia no ID do apartamento.
  describe("DELETE", function() {

    /*
    describe("Teste de SUCESSO.", function() {
      test("/DELETE - Deve retornar 200, para cancelamento/deleção da reserva.", function() {
        const apartment = { id: 'f5gee7kf7l3dl2950gbn3ckf' }

        return request.delete(`${ endpoints.toDelete }/${ apartment.id }`)
          .then(function(responseDELETE) {
            expect(responseDELETE.statusCode).toEqual(200)

            return request.get(`${ endpoints.toRead }/${ apartment.id }`)
              .then(function(responseGET) {
                expect(responseGET.statusCode).toEqual(200)
                expect(responseGET.body).toMatchObject({
                  apartment_id: apartment.id,
                  status: 'livre',
                  user_id: '',
                  date: '',
                  start: '',
                  end: ''
                })
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
    */

    describe("Teste de FALHA.", function() {

      test("/DELETE - Deve retornar 401, o usuário não está logado.", function() {

        const apartment = { id: '27ibm1he7gl4ei9i7jcacb*6' }

        return request.delete(`${ endpoints.toDelete }/${ apartment.id }`)
          .then(function(responseDelete) {

            expect(responseDelete.statusCode).toEqual(401)

            expect(responseDelete.body.RestException.Code).toBe('5')
            expect(responseDelete.body.RestException.Message).toBe('O usuário não está autorizado')
            expect(responseDelete.body.RestException.Status).toBe('401')
            expect(responseDelete.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/5`)

          })
          .catch(function(errorDelete) {
            fail(errorDelete)
          })

      })

      test("/DELETE - Deve retornar 400, já que o ID do apartamento é inválido.", function() {

        const apartment = { id: '27ibm1he7gl4ei9i7jcacb*6' }

        return request.delete(`${ endpoints.toDelete }/${ apartment.id }`).set('Authorization', accounts.funcionario.token)
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

      test("/DELETE - Deve retornar 403, o Cliente não pode cancelar uma reserva que não seja sua.", function() {

        const apartment = { id: 'mmfel7oi6p43kjj6jebln8dn97' }

        return request.delete(`${ endpoints.toDelete }/${ apartment.id }`).set('Authorization', accounts.cliente.token)
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

      /*
      test("/DELETE - Deve retornar 404, já que o ID informado não corresponde a um apartamento cadastrado.", function() {
        const apartment = { id: '27ibm1he7gl4ei9i7jcaccc' }

        return request.delete(`${ endpoints.toDelete }/${ apartment.id }`)
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
      */
    })

  })

})