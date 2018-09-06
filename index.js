const app = require('express')(),
      serveStatic = require('serve-static'),
      path = require('path')

const PORT = process.env.PORT?process.env.PORT:'8081'

app.use(serveStatic(__dirname))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}.`)
})
