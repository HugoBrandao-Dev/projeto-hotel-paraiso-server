const jwt = require('jsonwebtoken')
const secret = 'k372gkhcfmhg6l9nj19i51ng'
const Analyzer = require('../tools/Analyzer')
const validator = require('validator')

const User = require('../models/User')
const Reserve = require('../models/Reserve')

const EndPoints = require('../routes/endpoints')
const userEndpoints = new EndPoints({ singular: 'user', plural: 'users' })
const apartmentEndpoints = new EndPoints({ singular: 'apartment', plural: 'apartments' })
const reserveEndpoints = new EndPoints({ singular: 'reserve', plural: 'reserves' })

// Verifica se a conta tem permissão de realizar uma determinada ação.
async function isActionAllowed(headers, path, method, params, body) {
  try {
    const upperMethod = method.toUpperCase()
    let allowed = false

    if (headers['authorization']) {

      const authToken = headers['authorization']
      const token = authToken.split(' ')[1]

      try {
        let decodedToken = await jwt.verify(token, secret)

        try {

          switch (decodedToken.role) {
            case 0:

              /* ################ CLIENTE ################ */

              switch (upperMethod) {
                case 'POST':

                  if (path == reserveEndpoints.toCreate) {

                    // O cliente não pode informar o STATUS e o CLIENT_ID para a reserva.
                    if (!body.status && !body.client_id) {
                      allowed = true
                    }
                  }

                  break
                case 'GET':
                  const isReserveRoute = path.indexOf(reserveEndpoints.toRead) === 0
                  const isApartmentRoute = path.indexOf(apartmentEndpoints.toRead) === 0
                  if (isReserveRoute || isApartmentRoute) {
                    if (params.id) {
                      let idResult = await Analyzer.analyzeApartmentID(params.id)
                      if (!idResult.hasError.value) {
                        let result = await Reserve.findOne(params.id)

                        if (result.reserve.status == 'livre') {
                          allowed = true
                        } else {
                          if (decodedToken.id == result.reserve.client_id) {
                            allowed = true
                          }
                        }

                      }
                    }
                  }

                  if (path == apartmentEndpoints.toList) {
                    allowed = true
                  }

                  // Verifica se o ID passado no parâmetro é o mesmo do armazenado no Token.
                  if (params.id && params.id === decodedToken.id) {
                    allowed = true
                  }

                  break
                case 'PUT':
                  if (path.indexOf('/reserves') === 0) {

                    if (params.id) {

                      let idResult = await Analyzer.analyzeApartmentID(params.id)

                      if (!idResult.hasError.value) {

                        let result = await Reserve.findOne(params.id)
                        if (result.reserve.client_id == decodedToken.id) {
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
                  if (params.id === decodedToken.id) {

                    // Verifica se o Cliente está tentando alterar sua função.
                    if (!(body.role >= 0)) {
                      allowed = true
                    }
                  }
                  break
                case 'DELETE':
                  if (path.indexOf(reserveEndpoints.toDelete) === 0) {

                    let idResult = await Analyzer.analyzeApartmentID(params.id)

                    if (!idResult.hasError.value) {
                      
                      let result = await Reserve.findOne(params.id)

                      if (result.reserve.client_id == decodedToken.id) {
                        allowed = true
                      }

                    } else {
                      allowed = true
                    }
                  // Verifica se o ID passado no parâmetro é o mesmo do armazenado no Token.
                  } else if (params.id && decodedToken.id === params.id) {
                    allowed = true
                  }
                  break
              }
              break
            case 1:

              /* ################ FUNCIONÁRIO ################ */

              switch (upperMethod) {
                case 'POST':

                  if (path == reserveEndpoints.toCreate) {
                    if (body.client_id) {
                      let idResult = await Analyzer.analyzeUserID(body.client_id)
                      if (!idResult.hasError.value) {

                        // Usuário para o qual será reservado o apto.
                        let user = await User.findOne(body.client_id)

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
                  const isUserRoute = path.indexOf('/users') === 0
                  const isApartmentRoute = path.indexOf('/apartments') === 0
                  const isReserveRoute = path.indexOf('/reserves') === 0

                  if (isUserRoute && !body.role) {
                    allowed = true
                  } else if (isReserveRoute) {
                    if (body.apartment_id) {
                      let idResult = await Analyzer.analyzeApartmentID(body.apartment_id)
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
                  }

                  break
                case 'DELETE':

                  if (path.indexOf(apartmentEndpoints.toDelete) == -1) {
                    // Analisa o ID do parâmetro.
                    let idResult = await Analyzer.analyzeUserID(params.id)

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
            case 2:

              /* ################ GERENTE ################ */

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

                  if (path == reserveEndpoints.toUpdate) {

                      let idResult = await Analyzer.analyzeApartmentID(body.apartment_id)

                      if (!idResult.hasError.value) {

                        let reserve = await Reserve.findOne(body.apartment_id)

                        if (reserve) {

                          if (reserve.status == 'ocupado') {

                            if (body.status != 'indisponível') {

                              allowed = true

                            }

                          } else {

                            allowed = true

                          }

                        }

                      } else {

                        allowed = true

                      }

                  } else if (path != apartmentEndpoints.toUpdate && !(body.role >= 2)) {
                    allowed = true
                  }

                  break
                case 'DELETE':
                  break
              }
              break
            case 4:

              /* ################ ADMIN ################ */

              allowed = true
              break
          }

        } catch (errorAllowed) {
          console.error(errorToken)
        }
      } catch (errorToken) {
        console.error(errorToken)
      }

    } else {
      if (path.includes('/apartments') && path.indexOf('/apartments') == 0) {
        if (params.id) {
          let idResult = await Analyzer.analyzeApartmentID(params.id)
          if (!idResult.hasError.value) {
            let result = await Reserve.findOne(params.id)

            if (result.reserve.status == 'livre') {
              allowed = true
            } 

          }
        } else {
          allowed = true
        }
      }
    }

    return allowed
  } catch (error) {
    console.log(error)
  }
}

module.exports = isActionAllowed