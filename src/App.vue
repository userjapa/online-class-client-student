<template>
  <div id="app">
    <img src="./assets/logo.png">
    <h1>Minds Online Class</h1>
    <h2>Student</h2>
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
            <button type="button" name="cancel" @click="emitCancel(teacher.id)" v-if="(busy && teacher.busy) && (teacher.id === calling)">Cancel</button>
            <button type="button" name="call" @click="call(teacher)" :disabled="teacher.busy || busy" v-else>Call</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client'

// const socket = io.connect('http://localhost:8000')
const socket = io.connect('https://online-class-server.herokuapp.com/')

const PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection

const SessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitSessionDescription

export default {
  name: 'app',
  data () {
    return {
      teachers: [],
      called: false,
      received: false,
      busy: false,
      pc: null,
      stream: null,
      calling: ''
    }
  },
  methods: {
    call (teacher) {
      console.log('Calling')
      this.busy = true
      socket.emit('make_call', teacher.id)
      this.calling = teacher.id
    },
    emitCancel (id) {
      console.log('Canceling')
      if (this.called && this.received) {
        socket.emit('hangup', id)
        this.cancel()
      } else {
        socket.emit('cancel_call', id)
      }
    },
    cancel () {
      const tracks = this.stream.getTracks()
      for (const track of tracks) {
        track.stop()
      }
      this.$refs['guest'].srcObject = null
      this.$refs['you'].srcObject = null
      this.busy = false
      this.received = false
      this.called = false
      this.calling = ''
    },
    async makeOffer (id) {
      try {
        console.log('Making Offer')
        if (!this.called) {
          const offer = await this.pc.createOffer()
          this.offer = offer
          await this.pc.setLocalDescription(new SessionDescription(offer))
          socket.emit('make_offer', {
            offer: offer,
            to: id
          })
          this.called = true
        }
      } catch (error) {
        alert('Failed to Make Offer!')
        console.warn(error)
      }
    },
    setPeerConnection () {
      this.pc = new PeerConnection({ iceServers: [{ url: 'stun:stun.services.mozilla.com' }]})
      this.pc.onaddstream = (track) => {
        console.log('Student added stream PC')
        this.$refs['guest'].srcObject = track.stream
      }
    }
  },
  mounted () {
    // Socket Events
    socket.on('connect', () => {
      console.log(`Student connected!`)
      socket.emit('connect_user', { user: 'student', name: 'Student Test' })
    })
    socket.on('teachers_update', teachers => {
      this.teachers = teachers
    })
    socket.on('offer_made', async data => {
      try {
        console.log('Offer Made')
        await this.pc.setRemoteDescription(new SessionDescription(data.offer))
        const answer = await this.pc.createAnswer()
        await this.pc.setLocalDescription(new SessionDescription(answer))
        console.log('Making Answer');
        socket.emit('make_answer', {
          answer: answer,
          to: data.socket
        })
      } catch (error) {
        alert('Failed to Make Answer!')
        console.warn(error)
      }
    })
    socket.on('answer_made', async data => {
      try {
        console.log('Answer Made')
        await this.pc.setRemoteDescription(new SessionDescription(data.answer))
        if (!this.received) {
          this.makeOffer(data.socket)
          this.received = true
        }
      } catch (error) {
        alert('Failed to accept Answer!')
        console.warn(error)
      }
    })
    socket.on('call_answered', async id => {
      try {
        console.log('Call Answered')
        this.setPeerConnection()
        const media = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        this.stream = media
        this.$refs['you'].srcObject = media
        this.pc.addStream(media)
        await this.makeOffer(id)
      } catch (error) {
        alert(`Failed to Call Teacher!`)
        console.warn(error)
      }
    })
    socket.on('call_rejected', () => {
      console.log('Call Rejected')
      this.busy = false
      alert('Rejected!')
    })
    socket.on('end_call', () => {
      console.log('Call ended')
      this.cancel()
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
