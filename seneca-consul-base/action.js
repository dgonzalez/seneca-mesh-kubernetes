'use strict'

let Seneca = require('seneca')

let seneca = Seneca()

.add({cmd: 'test', action: 'hello'}, function (msg, done) {
  done(null, {answer: 'aloha!'})
})

// .use('consul-registry', {
//     host: 'srv-consul'
// })

.use('mesh', {
  base: true,
  pin: 'cmd:test'
})

.ready(function () {
  console.log('Seneca up and running')
})
