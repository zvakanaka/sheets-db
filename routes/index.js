const router = require('express').Router()
const initAsyncRoutes = require('./async-routes')

initAsyncRoutes(router)

module.exports = router