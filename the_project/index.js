import { fastify } from "fastify"
import fastifyStatic from "@fastify/static"
import path from "node:path"

const port = process.env.PORT
if (!port) throw new Error("Please specify a port")

const app = fastify()

app.register(fastifyStatic, {
    root: path.join(import.meta.dirname, "static"),
})

app.listen({
    port,
    host: "0.0.0.0"
}, () => {
    console.log(`Server started in port ${port}`)
})
