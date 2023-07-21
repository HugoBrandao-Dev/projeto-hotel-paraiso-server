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
router.get('/users', UserController.readMany)
router.get('/users/:id', UserController.read)
router.post('/users/search', UserController.readByDoc)

// Update
router.put('/users', UserController.update)

// Delete
router.delete('/users/:id', UserController.delete)

module.exports = router