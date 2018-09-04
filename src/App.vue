<template>
  <div id="app">
    <img src="./assets/logo.png">
    <h1>Minds Online Class</h1>
    <h2>Student</h2>
    <button type="button" name="cacel" @click="cancel()">Cancel</button>
    <div class="chat">
      <div class="chat__box">
        <div class="chat__box__video">
          <video ref="you" autoplay muted/>
        </div>
        <div class="chat__box__video">
          <video ref="guest" autoplay/>
        </div>
      </div>
      <div class="chat__users">
        <div class="chat__users__teacher" v-for="teacher in teachers">
          <div class="chat__users__teacher__title">
            <span>{{ teacher.name }}</span>
          </div>
          <div class="chat__users__teacher__call">
            <button type="button" name="call" @click="call(teacher)" :disabled="teacher.busy">Call</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client'

const socket = io.connect('http://localhost:8080')

const PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection

const SessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitSessionDescription

export default {
  name: 'app',
  data () {
    return {
      teachers: [],
      offer: null,
      answers: {},
      pc: null,
      stream: null
    }
  },
  methods: {
    async call (teacher) {
      try {
        this.pc = new PeerConnection({ iceServers: [{ url: 'stun:stun.services.mozilla.com' }]})
        this.pc.onaddstream = function (track) {
          this.$refs['guest'].srcObject = track.stream
          this.$refs['guest'].play()
        }
        const media = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        this.stream = media
        this.$refs['you'].srcObject = media
        this.pc.addStream(media)
      } catch (error) {
        alert(`Failed to Call ${teacher.name}!`)
        console.warn(error)
      }
    },
    cancel () {
      for (const track of this.stream.getTracks()) {
        track.stop()
      }
      this.$refs['you'].src = ''
      console.log(this.pc)
    }
  },
  mounted () {
    // Socket Events
    socket.on('connect', () => {
      console.log(`You're connected!`)
      socket.emit('connect_user', { user: 'student', name: 'Student Test' })
    })
    socket.on('teachers_update', teachers => {
      this.teachers = teachers
    })
  }
}
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  border: none;
}

html, body {
  height: 92.5vh;
  width: 100vw;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  height: calc(100% - #{60px});
  position: relative;
}

h1, h2 {
  font-weight: normal;
  margin-bottom: 15px;
}

.chat {
  display: flex;
  height: 100%;
  max-height: calc(50vh - 30px);
  width: calc(95vw - 30px);
  margin: auto;
  border: 2px solid gray;
  border-radius: 25px;
  padding: 15px;
  &__box {
    border: 2px solid gray;
    border-right: 1px solid gray;
    border-radius: 25px 0px 0px 25px;
    padding: 10px;
    flex-basis: calc(70% - #{20px});
    display: flex;
    &__video {
      border: 2px solid gray;
      flex-basis: 50%;
      border-radius: 15px;
      &:first-child {
        margin-right: 5px;
      }
      &:last-child {
        margin-left: 5px;
      }
      video {
        border-radius: 15px;
        width: 100%;
        height: 100%;
      }
    }
  }
  &__users {
    border: 2px solid gray;
    border-left: 1px solid gray;
    border-radius: 0px 25px 25px 0px;
    flex-basis: calc(30% - 20px);
    padding: 10px;
    &__teacher {
      border: 2px solid gray;
      border-radius: 7.5px 25px 25px 7.5px;
      padding: 5px;
      display: flex;
      &:not(:last-child) {
        margin-bottom: 10px;
      }
      &__title {
        flex-basis: calc(70% - #{10px});
        text-align: left;
        padding-left: 10px;
        align-self: center;
      }
      &__call {
        flex-basis: 30%;
        button {
          cursor: pointer;
          background-color: #cecece;
          padding: 5px 20px;
          border: 2px solid transparent;
          border-radius: 5px;
          transition: all .2s ease-out;
          &:hover {
            background-color: white;
            border-color: #cecece;
          }
          &:disabled {
            cursor: not-allowed;
            background-color: #dedede;
            color: #999;
          }
        }
      }
    }
  }
}

</style>
