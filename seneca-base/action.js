'use strict'

const Seneca = require('seneca')

const seneca = Seneca()

.add({cmd: 'test', action: 'hello'}, function (msg, done) {
  done(null, {answer: 'aloha!'})
})

.use('kubernetes')

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
    port: 39000,
    base: true,
    pin: 'cmd:test',
    host: kubernetes.myip,
    bases: kubernetes.pods
      .filter(bases)
      .filter(runningPods)
      .map(pickIp)
      .map(addPort)
  })

  console.log('Seneca up and running')
})