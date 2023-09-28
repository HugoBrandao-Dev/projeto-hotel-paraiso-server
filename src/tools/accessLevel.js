const Analyzer = require('../tools/Analyzer')
const validator = require('validator')

const User = require('../models/User')
const Reserve = require('../models/Reserve')

const EndPoints = require('../routes/endpoints')
const userEndpoints = new EndPoints({ singular: 'user', plural: 'users' })
const apartmentEndpoints = new EndPoints({ singular: 'apartment', plural: 'apartments' })
const reserveEndpoints = new EndPoints({ singular: 'reserve', plural: 'reserves' })

// Verifica se a conta tem permissão de realizar uma determinada ação.
async function isActionAllowed(decodedToken, path, method, params, body) {
  try {
    const upperMethod = method.toUpperCase()
    let allowed = false

    switch (decodedToken.role) {
      case '0':
        switch (upperMethod) {
          case 'POST':

            if (path == reserveEndpoints.toCreate) {
              if (!body.status && !body.user_id) {
                allowed = true
              }
            }

            break
          case 'GET':

            if (path.indexOf(reserveEndpoints.toRead) != -1) {
              if (params.id) {
                let idResult = await Analyzer.analyzeID(params.id, 'apartment')

                if (!idResult.hasError.value) {

                  let reserve = await Reserve.findOne(params.id)

                  if (decodedToken.id == reserve.user_id) {
                    allowed = true
                  }
                }
              }
            }

            // Verifica se o ID passado no parâmetro é o mesmo do armazenado no Token.
            if (params.id && params.id === decodedToken.id) {
              allowed = true
            }

            break
          case 'PUT':

            if (path == reserveEndpoints.toUpdate) {

              if (body.apartment_id) {

                let idResult = await Analyzer.analyzeID(body.apartment_id, 'apartment')

                if (!idResult.hasError.value) {

                  let reserve = await Reserve.findOne(body.apartment_id)

                  if (reserve.user_id == decodedToken.id) {
                    if (!body.status) {
                      allowed = true
                    }
                  }

                } else {
                  allowed = true
                }

              }

            }

            // Verifica se o ID passado no corpo é o mesmo do armazenado no Token.
            if (body.id === decodedToken.id) {

              // Verifica se o Cliente está tentando alterar sua função.
              if (!(body.role >= 0)) {
                allowed = true
              }
            }
            break
          case 'DELETE':

            // Verifica se o ID passado no parâmetro é o mesmo do armazenado no Token.
            if (params.id && decodedToken.id === params.id) {
              allowed = true
            }
            break
        }
        break
      case '1':
        switch (upperMethod) {
          case 'POST':

            if (path == reserveEndpoints.toCreate) {
              if (body.user_id) {
                let idResult = await Analyzer.analyzeID(body.user_id)
                if (!idResult.hasError.value) {

                  // Usuário para o qual será reservado o apto.
                  let user = await User.findOne(body.user_id)

                  if (user && decodedToken.role > user.role) {
                    allowed = true
                  }
                } else {
                  allowed = true
                }
              } else {
                allowed = true
              }
            } else if (path != apartmentEndpoints.toCreate && path != apartmentEndpoints.toSearch && !(body.role >= 0)) {
              allowed = true
            }

            break
          case 'GET':
            allowed = true
            break
          case 'PUT':

            if (path == reserveEndpoints.toUpdate) {

              if (body.apartment_id) {

                let idResult = await Analyzer.analyzeID(body.apartment_id, 'apartment')
                if (!idResult.hasError.value) {

                  let reserve = await Reserve.findOne(body.apartment_id)

                  if (reserve) {

                    if (body.status != 'indisponível' && reserve.status != 'indisponível') {
                      allowed = true
                    }

                  } else {
                    allowed = true
                  }

                } else {
                  allowed = true
                }

              } else {
                allowed = true
              }

            } else if (path != apartmentEndpoints.toUpdate && !(body.role > 0)) {
              allowed = true
            }

            break
          case 'DELETE':

            if (path.indexOf(apartmentEndpoints.toDelete) == -1) {
              // Analisa o ID do parâmetro.
              let idResult = await Analyzer.analyzeID(params.id)

              // Verifica se o ID passado no parâmetro tem algum erro.
              if (!idResult.hasError.value) {

                // Busca pelo usuário que será deletado.
                let userToBeDeleted = await User.findOne(params.id)

                // Verifica se a conta a ser deletada é do tipo Cliente (0).
                if (userToBeDeleted) {
                  if (userToBeDeleted.role < 1) {
                    allowed = true
                  }
                }

              // Caso seja encontrado erros no ID, deve-se ser tratado no Controller.
              } else {
                allowed = true
              }
            }

            break
        }
        break
      case '2':
        switch (upperMethod) {
          case 'POST':
            if (path != apartmentEndpoints.toCreate && !(body.role >= 2)) {
              allowed = true
            }
            break
          case 'GET':
            allowed = true
            break
          case 'PUT':

            if (path != apartmentEndpoints.toUpdate && !(body.role >= 2)) {
              allowed = true
            }

            break
          case 'DELETE':
            break
        }
        break
      case '4':
        allowed = true
        break
    }

    return allowed
  } catch (error) {
    console.log(error)
  }
}

module.exports = isActionAllowed