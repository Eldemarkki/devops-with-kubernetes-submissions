// @ts-check

import { fastify } from "fastify"

const port = process.env.PORT
if (!port) throw new Error("Please specify a port")

const app = fastify()

/** @typedef {{ id: string, text: string }} Todo */

/** @type {Todo[]} */
const todos = []

/**
 * @param {unknown} value
 * @returns {value is Todo}
 */
function isTodo(value) {
    return typeof value === "object"
        && value !== null
        && "id" in value
        && typeof value.id === "string"
        && "text" in value
        && typeof value.text === "string"
}

app.get("/todos", async (req, res) => {
    res.send(todos)
})

app.post("/todos", async (req, res) => {
    if (!isTodo(req.body)) {
        return res.status(400).send({ error: "Invalid todo" })
    }

    const data = req.body

    todos.push(data)
    return res.status(201).send()
})

async function shutdown() {
    try {
        await app.close()
    }
    catch (error) {
        console.error(error)
        process.exitCode = 1
    }
}

process.once("SIGTERM", () => shutdown())
process.once("SIGINT", () => shutdown())

app.listen({
    port: parseInt(port, 10),
    host: process.env.HOST
}, () => {
    console.log(`Server started in port ${port}`)
})
