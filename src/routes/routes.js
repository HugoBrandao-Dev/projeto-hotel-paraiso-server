const express = require('express')
const app = express()
const router = express.Router()

// Controllers
const HomeController = require('../controllers/HomeController')
const UserController = require('../controllers/UserController')
const ApartmentController = require('../controllers/ApartmentController')

router.get('/', HomeController.index)

/* ########### USER ########### */

// Create
router.post('/users', UserController.create)

// Read
router.get('/users', UserController.list)
router.get('/users/:id', UserController.read)
router.post('/users/search', UserController.readByDoc)

// Update
router.put('/users', UserController.update)

// Delete
router.delete('/users/:id', UserController.delete)

/* ########### APARTMENT ########### */

// Create
router.post('/apartments', ApartmentController.create)

module.exports = router