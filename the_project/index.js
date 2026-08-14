import { fastify } from "fastify"

const app = fastify()

const port = process.env.PORT
if (!port) throw new Error("Please specify a port")

app.listen({
    port
}, () => {
    console.log(`Server started in port ${port}`)
})