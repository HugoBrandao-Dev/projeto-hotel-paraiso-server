const express = require('express')
const app = express()
const router = require('./routes/routes')
const cors = require('cors')

let database = require('./database/connection')

app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

database.connect()

app.use('/', router)

module.exports = app
