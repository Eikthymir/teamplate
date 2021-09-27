import mqtt from 'mqtt/dist/mqtt.js'
import store from '@/vuex/store'

/**
 *  MQTT连接
 * @param { Object } data mqtt参数
 */
export default new (class {
  constructor() {
    this.client = null
  }

  init(data) {
    const { GroupId, topic, username, token, host } = data
    const { state, commit } = store
    const clientId = GroupId + state.userData.id
    const opt = {
      clientId,
      username,
      keepalive: 30,
      protocolId: 'MQTT',
      protocolVersion: 4,
      password: token,
      reconnectPeriod: 5000
    }
    const protocol = typeof plus !== 'undefined' ? 'wx' : 'ws'
    let client = this.client
    //保险起见，先关闭再打开
    if (this.client) {
      client.end()
    }
    client = mqtt.connect(`${protocol}://${host}`, opt)
    this.client = client
    // commit('updateMQTT', client)

    client.on('connect', function (res) {
      console.log('mqtt连接成功...' + JSON.stringify(res))
      client.subscribe(topic, function (err) {
        if (!err) {
          console.log('订阅成功', topic)
        }
      })
      commit('updateMqttStatus', 'success')
    })

    client.on('reconnect', function () {
      console.log('mqtt重新连接中...')
      commit('updateMqttStatus', '')
    })

    client.on('close', function () {
      console.log('mqtt连接中断...')
      commit('updateMqttStatus', 'lost')
      // client.reconnect()
    })

    client.on('error', function (res) {
      console.log('mqtt连接失败' + JSON.stringify(res))
      commit('updateMqttStatus', 'fail')
      client.reconnect()
    })

    return client
  }
})()
