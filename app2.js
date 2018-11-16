const express = require('express')
const http = require('http');

const app = express()

const historys = require('./routes')


app.use(function (req, res, next) {
  // console.log('Request Type:', req.method)
  // console.log('Request baseUrl:', req.baseUrl)
  // console.log('Request originalUrl:', req.originalUrl) // /api/historys/vote?account
  // console.log('Request route:', req.route) // undefined
  if (req.method != 'GET') return res.sendStatus(403) // 不是 GET 方法，返回 403 Forbidden
  // console.log('Request path:', req.path) // /api/historys/vote
  if (!req.path.startsWith('/api/historys')) return res.sendStatus(404)
  next()
})

const validMethodList = ['vote', 'stake', 'transfer']

// GET /api/historys/vote?account=arara
app.get('/api/historys/:method', (req, res, next) => {
  // console.log('req.params.method', req.params.method); // vote
  if (!validMethodList.includes(req.params.method)) return res.sendStatus(404)
  // console.log('req.query.account', req.query.account); // arara
  if (!req.query.account) return res.sendStatus(404)
  next()
})


app.use('/api/historys', historys)

var server = http.createServer(app);
const PORT = 3001
const HOST = '192.168.2.178'
server.listen(PORT, HOST, () => console.log(`Example app listening on ${HOST}:${PORT}!`))
