const express = require('express')
const app = express()
const router = express.Router()

// Controllers
const HomeController = require('../controllers/HomeController')
const UserController = require('../controllers/UserController')

router.get('/', HomeController.index)

/* ########### USER ########### */

// Create
router.post('/users', UserController.create)

// Read
router.post('/users/by_cpf', UserController.readByCPF)
router.post('/users/by_passportNumber', UserController.readByPassportNumber)
router.get('/users', UserController.readMany)
router.get('/users/:id', UserController.read)

// Update
router.put('/users', UserController.update)

module.exports = router