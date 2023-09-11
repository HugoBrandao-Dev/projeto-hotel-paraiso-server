const express = require('express')
const app = express()
const router = express.Router()

// Controllers
const HomeController = require('../controllers/HomeController')
const UserController = require('../controllers/UserController')
const ApartmentController = require('../controllers/ApartmentController')
const ReserveController = require('../controllers/ReserveController')
const authorization = require('../middlewares/authorization')
const authentication = require('../middlewares/authentication')

router.get('/', HomeController.index)

/* ########### USER ########### */

// Create
router.post('/user', UserController.create)

// Read
router.get('/user/:id', authorization, authentication, UserController.read)

// Esta rota é utilizada para visualização de informações do cliente pelo lado de um Funcionário++
// router.get('/user/:id', authorization, authentication, UserController.view)

router.get('/users', authorization, authentication, UserController.list)
router.post('/user/search', authorization, authentication, UserController.readByDoc)
router.post('/login', UserController.login)

// Update
router.put('/user', authorization, authentication, UserController.update)

// Delete
router.delete('/user/:id', authorization, authentication, UserController.remove)

/* ########### APARTMENT ########### */

// Create
router.post('/apartment', ApartmentController.create)

// Read
router.get('/apartment/:id', ApartmentController.read)
router.get('/apartments', ApartmentController.list)

// Update
router.put('/apartment', ApartmentController.update)

// Delete
router.delete('/apartment/:id', ApartmentController.remove)

/* ########### RESERVE ########### */

// Read
router.get('/reserve/:id', ReserveController.read)
router.get('/reserves', ReserveController.list)

// Update
router.put('/reserve', ReserveController.update)

// Delete
router.delete('/reserve/:id', ReserveController.remove)

module.exports = router