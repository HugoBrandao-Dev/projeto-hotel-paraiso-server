const app = require('../src/app')
const supertest = require('supertest')
const Generator = require('../src/tools/Generator')
const ApartmentsTools = require('../src/tools/ApartmentsTools')

const fileSystem = require('fs')
const path = require('path')

const DateFormated = require('../src/tools/DateFormated')
const dateNow = new DateFormated('mongodb')

const EndPoints = require('../src/routes/endpoints')
const userEndPoints = new EndPoints({ singular: 'user', plural: 'users' })
const endpoints = new EndPoints({ singular: 'apartment', plural: 'apartments' })

const request = supertest(app)

const baseURL = 'http://localhost:4000'
const projectLinks = {
  errors: 'https://projetohotelparaiso.dev/docs/erros'
}

let accounts = {
  admin: {
    id: '',
    name: '',
    token: ''
  },
  gerente: {
    id: '',
    name: '',
    token: ''
  },
  funcionario: {
    id: '',
    name: '',
    token: ''
  },
  cliente: {
    id: '',
    name: '',
    token: ''
  }
}

// Aumenta o tempo máximo para resposta - o padrão é 5000ms.
jest.setTimeout(50000)

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

function extractApartmentID(link) {
  return link.split('/')[4]
}

function extractPictureName(src) {
  return src.split('\\').slice(-1)
}

function genPath(img) {
  return new Promise(function(resolve, reject) {
    let src = path.resolve(__dirname, `img/${ img }`)
    if (src) {
      resolve(src)
    } else {
      reject('Erro no SRC')
    }
  })
}

