const express = require('express')
const app = express()
const router = express.Router()
const EndPoints = require('./endpoints')

// Controllers
const HomeController = require('../controllers/HomeController')
const UserController = require('../controllers/UserController')
const ApartmentController = require('../controllers/ApartmentController')
const ReserveController = require('../controllers/ReserveController')
const authorization = require('../middlewares/authorization')
const authentication = require('../middlewares/authentication')

router.get('/', HomeController.index)

/* ########### USER ########### */

const userEndpoints = new EndPoints({ singular: 'user', plural: 'users' }, true)

// Create
router.post(userEndpoints.toCreate, UserController.create)

// Read
router.get(userEndpoints.toRead, authorization, authentication, UserController.read)
router.get(userEndpoints.toList, authorization, authentication, UserController.list)
router.post(userEndpoints.toSearch, authorization, authentication, UserController.readByDoc)
router.post(userEndpoints.toLogin, UserController.login)

// Update
router.put(userEndpoints.toUpdate, authorization, authentication, UserController.update)

// Delete
router.delete(userEndpoints.toDelete, authorization, authentication, UserController.remove)

/* ########### APARTMENT ########### */

const apartmentEndpoints = new EndPoints({ singular: 'apartment', plural: 'apartments' }, true)

// Create
router.post(apartmentEndpoints.toCreate, authorization, authentication, ApartmentController.create)

// Read
router.get(apartmentEndpoints.toRead, authorization, authentication, ApartmentController.read)
router.get(apartmentEndpoints.toList, authorization, authentication, ApartmentController.list)

// Update
router.put(apartmentEndpoints.toUpdate, authorization, authentication, ApartmentController.update)

// Delete
router.delete(apartmentEndpoints.toDelete, authorization, authentication, ApartmentController.remove)

/* ########### RESERVE ########### */

const reserveEndpoints = new EndPoints({ singular: 'reserve', plural: 'reserves' }, true)

// Create
router.post(reserveEndpoints.toCreate, authorization, authentication, ReserveController.create)

// Read
router.get(reserveEndpoints.toRead, authorization, authentication, ReserveController.read)
router.get(reserveEndpoints.toList, authorization, ReserveController.list)

// Update
router.put(reserveEndpoints.toUpdate, authorization, authentication, ReserveController.update)

// Delete
router.delete(reserveEndpoints.toDelete, authorization, ReserveController.remove)

module.exports = router