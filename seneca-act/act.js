'use strict'

const kubernetes = require('seneca-kubernetes')
const Seneca = require('seneca')
const seneca = Seneca()

seneca.use(kubernetes)

function runningPods (pod) {
  return pod.status === 'Running'
}

function bases (pod) {
  return pod.labels.app === 'seneca-base'
}

function pickIp (pod) {
  return pod.ip
}

function addPort (ip) {
  return ip + ":39000"
}

seneca.ready(function () {

  const kubernetes = seneca.options().plugin.kubernetes

  seneca.use('mesh', {
    bases: kubernetes.pods
      .filter(bases)
      .filter(runningPods)
      .map(pickIp)
      .map(addPort),
    host: kubernetes.myip,
    port: 39000
  })

  const Hapi = require('hapi')

  const server = new Hapi.Server()
  server.connection({
    host: kubernetes.myip,
    port: 3000
  })

  server.start((err) => {
    if(err) {
      throw err
    }
    console.log('server running at port 3000')
  })
  server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      seneca.act({cmd: 'test', action: 'hello'}, function (err, response) {
        if (err) {
          return reply(err)
        }
        reply(response)
      })
    }
  })

})
