<template>
  <div id="app">
    <img src="./assets/logo.png">
    <h1>Minds Online Class</h1>
    <h2>Student</h2>
    <div class="chat">
      <div class="chat__box">

      </div>
      <div class="chat__users">

      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {

    }
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
    flex-basis: 70%;
  }
  &__users {
    border: 2px solid gray;
    border-left: 1px solid gray;
    border-radius: 0px 25px 25px 0px;
    flex-basis: 30%;
  }
}

</style>