function register(user) {

  return new Promise((resolve, reject) => {

    return request.post(userEndPoints.toCreate).send(user)
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

    return request.post(userEndPoints.toLogin).send(login)
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

    return request.put(userEndPoints.toUpdate).send({
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

  } catch (error) {
    console.log(error)
  }

})

describe("Suite de testes das rotas de Apartment.", function() {
  let idRegisteredApartmentsWithPictures = []

  describe("CREATE", function() {

    describe("Testes de SUCESSO.", function() {

      test("/POST - Deve retornar 201, para sucesso no cadastro de um apartamento.", async function() {

        try {

          let number = (ApartmentsTools.getMinMaxNumber().max + 1).toString()

          let apartment = {
            floor: "1",
            number,
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
            accepts_animals: '0',
            daily_price: '200'
          }

          let responseCreate = await request.post(endpoints.toCreate).send(apartment).set('Authorization', accounts.admin.token)

          expect(responseCreate.statusCode).toEqual(201)

          expect(responseCreate.body._links).toBeDefined()
          expect(responseCreate.body._links).toHaveLength(4)

          try {

            const id = responseCreate.body._links[0].href.split('/').pop()

            let responseRead = await request.get(`${ endpoints.toRead }/${ id }`).set('Authorization', accounts.admin.token)

            const { reserve, created, updated } = responseRead.body

            expect(reserve).toBeDefined()
            expect(reserve).toMatchObject({
              status: "livre",
              client_id: "",
              start: "",
              end: "",
            })

            expect(created.createdAt).toBeDefined()
            expect(created.createdBy).toMatchObject({
              id: accounts.admin.id,
              name: accounts.admin.name,
            })

            expect(updated).toMatchObject({
              updatedAt: "",
              updatedBy: {
                id: "",
                name: "",
              }
            })

          } catch (errorRead) {
            fail(errorRead)
          }

        } catch (errorCreate) {
          fail(errorCreate)
        }

      })

      test("/POST - Deve retornar 201, para sucesso no cadastro de um apartamento com imagens.", async function() {

        try {

          let floor = (ApartmentsTools.getMinMaxFloor().max + 1).toString()
          let number = (ApartmentsTools.getMinMaxNumber().max + 1).toString()

          let apartment = {
            floor,
            number,
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
            accepts_animals: '0',
            daily_price: '800'
          }

          let apartmentJSON = JSON.stringify(apartment)

          let imagens = ['dining-room.jpg', 'living-room.jpg']

          let requestCreate = request.post(endpoints.toCreate)

          requestCreate
            .set('Authorization', accounts.admin.token)
            .field('apartment', apartmentJSON, { contentType: 'application/json' })

          for (let image of imagens) {
            let src = await genPath(image)
            requestCreate.attach('iptImages', src)
          }

          let responseCreate = await requestCreate

          expect(responseCreate.statusCode).toEqual(201)

          idRegisteredApartmentsWithPictures.push(extractApartmentID(responseCreate.body._links[0].href))

        } catch (error) {
          fail(error)
        }

      })

      test("/POST - Deve retornar 201, para sucesso no cadastro de um apartamento com imagens.", async function() {

        try {

          let floor = (ApartmentsTools.getMinMaxFloor().max + 1).toString()
          let number = (ApartmentsTools.getMinMaxNumber().max + 1).toString()

          let apartment = {
            floor,
            number,
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
            accepts_animals: '0',
            daily_price: '800'
          }

          let apartmentJSON = JSON.stringify(apartment)

          let imagens = ['bathroom.jpg', 'bedroom.jpg', 'kitchen.jpg']

          let requestCreate = request.post(endpoints.toCreate)

          requestCreate
            .set('Authorization', accounts.admin.token)
            .field('apartment', apartmentJSON, { contentType: 'application/json' })

          for (let image of imagens) {
            let src = await genPath(image)
            requestCreate.attach('iptImages', src)
          }

          let responseCreate = await requestCreate

          expect(responseCreate.statusCode).toEqual(201)

          idRegisteredApartmentsWithPictures.push(extractApartmentID(responseCreate.body._links[0].href))

        } catch (error) {
          fail(error)
        }

      })

      test("/POST - Deve retornar 201, para sucesso no cadastro de um apartamento onde o nome de uma das imagens contém caracter &.", async function() {

        try {

          let floor = (ApartmentsTools.getMinMaxFloor().max + 1).toString()
          let number = (ApartmentsTools.getMinMaxNumber().max + 1).toString()

          let apartment = {
            floor,
            number,
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
            accepts_animals: '0',
            daily_price: '800'
          }

          let apartmentJSON = JSON.stringify(apartment)

          let images = ['back&yard.jpg', 'kitchen.jpg']

          let requestCreate = request.post(endpoints.toCreate)

          requestCreate
            .set('Authorization', accounts.admin.token)
            .field('apartment', apartmentJSON, { contentType: 'application/json' })

          for (let image of images) {
            let src = await genPath(image)
            requestCreate.attach('iptImages', src)
          }

          let responseCreate = await requestCreate

          expect(responseCreate.statusCode).toEqual(201)

          const picturesArray = await ApartmentsTools.getPictures(number)

          expect(picturesArray).toEqual(
            expect.arrayContaining(images)
          )

          idRegisteredApartmentsWithPictures.push(extractApartmentID(responseCreate.body._links[0].href))

        } catch (errorCreate) {
          fail(errorCreate)
        }

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

        let number = (ApartmentsTools.getMinMaxNumber().max + 1).toString()

        let apartment = {
          floor: "",
          number,
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
          accepts_animals: '0',
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

        let number = (ApartmentsTools.getMinMaxNumber().max + 1).toString()

        let apartment = {
          floor: "occuped",
          number,
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
          accepts_animals: '0',
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

        let number = (ApartmentsTools.getMinMaxNumber().max + 1).toString()

        let apartment = {
          floor: "88",
          number,
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
          accepts_animals: '0',
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
          accepts_animals: '0',
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
          accepts_animals: '0',
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
          accepts_animals: '0',
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

        let number = (ApartmentsTools.getMinMaxNumber().max + 1).toString()

        const apartment = {
          floor: "3",
          number,
          rooms: [],
          accepts_animals: '0',
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

        let number = (ApartmentsTools.getMinMaxNumber().max + 1).toString()

        let apartment = {
          floor: "3",
          number,
          rooms: [
            {
              room: '',
              quantity: '1'
            }
          ],
          accepts_animals: '0',
          daily_price: '200'
        }

        return request.post(endpoints.toCreate).send(apartment).set('Authorization', accounts.admin.token)
          .then(function(responseCreate) {

            expect(responseCreate.statusCode).toEqual(400)

            expect(responseCreate.body.RestException.Code).toBe("2")
            expect(responseCreate.body.RestException.Message).toBe('Um dos campos dos cômodos informados não possui valor')
            expect(responseCreate.body.RestException.Status).toBe("400")
            expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptRooms')
            expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe('Um dos campos dos cômodos informados não possui valor')

          })
          .catch(function(errorCreate) {
            fail(errorCreate)
          })

      })

      test("/POST - Deve retornar 400, pela presença de campos inválidos nos cômodos do apartamento.", function() {

        let number = (ApartmentsTools.getMinMaxNumber().max + 1).toString()

        let apartment = {
          floor: "3",
          number,
          rooms: [
            {
              // Não é 'rooms' e sim 'room'
              rooms: 'sala de estar',
              quantity: '1'
            }
          ],
          accepts_animals: '0',
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

        let number = (ApartmentsTools.getMinMaxNumber().max + 1).toString()

        let apartment = {
          floor: "3",
          number,
          rooms: [
            {
              room: 'sala de estar*',
              quantity: '1'
            }
          ],
          accepts_animals: '0',
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

        let number = (ApartmentsTools.getMinMaxNumber().max + 1).toString()

        let apartment = {
          floor: "3",
          number,
          rooms: [
            {
              quantity: '1'
            }
          ],
          accepts_animals: '0',
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

      test("/POST - Deve retornar 400, devido a presença de caracteres inválidos na quantidade de um determinado cômodo.", function() {

        let number = (ApartmentsTools.getMinMaxNumber().max + 1).toString()

        let apartment = {
          floor: "3",
          number,
          rooms: [
            {
              room: 'sala de estar',
              quantity: 'um'
            }
          ],
          accepts_animals: '0',
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

        let number = (ApartmentsTools.getMinMaxNumber().max + 1).toString()

        let apartment = {
          floor: "3",
          number,
          rooms: [
            {
              room: 'cozinha',
              quantity: '-1'
            }
          ],
          accepts_animals: '0',
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

      test("/POST - Deve retornar 400, devido a presença de ponto na quantidade cômodo.", function() {

        let number = (ApartmentsTools.getMinMaxNumber().max + 1).toString()

        let apartment = {
          floor: "3",
          number,
          rooms: [
            {
              room: 'cozinha',
              quantity: '1.2'
            }
          ],
          accepts_animals: '0',
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

      test("/POST - Deve retornar 400, devido a presença de ponto na quantidade cômodo.", function() {

        let number = (ApartmentsTools.getMinMaxNumber().max + 1).toString()

        let apartment = {
          floor: "3",
          number,
          rooms: [
            {
              room: 'cozinha',
              quantity: '1,2'
            }
          ],
          accepts_animals: '0',
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

        let number = (ApartmentsTools.getMinMaxNumber().max + 1).toString()

        let apartment = {
          floor: "3",
          number,
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
          accepts_animals: '0',
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

        let number = (ApartmentsTools.getMinMaxNumber().max + 1).toString()

        let apartment = {
          floor: "3",
          number,
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
          accepts_animals: '0',
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

        let number = (ApartmentsTools.getMinMaxNumber().max + 1).toString()

        let apartment = {
          floor: "3",
          number,
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
          accepts_animals: '0',
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

        let number = (ApartmentsTools.getMinMaxNumber().max + 1).toString()

        let apartment = {
          floor: "3",
          number,
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
          accepts_animals: '0',
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

        let number = (ApartmentsTools.getMinMaxNumber().max + 1).toString()

        let apartment = {
          floor: "3",
          number,
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
          accepts_animals: '0',
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

      // Validação das imagens.
      test("/POST - Deve retornar 400, a imagem enviada é inválida (extensão inválida).", async function() {

        try {

          let number = (ApartmentsTools.getMinMaxNumber().max + 1).toString()

          let apartment = {
            floor: "3",
            number,
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
            daily_price: '800'
          }

          let apartmentJSON = JSON.stringify(apartment)

          let imagens = ['imgFail.txt']

          let requestCreate = request.post(endpoints.toCreate)

          requestCreate
            .set('Authorization', accounts.admin.token)
            .field('apartment', apartmentJSON, { contentType: 'application/json' })

          for (let image of imagens) {
            let src = await genPath(image)
            requestCreate.attach('iptImages', src)
          }

          let responseCreate = await requestCreate

          expect(responseCreate.statusCode).toEqual(400)

          expect(responseCreate.body.RestException.Code).toBe("2")
          expect(responseCreate.body.RestException.Message).toBe("A extensão das imagens é inválida")
          expect(responseCreate.body.RestException.Status).toBe("400")
          expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
          expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptImages')
          expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe("A extensão das imagens é inválida")

        } catch (error) {
          fail(error)
        }

      })

      test("/POST - Deve retornar 400, uma das imagens enviadas é inválida (extensão inválida).", async function() {

        try {

          let number = (ApartmentsTools.getMinMaxNumber().max + 1).toString()

          let apartment = {
            floor: "3",
            number,
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
            daily_price: '800'
          }

          let apartmentJSON = JSON.stringify(apartment)

          let imagens = ['living-room.jpg', 'imgFail.txt']

          let requestCreate = request.post(endpoints.toCreate)

          requestCreate
            .set('Authorization', accounts.admin.token)
            .field('apartment', apartmentJSON, { contentType: 'application/json' })

          for (let image of imagens) {
            let src = await genPath(image)
            requestCreate.attach('iptImages', src)
          }

          let responseCreate = await requestCreate

          expect(responseCreate.statusCode).toEqual(400)

          expect(responseCreate.body.RestException.Code).toBe("2")
          expect(responseCreate.body.RestException.Message).toBe("A extensão das imagens é inválida")
          expect(responseCreate.body.RestException.Status).toBe("400")
          expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
          expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('iptImages')
          expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe("A extensão das imagens é inválida")

        } catch (error) {
          fail(error)
        }

      })

      // Validação da aceitação de animais.
      test("/POST - Deve retornar 400, não foi informado se o Apartamento pode ou não receber animais.", async function() {

        try {

          let floor = (ApartmentsTools.getMinMaxFloor().max + 1).toString()
          let number = (ApartmentsTools.getMinMaxNumber().max + 1).toString()

          let apartment = {
            floor,
            number,
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
            daily_price: '750',
            accepts_animals: ''
          }

          let apartmentJSON = JSON.stringify(apartment)

          let imagens = ['living-room.jpg', 'bedroom.jpg']

          let requestCreate = request.post(endpoints.toCreate)

          requestCreate
            .set('Authorization', accounts.admin.token)
            .field('apartment', apartmentJSON, { contentType: 'application/json' })

          for (let image of imagens) {
            let src = await genPath(image)
            requestCreate.attach('iptImages', src)
          }

          let responseCreate = await requestCreate

          expect(responseCreate.statusCode).toEqual(400)

          expect(responseCreate.body.RestException.Code).toBe("1")
          expect(responseCreate.body.RestException.Message).toBe("O valor para Aceitação de Animais é obrigatório")
          expect(responseCreate.body.RestException.Status).toBe("400")
          expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
          expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('ckbAcceptsAnimals')
          expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe("O valor para Aceitação de Animais é obrigatório")

        } catch (error) {
          fail(error)
        }

      })

      test("/POST - Deve retornar 400, foi informado um valor inválido se o Apartamento pode ou não receber animais.", async function() {

        try {

          let floor = (ApartmentsTools.getMinMaxFloor().max + 1).toString()
          let number = (ApartmentsTools.getMinMaxNumber().max + 1).toString()

          let apartment = {
            floor,
            number,
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
            daily_price: '750',
            accepts_animals: 'asdf'
          }

          let apartmentJSON = JSON.stringify(apartment)

          let imagens = ['living-room.jpg', 'bedroom.jpg']

          let requestCreate = request.post(endpoints.toCreate)

          requestCreate
            .set('Authorization', accounts.admin.token)
            .field('apartment', apartmentJSON, { contentType: 'application/json' })

          for (let image of imagens) {
            let src = await genPath(image)
            requestCreate.attach('iptImages', src)
          }

          let responseCreate = await requestCreate

          expect(responseCreate.statusCode).toEqual(400)

          expect(responseCreate.body.RestException.Code).toBe("2")
          expect(responseCreate.body.RestException.Message).toBe("O valor para Aceitação de Animais é inválido")
          expect(responseCreate.body.RestException.Status).toBe("400")
          expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
          expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('ckbAcceptsAnimals')
          expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe("O valor para Aceitação de Animais é inválido")

        } catch (error) {
          fail(error)
        }

      })

      test("/POST - Deve retornar 400, foi informado um valor diferente de 0 (false) ou 1 (true) no campo de aceitação de animais.", async function() {

        try {

          let floor = (ApartmentsTools.getMinMaxFloor().max + 1).toString()
          let number = (ApartmentsTools.getMinMaxNumber().max + 1).toString()

          let apartment = {
            floor,
            number,
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
            daily_price: '750',
            accepts_animals: '2'
          }

          let apartmentJSON = JSON.stringify(apartment)

          let imagens = ['living-room.jpg', 'bedroom.jpg']

          let requestCreate = request.post(endpoints.toCreate)

          requestCreate
            .set('Authorization', accounts.admin.token)
            .field('apartment', apartmentJSON, { contentType: 'application/json' })

          for (let image of imagens) {
            let src = await genPath(image)
            requestCreate.attach('iptImages', src)
          }

          let responseCreate = await requestCreate

          expect(responseCreate.statusCode).toEqual(400)

          expect(responseCreate.body.RestException.Code).toBe("2")
          expect(responseCreate.body.RestException.Message).toBe("O valor para Aceitação de Animais é diferente de 0 ou 1")
          expect(responseCreate.body.RestException.Status).toBe("400")
          expect(responseCreate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
          expect(responseCreate.body.RestException.ErrorFields[0].field).toBe('ckbAcceptsAnimals')
          expect(responseCreate.body.RestException.ErrorFields[0].hasError.error).toBe("O valor para Aceitação de Animais é diferente de 0 ou 1")

        } catch (error) {
          fail(error)
        }

      })

    })

  })

  describe("READ", function() {

    describe("Testes de SUCESSO.", function() {

      /* ################## CLIENTE ################## */
      
      /* ### Leitura de um único apto. ### */

      test("/GET - Deve retornar 200, para leitura de um apto LIVRE pelo usuário, utilizando o ID do apto.", async function() {

        try {

          let apartment = {
            id: idRegisteredApartmentsWithPictures[0]
          }

          let responseRead = await request.get(`${ endpoints.toRead }/${ apartment.id }`)

          expect(responseRead.statusCode).toEqual(200)

          const {
            pictures,
            _links
          } = responseRead.body

          let apartmentJSON = ApartmentsTools.getApartmentByID(apartment.id)
          let picturesCount = apartmentJSON.pictures.length

          expect(pictures).toHaveLength(picturesCount)

          expect(responseRead.body).toMatchObject({
            id: apartment.id,
            floor: apartmentJSON.floor,
            number: apartmentJSON.number,
            daily_price: apartmentJSON.daily_price,
          })

          expect(responseRead.body.reserve).toBeUndefined()
          expect(responseRead.body.created).toBeUndefined()
          expect(responseRead.body.updated).toBeUndefined()

          expect(_links).toBeDefined()
          expect(_links).toHaveLength(4)

          const HATEOAS = Generator.genHATEOAS(apartment.id, 'apartment', 'apartments', true)

          for (let cont = 0; cont < _links.length; cont++) {
            expect(_links[cont]).toMatchObject(HATEOAS[cont])
          }

        } catch (errorRead) {
          fail(errorRead)
        }

      })

      test("/GET - Deve retornar 200, para leitura de um apto do cliente.", async function() {

        try {

          let apartment = { id: idRegisteredApartmentsWithPictures[0] }
          let start = dateNow.getDate()
          let end = getDateWithNextMonth(start)

          let reserve = {
            apartment_id: apartment.id,
            start,
            end,
          }

          let responseCreate = await request.post('/reserves').send(reserve).set('Authorization', accounts.cliente.token)

          expect(responseCreate.statusCode).toEqual(201)

          let responseRead = await request.get(`${ endpoints.toRead }/${ apartment.id }`).set('Authorization', accounts.cliente.token)

          expect(responseRead.statusCode).toEqual(200)

          const {
            pictures,
            _links
          } = responseRead.body

          let apartmentJSON = ApartmentsTools.getApartmentByID(apartment.id)
          let picturesCount = apartmentJSON.pictures.length

          expect(pictures).toHaveLength(picturesCount)

          expect(responseRead.body).toMatchObject({
            id: apartment.id,
            floor: apartmentJSON.floor,
            number: apartmentJSON.number,
            daily_price: apartmentJSON.daily_price,
          })

          expect(responseRead.body.reserve).toBeUndefined()
          expect(responseRead.body.created).toBeUndefined()
          expect(responseRead.body.updated).toBeUndefined()

          expect(_links).toBeDefined()
          expect(_links).toHaveLength(4)

          const HATEOAS = Generator.genHATEOAS(apartment.id, 'apartment', 'apartments', true)

          for (let cont = 0; cont < _links.length; cont++) {
            expect(_links[cont]).toMatchObject(HATEOAS[cont])
          }

        } catch (errorRead) {
          fail(errorRead)
        }

      })

      /* ### Listagem de aptos LIVRES. ### */

      test("/GET - Deve retornar 200 e uma lista de aptos LIVRES para um usuário não logado.", async function() {

        try {

          let responseList = await request.get(endpoints.toList)

          expect(responseList.statusCode).toEqual(200)

          expect(responseList.body).toHaveProperty('apartments')
          expect(responseList.body).toHaveProperty('hasNext')

          let apartmentList = ApartmentsTools.getApartments()

          expect(responseList.body.hasNext).toBe(apartmentList.hasNext)

          // As imagens com pictures são armazenadas por último, e o limite da listagem é 20.
          for (let apartment of responseList.body.apartments) {

            if (idRegisteredApartmentsWithPictures.includes(apartment.id)) {

              let apartmentJSON = ApartmentsTools.getApartmentByID(apartment.id)

              let picturesCount = apartmentJSON.pictures.length
              expect(apartment.pictures).toHaveLength(picturesCount)

              expect(apartment.reserve).toBeUndefined()
              expect(apartment.created).toBeUndefined()
              expect(apartment.updated).toBeUndefined()

            } else {
              expect(apartment.pictures).toHaveLength(0)
            }

            expect(apartment._links).toBeDefined()
            expect(apartment._links).toHaveLength(3)

            const HATEOAS = Generator.genHATEOAS(apartment.id, 'apartment', 'apartments', false)

            for (let cont = 0; cont < apartment._links.length; cont++) {
              expect(apartment._links[cont]).toMatchObject(HATEOAS[cont])
            }

          }

        } catch (errorList) {
          fail(errorList)
        }

      })

      test("/GET - Deve retornar 200 e uma lista de aptos com até 4 cômodos.", async function() {

        try {

          const queryStringOBJ = {
            rooms: 4
          }

          const url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

          let responseList = await request.get(url)

          expect(responseList.statusCode).toEqual(200)

          expect(responseList.body).toHaveProperty('apartments')
          expect(responseList.body).toHaveProperty('hasNext')

          let apartmentList = ApartmentsTools.getApartments(queryStringOBJ)

          expect(responseList.body.apartments.length).toBe(apartmentList.apartments.length)
          expect(responseList.body.hasNext).toBe(apartmentList.hasNext)

          // As imagens com pictures são armazenadas por último, e o limite da listagem é 20.
          for (let apartment of responseList.body.apartments) {

            if (idRegisteredApartmentsWithPictures.includes(apartment.id)) {

              let apartmentJSON = ApartmentsTools.getApartmentByID(apartment.id)

              let picturesCount = apartmentJSON.pictures.length
              expect(apartment.pictures).toHaveLength(picturesCount)

              let roomsAmount = 0

              for (let room of apartment.rooms) {
                roomsAmount += parseInt(room.quantity)
              }

              expect(roomsAmount).toEqual(queryStringOBJ.rooms)

              expect(apartment.reserve).toBeUndefined()
              expect(apartment.created).toBeUndefined()
              expect(apartment.updated).toBeUndefined()

            } else {
              expect(apartment.pictures).toHaveLength(0)
            }

            expect(apartment._links).toBeDefined()
            expect(apartment._links).toHaveLength(3)

          }

        } catch (errorList) {
          fail(errorList)
        }

      })

      test("/GET - Deve retornar 200 e uma lista de aptos com valor mínimo R$300.", async function() {

        try {

          const queryStringOBJ = {
            lowest_daily_price: 300
          }

          const url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

          let responseList = await request.get(url)

          expect(responseList.statusCode).toEqual(200)

          expect(responseList.body).toHaveProperty('apartments')
          expect(responseList.body).toHaveProperty('hasNext')

          let apartmentList = ApartmentsTools.getApartments(queryStringOBJ)

          expect(responseList.body.apartments.length).toEqual(apartmentList.apartments.length)
          expect(responseList.body.hasNext).toBe(apartmentList.hasNext)

          // As imagens com pictures são armazenadas por último, e o limite da listagem é 20.
          for (let apartment of responseList.body.apartments) {

            if (idRegisteredApartmentsWithPictures.includes(apartment.id)) {

              let apartmentJSON = ApartmentsTools.getApartmentByID(apartment.id)

              let picturesCount = apartmentJSON.pictures.length
              expect(apartment.pictures).toHaveLength(picturesCount)

              expect(apartment.reserve).toBeUndefined()
              expect(apartment.created).toBeUndefined()
              expect(apartment.updated).toBeUndefined()

            } else {
              expect(apartment.pictures).toHaveLength(0)
            }

            expect(apartment._links).toBeDefined()
            expect(apartment._links).toHaveLength(3)

          }

        } catch (errorList) {
          fail(errorList)
        }

      })

      test("/GET - Deve retornar 200 e uma lista de aptos com valor máximo R$300.", async function() {

        try {

          const queryStringOBJ = {
            highest_daily_price: 300
          }

          const url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

          let responseList = await request.get(url)

          expect(responseList.statusCode).toEqual(200)

          expect(responseList.body).toHaveProperty('apartments')
          expect(responseList.body).toHaveProperty('hasNext')

          let apartmentList = ApartmentsTools.getApartments(queryStringOBJ)

          expect(responseList.body.apartments.length).toEqual(apartmentList.apartments.length)
          expect(responseList.body.hasNext).toBe(apartmentList.hasNext)

          // As imagens com pictures são armazenadas por último, e o limite da listagem é 20.
          for (let apartment of responseList.body.apartments) {

            if (idRegisteredApartmentsWithPictures.includes(apartment.id)) {

              let apartmentJSON = ApartmentsTools.getApartmentByID(apartment.id)

              let picturesCount = apartmentJSON.pictures.length
              expect(apartment.pictures).toHaveLength(picturesCount)

              expect(apartment.reserve).toBeUndefined()
              expect(apartment.created).toBeUndefined()
              expect(apartment.updated).toBeUndefined()

            } else {
              expect(apartment.pictures).toHaveLength(0)
            }

            expect(apartment._links).toBeDefined()
            expect(apartment._links).toHaveLength(3)

          }

        } catch (errorList) {
          fail(errorList)
        }

      })

      test("/GET - Deve retornar 200 e uma lista de aptos que aceitam animais.", async function() {

        try {

          const queryStringOBJ = {
            accepts_animals: 1
          }

          const url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

          let responseList = await request.get(url)

          expect(responseList.statusCode).toEqual(200)

          expect(responseList.body).toHaveProperty('apartments')
          expect(responseList.body).toHaveProperty('hasNext')

          let apartmentList = ApartmentsTools.getApartments(queryStringOBJ)

          expect(responseList.body.apartments.length).toEqual(apartmentList.apartments.length)
          expect(responseList.body.hasNext).toBe(apartmentList.hasNext)

          // As imagens com pictures são armazenadas por último, e o limite da listagem é 20.
          for (let apartment of responseList.body.apartments) {

            if (idRegisteredApartmentsWithPictures.includes(apartment.id)) {

              let apartmentJSON = ApartmentsTools.getApartmentByID(apartment.id)

              let picturesCount = apartmentJSON.pictures.length
              expect(apartment.pictures).toHaveLength(picturesCount)

              expect(apartment.reserve).toBeUndefined()
              expect(apartment.created).toBeUndefined()
              expect(apartment.updated).toBeUndefined()

            } else {
              expect(apartment.pictures).toHaveLength(0)
            }

            expect(apartment._links).toBeDefined()
            expect(apartment._links).toHaveLength(3)

          }

        } catch (errorList) {
          fail(errorList)
        }

      })

      test("/GET - Deve retornar 200 e uma lista de aptos que NÃO aceitam animais.", async function() {

        try {

          const queryStringOBJ = {
            accepts_animals: 0
          }

          const url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

          let responseList = await request.get(url)

          expect(responseList.statusCode).toEqual(200)

          expect(responseList.body).toHaveProperty('apartments')
          expect(responseList.body).toHaveProperty('hasNext')

          let apartmentList = ApartmentsTools.getApartments(queryStringOBJ)

          expect(responseList.body.apartments.length).toEqual(apartmentList.apartments.length)
          expect(responseList.body.hasNext).toBe(apartmentList.hasNext)

          // As imagens com pictures são armazenadas por último, e o limite da listagem é 20.
          for (let apartment of responseList.body.apartments) {

            if (idRegisteredApartmentsWithPictures.includes(apartment.id)) {

              let apartmentJSON = ApartmentsTools.getApartmentByID(apartment.id)

              let picturesCount = apartmentJSON.pictures.length
              expect(apartment.pictures).toHaveLength(picturesCount)

              expect(apartment.reserve).toBeUndefined()
              expect(apartment.created).toBeUndefined()
              expect(apartment.updated).toBeUndefined()

            } else {
              expect(apartment.pictures).toHaveLength(0)
            }

            expect(apartment._links).toBeDefined()
            expect(apartment._links).toHaveLength(3)

          }

        } catch (errorList) {
          fail(errorList)
        }

      })

      test("/GET - Deve retornar 200 e uma lista de aptos que aceitam animais com offset e limit.", async function() {

        try {

          const queryStringOBJ = {
            accepts_animals: 1,
            offset: 2,
            limit: 3
          }

          const url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

          let responseList = await request.get(url)

          expect(responseList.statusCode).toEqual(200)

          expect(responseList.body).toHaveProperty('apartments')
          expect(responseList.body.apartments).toHaveLength(queryStringOBJ.limit)
          expect(responseList.body).toHaveProperty('hasNext')

          let apartmentList = ApartmentsTools.getApartments(queryStringOBJ)

          expect(responseList.body.apartments).toHaveLength(apartmentList.apartments.length)
          expect(responseList.body.hasNext).toBe(apartmentList.hasNext)

          // As imagens com pictures são armazenadas por último, e o limite da listagem é 20.
          for (let apartment of responseList.body.apartments) {

            if (idRegisteredApartmentsWithPictures.includes(apartment.id)) {

              let apartmentJSON = ApartmentsTools.getApartmentByID(apartment.id)

              let picturesCount = apartmentJSON.pictures.length
              expect(apartment.pictures).toHaveLength(picturesCount)

              expect(apartment.reserve).toBeUndefined()
              expect(apartment.created).toBeUndefined()
              expect(apartment.updated).toBeUndefined()

            } else {
              expect(apartment.pictures).toHaveLength(0)
            }

            expect(apartment._links).toBeDefined()
            expect(apartment._links).toHaveLength(3)

          }

        } catch (errorList) {
          fail(errorList)
        }

      })

      test("/GET - Deve retornar 200 e uma lista de aptos que aceitam animais com offset e limit ordenado pelo MENOR PREÇO.", async function() {

        try {

          const queryStringOBJ = {
            accepts_animals: 1,
            offset: 2,
            limit: 3,
            sort: 'daily_price:asc'
          }

          const url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

          let responseList = await request.get(url)

          expect(responseList.statusCode).toEqual(200)

          expect(responseList.body).toHaveProperty('apartments')
          expect(responseList.body.apartments).toHaveLength(queryStringOBJ.limit)
          expect(responseList.body).toHaveProperty('hasNext')

          let apartmentList = ApartmentsTools.getApartments(queryStringOBJ)

          expect(responseList.body.apartments).toHaveLength(apartmentList.apartments.length)
          expect(responseList.body.hasNext).toBe(apartmentList.hasNext)

          for (let apartment of responseList.body.apartments) {

            let { _links } = apartment

            let HATEOAS = Generator.genHATEOAS(apartment.id, 'apartment', 'apartments', false)

            for (let cont = 0; cont < _links.length; cont++) {
              expect(_links[cont]).toMatchObject(HATEOAS[cont])
            }

          }

        } catch (errorList) {
          fail(errorList)
        }

      })

      test("/GET - Deve retornar 200 e uma lista de aptos que aceitam animais com offset e limit ordenado pelo MAIOR PREÇO.", async function() {

        try {

          const queryStringOBJ = {
            accepts_animals: 1,
            offset: 2,
            limit: 3,
            sort: 'daily_price:desc'
          }

          const url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

          let responseList = await request.get(url)

          expect(responseList.statusCode).toEqual(200)

          expect(responseList.body).toHaveProperty('apartments')
          expect(responseList.body.apartments).toHaveLength(queryStringOBJ.limit)
          expect(responseList.body).toHaveProperty('hasNext')

          let apartmentList = ApartmentsTools.getApartments(queryStringOBJ)

          expect(responseList.body.apartments).toHaveLength(apartmentList.apartments.length)
          expect(responseList.body.hasNext).toBe(apartmentList.hasNext)

          for (let apartment of responseList.body.apartments) {

            let { _links } = apartment

            let HATEOAS = Generator.genHATEOAS(apartment.id, 'apartment', 'apartments', false)

            for (let cont = 0; cont < _links.length; cont++) {
              expect(_links[cont]).toMatchObject(HATEOAS[cont])
            }

          }
          
        } catch (errorList) {
          fail(errorList)
        }

      })

      test("/GET - Deve retornar 200 e uma lista de aptos que aceitam animais com todos os filtros.", async function() {

        try {

          const queryStringOBJ = {
            rooms: 7,
            lowest_daily_price: 450,
            highest_daily_price: 500,
            accepts_animals: 1,
            offset: 1,
            limit: 2,
            sort: 'daily_price:asc',
          }

          const url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

          let responseList = await request.get(url)

          expect(responseList.statusCode).toEqual(200)
          expect(responseList.body).toHaveProperty('apartments')
          expect(responseList.body.apartments).toHaveLength(queryStringOBJ.limit)
          expect(responseList.body).toHaveProperty('hasNext')

          let apartmentList = ApartmentsTools.getApartments(queryStringOBJ)
          expect(responseList.body.apartments).toHaveLength(apartmentList.apartments.length)
          expect(responseList.body.hasNext).toBe(apartmentList.hasNext)

          for (let apartment of responseList.body.apartments) {

            let { _links } = apartment

            let HATEOAS = Generator.genHATEOAS(apartment.id, 'apartment', 'apartments', false)

            for (let cont = 0; cont < _links.length; cont++) {
              expect(_links[cont]).toMatchObject(HATEOAS[cont])
            }

          }
          
        } catch (errorList) {
          fail(errorList)
        }

      })

      test("/GET - Deve retornar 200 e uma lista de aptos pelo cliente, com 0 ou várias fotos.", async function() {

        try {

          let responseList = await request.get(endpoints.toList).set('Authorization', accounts.cliente.token)

          expect(responseList.statusCode).toEqual(200)

          expect(responseList.body).toHaveProperty('apartments')
          expect(responseList.body).toHaveProperty('hasNext')

          let apartmentList = ApartmentsTools.getApartments()

          expect(responseList.body.hasNext).toBe(apartmentList.hasNext)

          // As imagens com pictures são armazenadas por último, e o limite da listagem é 20.
          for (let apartment of responseList.body.apartments) {

            if (idRegisteredApartmentsWithPictures.includes(apartment.id)) {

              let apartmentJSON = ApartmentsTools.getApartmentByID(apartment.id)

              let picturesCount = apartmentJSON.pictures.length
              expect(apartment.pictures).toHaveLength(picturesCount)

              expect(apartment.reserve).toBeUndefined()
              expect(apartment.created).toBeUndefined()
              expect(apartment.updated).toBeUndefined()

            } else {
              expect(apartment.pictures).toHaveLength(0)
            }

            expect(apartment._links).toBeDefined()
            expect(apartment._links).toHaveLength(3)

          }

        } catch (errorList) {
          fail(errorList)
        }

      })

      /* ################## FUNCIONÁRIO++ ################## */

      /* ### Leitura de um único apto. ### */

      test("/GET - Deve retornar 200, para busca de um apartamento pelo seu ID.", async function() {

        try {

          let apartment = {
            id: 'd9d62beecdde62af82efd82c'
          }

          let responseRead = await request.get(`${ endpoints.toRead }/${ apartment.id }`).set('Authorization', accounts.funcionario.token)

          expect(responseRead.statusCode).toEqual(200)

          const {
            rooms,
            reserve,
            created,
            updated,
            _links
          } = responseRead.body

          let apartmentJSON = ApartmentsTools.getApartmentByID(apartment.id)

          expect(responseRead.body).toMatchObject({
            id: apartment.id,
            floor: apartmentJSON.floor,
            number: apartmentJSON.number,
            daily_price: apartmentJSON.daily_price,
          })

          expect(rooms).toBeDefined()
          expect(rooms).toHaveLength(apartmentJSON.rooms.length)

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

          expect(rooms[4]).toBeDefined()
          expect(rooms[4]).toMatchObject({
            room: "pet room",
            quantity: "1"
          })

          expect(reserve).toBeDefined()
          expect(reserve).toMatchObject({
            status: apartmentJSON.reserve.status,
            client_id: apartmentJSON.reserve.client_id,
            start: apartmentJSON.reserve.start,
            end: apartmentJSON.reserve.end,
          })

          expect(created.createdAt).toBe(apartmentJSON.created.createdAt)
          expect(created.createdBy).toMatchObject({
            id: apartmentJSON.created.createdBy.id,
            name: apartmentJSON.created.createdBy.name,
          })

          expect(updated).toMatchObject({
            updatedAt: apartmentJSON.updated.updatedAt,
            updatedBy: {
              id: apartmentJSON.updated.updatedBy.id,
              name: apartmentJSON.updated.updatedBy.name,
            }
          })

          expect(_links).toBeDefined()
          expect(_links).toHaveLength(4)

          const HATEOAS = Generator.genHATEOAS(apartment.id, 'apartment', 'apartments', true)

          for (let cont = 0; cont < responseRead.body._links.length; cont++) {
            expect(responseRead.body._links[cont]).toMatchObject(HATEOAS[cont])
          }

        } catch (errorList) {
          fail(errorList)
        }

      })

      test("/GET - Deve retornar 200, para busca de um apartamento e suas imagens.", async function() {

        try {

          let apartment = {
            id: idRegisteredApartmentsWithPictures[0]
          }

          let responseCreate = await request.get(`${endpoints.toRead}/${ apartment.id }`).set('Authorization', accounts.funcionario.token)

          expect(responseCreate.statusCode).toEqual(200)

          const {
            number,
            rooms,
            pictures,
            reserve,
            _links,
            created,
            updated
          } = responseCreate.body

          let picturesArray = await ApartmentsTools.getPictures(number)
          let apartmentJSON = await ApartmentsTools.getApartmentByID(apartment.id)

          expect(responseCreate.body).toMatchObject({
            id: apartment.id,
            floor: apartmentJSON.floor,
            number: apartmentJSON.number,
            daily_price: apartmentJSON.daily_price,
          })

          expect(pictures).toHaveLength(picturesArray.length)

          expect(reserve).toBeDefined()
          expect(reserve).toMatchObject({
            status: apartmentJSON.reserve.status,
            client_id: apartmentJSON.reserve.client_id,
            start: apartmentJSON.reserve.start,
            end: apartmentJSON.reserve.end,
          })

          expect(created.createdAt).toBe(apartmentJSON.created.createdAt)
          expect(created.createdBy).toMatchObject({
            id: apartmentJSON.created.createdBy.id,
            name: apartmentJSON.created.createdBy.name,
          })

          expect(updated).toMatchObject({
            updatedAt: apartmentJSON.updated.updatedAt,
            updatedBy: {
              id: apartmentJSON.updated.updatedBy.id,
              name: apartmentJSON.updated.updatedBy.name,
            }
          })

          expect(_links).toBeDefined()
          expect(_links).toHaveLength(4)

          const HATEOAS = Generator.genHATEOAS(apartment.id, 'apartment', 'apartments', true)

          for (let cont = 0; cont < responseCreate.body._links.length; cont++) {
            expect(responseCreate.body._links[cont]).toMatchObject(HATEOAS[cont])
          }

        } catch (error) {
          fail(error)
        }

      })

      /* ### Listagem de aptos ### */

      test("/GET - Deve retornar 200 e uma lista de apartamentos, com 0 ou várias fotos.", function() {

        return request.get(endpoints.toList).set('Authorization', accounts.funcionario.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(200)

            expect(responseList.body).toHaveProperty('apartments')
            expect(responseList.body).toHaveProperty('hasNext')

            let apartmentList = ApartmentsTools.getApartments(undefined, true)

            expect(responseList.body.hasNext).toBe(apartmentList.hasNext)

            // As imagens com pictures são armazenadas por último, e o limite da listagem é 20.
            for (let apartment of responseList.body.apartments) {

              if (idRegisteredApartmentsWithPictures.includes(apartment.id)) {

                const { created, updated } = apartment

                let apartmentJSON = ApartmentsTools.getApartmentByID(apartment.id)
                let picturesCount = apartmentJSON.pictures.length

                expect(apartment.pictures).toHaveLength(picturesCount)

                expect(created.createdAt).toBe(apartmentJSON.created.createdAt)
                expect(created.createdBy).toMatchObject({
                  id: apartmentJSON.created.createdBy.id,
                  name: apartmentJSON.created.createdBy.name,
                })

                expect(updated).toMatchObject({
                  updatedAt: apartmentJSON.updated.updatedAt,
                  updatedBy: {
                    id: apartmentJSON.updated.updatedBy.id,
                    name: apartmentJSON.updated.updatedBy.name,
                  }
                })

              } else {
                expect(apartment.pictures).toHaveLength(0)
              }

              expect(apartment._links).toBeDefined()
              expect(apartment._links).toHaveLength(3)

            }

          })
          .catch(function(errorList) {
            fail(errorList)
          })

      })

      test("/GET - Deve retornar 200 e uma lista de apartamentos, contendo limite de usuários.", function() {

        let queryStringOBJ = {
          offset: 1,
          limit: 3
        }

        let url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

        return request.get(url).set('Authorization', accounts.funcionario.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(200)
            expect(responseList.body.apartments.length).toEqual(3)

            expect(responseList.body).toHaveProperty('apartments')
            expect(responseList.body).toHaveProperty('hasNext')

            let apartmentList = ApartmentsTools.getApartments(queryStringOBJ, true)

            expect(responseList.body.hasNext).toBe(apartmentList.hasNext)

            // As imagens com pictures são armazenadas por último, e o limite da listagem é 20.
            for (let apartment of responseList.body.apartments) {
              if (idRegisteredApartmentsWithPictures.includes(apartment.id)) {

                const { created, updated } = apartment

                let picturesCount = ApartmentsTools.getApartmentByID(apartment.id).pictures.length
                expect(apartment.pictures).toHaveLength(picturesCount)

                expect(created.createdAt).toBe(apartmentJSON.created.createdAt)
                expect(created.createdBy).toMatchObject({
                  id: apartmentJSON.created.createdBy.id,
                  name: apartmentJSON.created.createdBy.name,
                })

                expect(updated).toMatchObject({
                  updatedAt: apartmentJSON.updated.updatedAt,
                  updatedBy: {
                    id: apartmentJSON.updated.updatedBy.id,
                    name: apartmentJSON.updated.updatedBy.name,
                  }
                })
                
              } else {
                expect(apartment.pictures).toHaveLength(0)
              }

              expect(apartment._links).toBeDefined()
              expect(apartment._links).toHaveLength(3)
            }

          })
          .catch(function(errorList) {
            fail(errorList)
          })

      })

      test("/GET - Deve retornar 200 e uma lista de aptos ocupados para o Funcionário.", async function() {

        try {

          const queryStringOBJ = {
            status: 'ocupado'
          }

          const url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

          let responseList = await request.get(url).set('Authorization', accounts.funcionario.token)

          expect(responseList.statusCode).toEqual(200)

          expect(responseList.body).toHaveProperty('apartments')
          expect(responseList.body).toHaveProperty('hasNext')

          let apartmentList = ApartmentsTools.getApartments(queryStringOBJ, true)
          expect(responseList.body.apartments.length).toEqual(apartmentList.apartments.length)
          expect(responseList.body.hasNext).toBe(apartmentList.hasNext)

          for (let apartment of responseList.body.apartments) {

            if (idRegisteredApartmentsWithPictures.includes(apartment.id)) {

              let apartmentJSON = ApartmentsTools.getApartmentByID(apartment.id)

              let picturesCount = apartmentJSON.pictures.length
              expect(apartment.pictures).toHaveLength(picturesCount)

              expect(apartment.reserve).toBeUndefined()
              expect(apartment.reserve.status).toBe('ocupado')
              
              expect(apartment.created).toBeUndefined()
              expect(apartment.updated).toBeUndefined()

            } else {
              expect(apartment.pictures).toHaveLength(0)
            }

            expect(apartment._links).toBeDefined()
            expect(apartment._links).toHaveLength(3)

          }

        } catch (errorList) {
          fail(errorList)
        }

      })

    })

    describe("Testes de FALHA.", function() {

      test("/GET - Deve retornar 403, o Cliente não está AUTENTICADO.", function() {

        let apartment = { id: 'd9d62beecdde62af82efd82c' }
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

      /* ### Leituras individuais de apartamentos ### */

      test("/GET - Deve retornar 400, já que o ID do apartamento contém caracteres inválidos.", function() {

        return request.get(`${ endpoints.toRead }/856377c88f8fd9fc65fd3ef*`).set('Authorization', accounts.funcionario.token)
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

      test("/GET - Deve retornar 404, já que o ID não pertence a um apartamento cadastrado.", function() {

        return request.get(`${ endpoints.toRead }/d9d62beecdde62af82efd82d`).set('Authorization', accounts.funcionario.token)
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

      /* ### Listagem de apartamentos ### */

      test("/GET - Deve retornar 400, um dos parâmetros da query string é inválido.", function() {

        let url = endpoints.toList + '?offst=1&limit=3'

        return request.get(url).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe('2')
            expect(responseList.body.RestException.Message).toBe('O parâmetro \'offst\' é inválido')
            expect(responseList.body.RestException.Status).toBe('400')
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      test("/GET - Deve retornar 400, o usuário (não logado) não pode usar o parâmetro status.", function() {

        let url = endpoints.toList + '?status='

        return request.get(url)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe('2')
            expect(responseList.body.RestException.Message).toBe('O parâmetro \'status\' é inválido')
            expect(responseList.body.RestException.Status).toBe('400')
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      test("/GET - Deve retornar 400, o cliente (logado) não pode usar o parâmetro status.", function() {

        let url = endpoints.toList + '?status='

        return request.get(url).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe('2')
            expect(responseList.body.RestException.Message).toBe('O parâmetro \'status\' é inválido')
            expect(responseList.body.RestException.Status).toBe('400')
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      test("/GET - Deve retornar 400, o parâmetro Status foi declarado, mas não possui valor.", function() {

        let url = endpoints.toList + '?status='

        return request.get(url).set('Authorization', accounts.funcionario.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe('1')
            expect(responseList.body.RestException.Message).toBe('O valor do parâmetro Status não foi informado')
            expect(responseList.body.RestException.Status).toBe('400')
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      test("/GET - Deve retornar 400, o valor de Status é inválido.", function() {

        let url = endpoints.toList + '?status=livres'

        return request.get(url).set('Authorization', accounts.gerente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe('2')
            expect(responseList.body.RestException.Message).toBe('O valor do parâmetro Status é inválido')
            expect(responseList.body.RestException.Status).toBe('400')
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      test("/GET - Deve retornar 400, o rooms (quantidade de cômodos) foi declarado, mas não possui valor.", function() {

        let url = endpoints.toList + '?rooms='

        return request.get(url).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe('1')
            expect(responseList.body.RestException.Message).toBe('O valor do parâmetro Quantidade de Cômodos não foi informado')
            expect(responseList.body.RestException.Status).toBe('400')
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      test("/GET - Deve retornar 400, o valor de Rooms (quantidade de cômodos) é inválido.", function() {

        let url = endpoints.toList + '?rooms=1a'

        return request.get(url).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe('2')
            expect(responseList.body.RestException.Message).toBe('O valor do parâmetro Quantidade de Cômodos é inválido')
            expect(responseList.body.RestException.Status).toBe('400')
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      test("/GET - Deve retornar 400, o valor de Rooms (quantidade de cômodos) é inválido por ser negativo.", function() {

        let url = endpoints.toList + '?rooms=-1'

        return request.get(url).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe('2')
            expect(responseList.body.RestException.Message).toBe('O valor do parâmetro Quantidade de Cômodos é inválido')
            expect(responseList.body.RestException.Status).toBe('400')
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      test("/GET - Deve retornar 400, a query string Menor Diária foi declarada, mas não possui valor.", function() {

        let queryStringOBJ = {
          lowest_daily_price: ''
        }

        let url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

        return request.get(url).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe('1')
            expect(responseList.body.RestException.Message).toBe('O valor do parâmetro Menor Diária não foi informado')
            expect(responseList.body.RestException.Status).toBe('400')
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      test("/GET - Deve retornar 400, o valor da Menor Diária é inválido.", function() {

        let queryStringOBJ = {
          lowest_daily_price: '1a'
        }

        let url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

        return request.get(url).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe('2')
            expect(responseList.body.RestException.Message).toBe('O valor do parâmetro Menor Diária é inválido')
            expect(responseList.body.RestException.Status).toBe('400')
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      test("/GET - Deve retornar 400, o valor da Menor Diária é negativo.", function() {

        let queryStringOBJ = {
          lowest_daily_price: '-1'
        }

        let url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

        return request.get(url).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe('2')
            expect(responseList.body.RestException.Message).toBe('O valor do parâmetro Menor Diária é inválido')
            expect(responseList.body.RestException.Status).toBe('400')
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      test("/GET - Deve retornar 400, a query string Maior Diária foi declarada, mas não possui valor.", function() {

        let queryStringOBJ = {
          highest_daily_price: ''
        }

        let url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

        return request.get(url).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe('1')
            expect(responseList.body.RestException.Message).toBe('O valor do parâmetro Maior Diária não foi informado')
            expect(responseList.body.RestException.Status).toBe('400')
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      test("/GET - Deve retornar 400, o valor da Maior Diária é inválido.", function() {

        let queryStringOBJ = {
          highest_daily_price: '1a'
        }

        let url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

        return request.get(url).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe('2')
            expect(responseList.body.RestException.Message).toBe('O valor do parâmetro Maior Diária é inválido')
            expect(responseList.body.RestException.Status).toBe('400')
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      test("/GET - Deve retornar 400, o valor da Maior Diária é negativo.", function() {

        let queryStringOBJ = {
          highest_daily_price: '-1'
        }

        let url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

        return request.get(url).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe('2')
            expect(responseList.body.RestException.Message).toBe('O valor do parâmetro Maior Diária é inválido')
            expect(responseList.body.RestException.Status).toBe('400')
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      test("/GET - Deve retornar 400, o valor da Maior Diária é menor que o da Menor Diária.", function() {

        let queryStringOBJ = {
          lowest_daily_price: '400.50',
          highest_daily_price: '300.10'
        }

        let url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

        return request.get(url).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe('2')
            expect(responseList.body.RestException.Message).toBe('O valor do parâmetro Maior Diária deve ser maior o da Menor Diária')
            expect(responseList.body.RestException.Status).toBe('400')
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      test("/GET - Deve retornar 400, a query string Permissão de Animais foi declarada, mas não possui valor.", function() {

        let queryStringOBJ = {
          accepts_animals: ''
        }

        let url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

        return request.get(url).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe('1')
            expect(responseList.body.RestException.Message).toBe('O valor do parâmetro de Permissão de Animais não foi informado')
            expect(responseList.body.RestException.Status).toBe('400')
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      test("/GET - Deve retornar 400, Permissão de Animais possui um valor inválido.", function() {

        let queryStringOBJ = {
          accepts_animals: '2'
        }

        let url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

        return request.get(url).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe('2')
            expect(responseList.body.RestException.Message).toBe('O valor para Aceitação de Animais é diferente de 0 ou 1')
            expect(responseList.body.RestException.Status).toBe('400')
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      test("/GET - Deve retornar 400, o Offset foi informado sem a presença do Limit.", function() {

        let url = endpoints.toList + '?offset=3'

        return request.get(url).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe('1')
            expect(responseList.body.RestException.Message).toBe('O parâmetro OFFSET foi informado sem a presença do LIMIT')
            expect(responseList.body.RestException.Status).toBe('400')
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      test("/GET - Deve retornar 400, o offset foi declarado, mas não possui valor.", function() {

        let url = endpoints.toList + '?offset=&limit=3'

        return request.get(url).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe('2')
            expect(responseList.body.RestException.Message).toBe('O valor do parâmetro Offset não foi informado')
            expect(responseList.body.RestException.Status).toBe('400')
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      test("/GET - Deve retornar 400, o valor do offset é inválido.", function() {

        let url = endpoints.toList + '?offset=1a&limit=3'

        return request.get(url).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe('2')
            expect(responseList.body.RestException.Message).toBe('O valor do parâmetro Offset é inválido')
            expect(responseList.body.RestException.Status).toBe('400')
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      test("/GET - Deve retornar 400, o valor do offset é inválido por ser negativo.", function() {

        let url = endpoints.toList + '?offset=-2&limit=3'

        return request.get(url).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe('2')
            expect(responseList.body.RestException.Message).toBe('O valor do parâmetro Offset é inválido')
            expect(responseList.body.RestException.Status).toBe('400')
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      test("/GET - Deve retornar 404, o valor do offset é maior que o último apto cadastrado.", function() {

        let url = endpoints.toList + '?offset=2000&limit=3'

        return request.get(url).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(404)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      test("/GET - Deve retornar 404, o valor do offset é maior que o último apto cadastrado.", async function() {

        try {

          const queryStringOBJ = {
            rooms: 7,
            lowest_daily_price: 420,
            highest_daily_price: 450,
            accepts_animals: 1,
            offset: 2,
            limit: 4,
            sort: 'daily_price:desc'
          }

          const url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

          let responseList = await request.get(url)

          expect(responseList.statusCode).toEqual(404)
          
        } catch (errorList) {
          fail(errorList)
        }

      })

      test("/GET - Deve retornar 400, o limit foi declarado, mas não possui valor.", function() {

        let url = endpoints.toList + '?offset=1&limit='

        return request.get(url).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe('2')
            expect(responseList.body.RestException.Message).toBe('O valor do parâmetro Limit não foi informado')
            expect(responseList.body.RestException.Status).toBe('400')
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      test("/GET - Deve retornar 400, o valor do limit é inválido.", function() {

        let url = endpoints.toList + '?offset=5&limit=5a'

        return request.get(url).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe('2')
            expect(responseList.body.RestException.Message).toBe('O valor do parâmetro Limit é inválido')
            expect(responseList.body.RestException.Status).toBe('400')
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      test("/GET - Deve retornar 400, o valor do limit é inválido por ser negativo.", function() {

        let url = endpoints.toList + '?offset=2&limit=-3'

        return request.get(url).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe('2')
            expect(responseList.body.RestException.Message).toBe('O valor do parâmetro Limit é inválido')
            expect(responseList.body.RestException.Status).toBe('400')
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      test("/GET - Deve retornar 400, a query string de Ordenamento foi declarada, mas não possui valor.", function() {

        let queryStringOBJ = {
          sort: ''
        }

        let url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

        return request.get(url).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe('1')
            expect(responseList.body.RestException.Message).toBe('O valor do parâmetro de Ordenação não foi informado')
            expect(responseList.body.RestException.Status).toBe('400')
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      test("/GET - Deve retornar 400, Ordenamento possui um valor inválido.", function() {

        let queryStringOBJ = {
          sort: 'daily_priceasc'
        }

        let url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

        return request.get(url).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe('2')
            expect(responseList.body.RestException.Message).toBe("A estrutura do valor da Ordenação é inválida")
            expect(responseList.body.RestException.Status).toBe('400')
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      test("/GET - Deve retornar 400, o campo a ser Ordenado é inválido.", function() {

        let queryStringOBJ = {
          sort: 'daily_pice:asc'
        }

        let url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

        return request.get(url).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe('2')
            expect(responseList.body.RestException.Message).toBe("O campo a ser ordenado \'daily_pice\' é inválido")
            expect(responseList.body.RestException.Status).toBe('400')
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

      test("/GET - Deve retornar 400, o tipo de Ordenação é inválido.", function() {

        let queryStringOBJ = {
          sort: 'daily_price:asci'
        }

        let url = endpoints.toList + Generator.genQueryStringFromObject(queryStringOBJ)

        return request.get(url).set('Authorization', accounts.cliente.token)
          .then(function(responseList) {

            expect(responseList.statusCode).toEqual(400)

            expect(responseList.body.RestException.Code).toBe('2')
            expect(responseList.body.RestException.Message).toBe("O tipo de ordenação \'asci\' é inválido")
            expect(responseList.body.RestException.Status).toBe('400')
            expect(responseList.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)

          })
          .catch(function(errorRead) {
            fail(errorRead)
          })

      })

    })

  })

  describe("UPDATE", function() {

    describe("Testes de SUCESSO.", function() {

      test("/PUT - Deve retornar 200, para sucesso na atualização das informações de um apartamento.", async function() {

        try {

          let number = (ApartmentsTools.getMinMaxNumber().max + 1).toString()

          let apartment = {
            id: "d9d62beecdde62af82efd82c",
            floor: "3",
            number,
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

          let responseUpdate = await request.put(endpoints.toUpdate).send(apartment).set('Authorization', accounts.admin.token)

          expect(responseUpdate.statusCode).toEqual(200)

          expect(responseUpdate.body._links).toBeDefined()
          expect(responseUpdate.body._links).toHaveLength(4)

          const HATEOAS = Generator.genHATEOAS(apartment.id, 'apartment', 'apartments', true)

          for (let cont = 0; cont < responseUpdate.body._links.length; cont++) {
            expect(responseUpdate.body._links[cont]).toMatchObject(HATEOAS[cont])
          }

          try {

            let responseRead = await request.get(`${ endpoints.toRead }/${ apartment.id }`).set('Authorization', accounts.admin.token)

            const { rooms, created, updated, _links } = responseRead.body

            let apartmentJSON = ApartmentsTools.getApartmentByID(apartment.id)

            expect(responseRead.body).toMatchObject({
              id: apartment.id,
              floor: apartmentJSON.floor,
              number: apartmentJSON.number,
            })

            expect(rooms).toBeDefined()
            expect(rooms).toHaveLength(4)

            expect(created.createdAt).toBe(apartmentJSON.created.createdAt)
            expect(created.createdBy).toMatchObject({
              id: apartmentJSON.created.createdBy.id,
              name: apartmentJSON.created.createdBy.name,
            })

            expect(updated).toMatchObject({
              updatedAt: apartmentJSON.updated.updatedAt,
              updatedBy: {
                id: apartmentJSON.updated.updatedBy.id,
                name: apartmentJSON.updated.updatedBy.name,
              }
            })

            expect(_links).toBeDefined()
            expect(_links).toHaveLength(4)

            const HATEOAS = Generator.genHATEOAS(apartment.id, 'apartment', 'apartments', true)

            for (let cont = 0; cont < responseRead.body._links.length; cont++) {
              expect(responseRead.body._links[cont]).toMatchObject(HATEOAS[cont])
            }

          } catch (errorRead) {
            fail(errorRead)
          }

        } catch (errorUpdate) {
          fail(errorUpdate)
        }

      })

      test("/PUT - Deve retornar 200, para sucesso na atualização das informações de um apartamento, onde se faz uso de seu próprio número.", async function() {

        try {

          let number = (ApartmentsTools.getMinMaxNumber().max + 1).toString()

          let apartment = {
            id: "856377c88f8fd9fc65fd3ef5",
            floor: "3",
            number,
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

          let responseUpdate = await request.put(endpoints.toUpdate).send(apartment).set('Authorization', accounts.admin.token)

          expect(responseUpdate.statusCode).toEqual(200)

          try {

            let responseRead = await request.get(`${ endpoints.toRead }/${ apartment.id }`).set('Authorization', accounts.admin.token)

            const { rooms, created, updated, _links } = responseRead.body

            let apartmentJSON = ApartmentsTools.getApartmentByID(apartment.id)

            expect(responseRead.body).toMatchObject({
              id: apartment.id,
              floor: apartmentJSON.floor,
              number: apartmentJSON.number,
            })

            expect(rooms).toBeDefined()
            expect(rooms).toHaveLength(4)

            expect(created.createdAt).toBe(apartmentJSON.created.createdAt)
            expect(created.createdBy).toMatchObject({
              id: apartmentJSON.created.createdBy.id,
              name: apartmentJSON.created.createdBy.name,
            })

            expect(updated).toMatchObject({
              updatedAt: apartmentJSON.updated.updatedAt,
              updatedBy: {
                id: apartmentJSON.updated.updatedBy.id,
                name: apartmentJSON.updated.updatedBy.name,
              }
            })

            expect(_links).toBeDefined()
            expect(_links).toHaveLength(4)

            const HATEOAS = Generator.genHATEOAS(apartment.id, 'apartment', 'apartments', true)

            for (let cont = 0; cont < responseRead.body._links.length; cont++) {
              expect(responseRead.body._links[cont]).toMatchObject(HATEOAS[cont])
            }

          } catch (errorRead) {
            fail(errorRead)
          }

        } catch (errorUpdate) {
          fail(errorUpdate)
        }

      })

      test("/PUT - Deve retornar 200, para sucesso na atualização parcial das informações de um apartamento.", async function() {

        try {

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

          let responseUpdate = await request.put(endpoints.toUpdate).send(apartment).set('Authorization', accounts.admin.token)

          expect(responseUpdate.statusCode).toEqual(200)

          try {

            let responseRead = await request.get(`${ endpoints.toRead }/${ apartment.id }`).set('Authorization', accounts.admin.token)

            expect(responseRead.statusCode).toEqual(200)

            const { rooms, daily_price, created, updated } = responseRead.body

            let apartmentJSON = ApartmentsTools.getApartmentByID(apartment.id)

            expect(rooms[2]).toMatchObject({
              room: "banheiro",
              quantity: "2"
            })
            expect(rooms[3]).toMatchObject({
              room: "quarto",
              quantity: "3"
            })
            expect(daily_price).toBe('1000')

            expect(created.createdAt).toBe(apartmentJSON.created.createdAt)
            expect(created.createdBy).toMatchObject({
              id: apartmentJSON.created.createdBy.id,
              name: apartmentJSON.created.createdBy.name,
            })

            expect(updated).toMatchObject({
              updatedAt: apartmentJSON.updated.updatedAt,
              updatedBy: {
                id: apartmentJSON.updated.updatedBy.id,
                name: apartmentJSON.updated.updatedBy.name,
              }
            })

          } catch (errorRead) {
            fail(errorRead)
          }

        } catch (errorUpdate) {
          fail(errorUpdate)
        }

      })

      test("/PUT - Deve retornar 200, para atualização somente das fotos do apto.", async function() {

        try {

          const responseRead = await request.get(`${ endpoints.toRead }/${ idRegisteredApartmentsWithPictures[0] }`).set('Authorization', accounts.admin.token)

          expect(responseRead.statusCode).toEqual(200)

          const { number, pictures } = responseRead.body

          try {

            const requestUpdate = request.put(endpoints.toUpdate)

            let apartment = {
              id: idRegisteredApartmentsWithPictures[0],
              picturesToBeDeleted: [extractPictureName(pictures[0])]
            }

            let apartmentJSON = JSON.stringify(apartment)

            let images = ['kitchen.jpg']

            requestUpdate
              .set('Authorization', accounts.admin.token)
              .field('apartment', apartmentJSON, { contentType: 'application/json' })

            for (let image of images) {
              let src = await genPath(image)
              requestUpdate.attach('iptImages', src)
            }

            let responseUpdate = await requestUpdate

            expect(responseUpdate.statusCode).toEqual(200)

            const picturesArray = await ApartmentsTools.getPictures(number)

            expect(picturesArray).toEqual(
              expect.not.arrayContaining(apartment.picturesToBeDeleted)
            )

            expect(picturesArray).toEqual(
              expect.arrayContaining(images)
            )

          } catch (errorUpdate) {
            fail(errorUpdate)
          }

        } catch (errorRead) {
          fail(errorRead)
        }

      })

    })

    describe("Testes de FALHA.", function() {

      test("/PUT - Deve retornar 401, já que o usuáiro não está AUTORIZADO.", function() {

        let apartment = { 
          id: '856377c88f8fd9fc65fd3ef5',
          floor: "1",
          number: "2",
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

      test("/PUT - Deve retornar 403, já que o Cliente não está AUTENTICADO.", function() {

        let apartment = { 
          id: '856377c88f8fd9fc65fd3ef5',
          floor: "1",
          number: "2",
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

        return request.put(endpoints.toUpdate).send(apartment).set('Authorization', accounts.cliente.token)
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

      test("/PUT - Deve retornar 403, já que o Funcionário não está AUTENTICADO.", function() {

        let apartment = { 
          id: '856377c88f8fd9fc65fd3ef5',
          floor: "1",
          number: "2",
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

        return request.put(endpoints.toUpdate).send(apartment).set('Authorization', accounts.funcionario.token)
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

      test("/PUT - Deve retornar 403, já que o Gerente não está AUTENTICADO.", function() {

        let apartment = { 
          id: '856377c88f8fd9fc65fd3ef5',
          floor: "1",
          number: "2",
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

        return request.put(endpoints.toUpdate).send(apartment).set('Authorization', accounts.gerente.token)
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

      test("/PUT - Deve retornar 400, uma vez que o ID informado é inválido.", function() {

        let number = (ApartmentsTools.getMinMaxNumber().max + 1).toString()

        let apartment = { 
          id: 'ljb9kf3d5a65f17ljf2i0kc*',
          floor: "3",
          number,
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

        return request.put(endpoints.toUpdate).send(apartment).set('Authorization', accounts.admin.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(400)

            expect(responseUpdate.body.RestException.Code).toBe("2")
            expect(responseUpdate.body.RestException.Message).toBe("O ID do apartamento contém caracteres inválidos")
            expect(responseUpdate.body.RestException.Status).toBe("400")
            expect(responseUpdate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
          })

      })

      test("/PUT - Deve retornar 404, uma vez que o ID informado não pertence a um apartamento.", function() {

        let number = (ApartmentsTools.getMinMaxNumber().max + 1).toString()

        let apartment = {
          id: 'ljb9kf3d5a65f17ljf2i0kc7',
          floor: "3",
          number,
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

        return request.put(endpoints.toUpdate).send(apartment).set('Authorization', accounts.admin.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(404)

            expect(responseUpdate.body.RestException.Code).toBe("3")
            expect(responseUpdate.body.RestException.Message).toBe("Nenhum apartamento com o ID informado está cadastrado")
            expect(responseUpdate.body.RestException.Status).toBe("404")
            expect(responseUpdate.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/3`)

          })
          .catch(function(errorUpdate) {
            fail(errorUpdate)
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

        return request.put(endpoints.toUpdate).send(apartment).set('Authorization', accounts.admin.token)
          .then(function(responseUpdate) {

            expect(responseUpdate.statusCode).toEqual(400)

            expect(responseUpdate.body.RestException.Code).toBe("4")
            expect(responseUpdate.body.RestException.Message).toBe("O Número do Apartamento já está cadastrado")
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

      test("/DELETE - Deve retornar 200, na delecao de um apartamento.", function() {

        return request.delete(`${ endpoints.toDelete }/856377c88f8fd9fc65fd3ef5`).set('Authorization', accounts.admin.token)
          .then(function(responseDelete) {

            expect(responseDelete.statusCode).toEqual(200)

            return request.get(`${ endpoints.toRead }/856377c88f8fd9fc65fd3ef5`).set('Authorization', accounts.admin.token)
              .then(function(responseRead) {

                expect(responseRead.statusCode).toEqual(404)

                expect(responseRead.body.RestException.Code).toBe("3")
                expect(responseRead.body.RestException.Message).toBe("Nenhum apartamento com o ID informado está cadastrado")
                expect(responseRead.body.RestException.Status).toBe("404")
                expect(responseRead.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/3`)

              })
              .catch(function(errorGET) {
                fail(errorGET)
              })

          })
          .catch(function(errorDelete) {
            fail(errorDelete)
          })

      })

      test("/DELETE - Deve retornar 200, na delecao do apto e da pasta de imagens do mesmo.", async function() {

        try {
          
          const aptoNumber = ApartmentsTools.getApartmentByID(idRegisteredApartmentsWithPictures[2]).number

          const responseDelete = await request.delete(`${ endpoints.toDelete }/${ idRegisteredApartmentsWithPictures[2] }`).set('Authorization', accounts.admin.token)

          expect(responseDelete.statusCode).toEqual(200)

          try {

            const responseRead = await request.get(`${ endpoints.toRead }/${ idRegisteredApartmentsWithPictures[2] }`).set('Authorization', accounts.admin.token)

            expect(responseRead.statusCode).toEqual(404)

            expect(responseRead.body.RestException.Code).toBe("3")
            expect(responseRead.body.RestException.Message).toBe("Nenhum apartamento com o ID informado está cadastrado")
            expect(responseRead.body.RestException.Status).toBe("404")
            expect(responseRead.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/3`)

            let picturesArray = await ApartmentsTools.getPictures(aptoNumber)

            expect(picturesArray).toHaveLength(0)

          } catch (errorRead) {
            fail(errorRead)
          }

        } catch (errorDelete) {
          fail(errorDelete)
        }

      })

    })

    describe("Testes de FALHA.", function() {

      test("/DELETE - Deve retornar 401, o usuário não está AUTORIZADO.", function() {

        return request.delete(`${ endpoints.toDelete }/856377c88f8fd9fc65fd3ef5`)
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

      test("/DELETE - Deve retornar 403, o Cliente não pode acessar essa área (não está AUTENTICADO).", function() {

        return request.delete(`${ endpoints.toDelete }/856377c88f8fd9fc65fd3ef5`).set('Authorization', accounts.cliente.token)
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

      test("/DELETE - Deve retornar 403, o Funcionário não pode acessar essa área (não está AUTENTICADO).", function() {

        return request.delete(`${ endpoints.toDelete }/856377c88f8fd9fc65fd3ef5`).set('Authorization', accounts.funcionario.token)
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

      test("/DELETE - Deve retornar 403, o Gerente não pode acessar essa área (não está AUTENTICADO).", function() {

        return request.delete(`${ endpoints.toDelete }/856377c88f8fd9fc65fd3ef5`).set('Authorization', accounts.gerente.token)
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

      test("/DELETE - Deve retornar 400, já que o ID possui caracteres inválidos.", function() {
        return request.delete(`${ endpoints.toDelete }/856377c88f8fd9fc65fd3e*5`).set('Authorization', accounts.admin.token)
          .then(function(responseDelete) {

            expect(responseDelete.statusCode).toEqual(400)

            expect(responseDelete.body.RestException.Code).toBe("2")
            expect(responseDelete.body.RestException.Message).toBe("O ID do apartamento contém caracteres inválidos")
            expect(responseDelete.body.RestException.Status).toBe("400")
            expect(responseDelete.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)

          })
          .catch(function(errorDelete) {
            fail(errorDelete)
          })

      })

      test("/DELETE - Deve retornar 404, já que o ID não pertence a um apartamento.", function() {

        return request.delete(`${ endpoints.toDelete }/856377c88f8fd9fc65fd315`).set('Authorization', accounts.admin.token)
          .then(function(responseDelete) {

            expect(responseDelete.statusCode).toEqual(404)

            expect(responseDelete.body.RestException.Code).toBe("3")
            expect(responseDelete.body.RestException.Message).toBe("Nenhum apartamento com o ID informado está cadastrado")
            expect(responseDelete.body.RestException.Status).toBe("404")
            expect(responseDelete.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/3`)

          })
          .catch(function(errorDelete) {
            fail(errorDelete)
          })

      })

    })

  })

})

function deleteApartmentsFolder() {

  return new Promise((resolve, reject) => {

    let src = path.resolve(__dirname, '../src/tmp/uploads/apartments')

    fileSystem.rmdir(src, { recursive: true }, (error, response) => {
      if (error) {
        reject(error)
      } else {
        resolve(true)
      }
    })

  })

}

afterAll(async () => {

  try {

    await deleteApartmentsFolder()

  } catch (error) {
    console.log(error)
  }

})
