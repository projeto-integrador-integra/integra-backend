import { createApp } from './app'

createApp().then((app) => {
  app.listen(3000, () => {
    console.log('API rodando em http://localhost:3000')
  })
})
