const express = require('express')
const app = express()
const router = express.Router()

// Controllers
const HomeController = require('../controllers/HomeController')
const UserController = require('../controllers/UserController')
const ApartmentController = require('../controllers/ApartmentController')
const ReserveController = require('../controllers/ReserveController')

router.get('/', HomeController.index)

/* ########### USER ########### */

// Create
router.post('/user', UserController.create)

// Read
router.get('/users', UserController.list)
router.get('/user/:id', UserController.read)
router.post('/user/search', UserController.readByDoc)
router.post('/login', UserController.login)

// Update
router.put('/user', UserController.update)

// Delete
router.delete('/user/:id', UserController.remove)

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
router.get('/reserves/:id', ReserveController.read)
router.get('/reserves', ReserveController.list)

// Update
router.put('/reserves', ReserveController.update)

// Delete
router.delete('/reserves/:id', ReserveController.remove)

module.exports = router