const app = require('../src/app')

const supertest = require('supertest')
const request = supertest(app)

test("Deve retornar 200 ao fazer uma requisição a rota principal.", async function() {
  try {
    const response = await request.get('/')
    expect(response.status).toEqual(200)
  } catch (error) {
    fail(error)
  }
})