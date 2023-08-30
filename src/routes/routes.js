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
router.post('/users', UserController.create)

// Read
router.get('/users', UserController.list)
router.get('/users/:id', UserController.read)
router.post('/users/search', UserController.readByDoc)
router.post('/login', UserController.login)

// Update
router.put('/users', UserController.update)

// Delete
router.delete('/users/:id', UserController.remove)

/* ########### APARTMENT ########### */

// Create
router.post('/apartments', ApartmentController.create)

// Read
router.get('/apartments/:id', ApartmentController.read)
router.get('/apartments', ApartmentController.list)

// Update
router.put('/apartments', ApartmentController.update)

// Delete
router.delete('/apartments/:id', ApartmentController.remove)

/* ########### RESERVE ########### */

// Read
router.get('/reserves/:id', ReserveController.read)
router.get('/reserves', ReserveController.list)

// Update
router.put('/reserves', ReserveController.update)

// Delete
router.delete('/reserves/:id', ReserveController.remove)

module.exports = router