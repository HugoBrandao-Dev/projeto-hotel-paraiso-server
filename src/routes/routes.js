const express = require('express')
const app = express()
const router = express.Router()

// Controllers
const HomeController = require('../controllers/HomeController')
const UserController = require('../controllers/UserController')

router.get('/', HomeController.index)
router.post('/users', UserController.create)
router.post('/users/by_cpf', UserController.readByCPF)
router.get('/users', UserController.readMany)
router.get('/users/:id', UserController.read)

module.exports = router