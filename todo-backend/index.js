// @ts-check

import { fastify } from "fastify"
import pg from "pg"

const port = process.env.PORT
if (!port) throw new Error("Please specify a port")

const app = fastify({
    logger: true
})

// https://fastify.dev/docs/latest/Reference/Logging/#advanced-logger-configuration
app.addHook('preHandler', function (req, reply, done) {
    if (req.body) {
        req.log.info({ body: req.body }, 'parsed body')
    }
    done()
})

/** @typedef {{ id: string, text: string }} Todo */

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

const { Client } = pg
const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD
})

await client.connect()
await client.query(`
    CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL
    )
`)

app.get("/todos", async (req, res) => {
    const result = await client.query(
        "SELECT id, text FROM todos"
    )

    return res.send(result.rows)
})

app.post("/todos", async (req, res) => {
    if (!isTodo(req.body)) {
        return res.status(400).send({ error: "Invalid todo" })
    }

    const data = req.body

    if (data.text.length > 140) {
        return res.status(400).send({ error: "Text must be 140 characters or less" })
    }

    await client.query(
        "INSERT INTO todos (id, text) VALUES ($1, $2)",
        [data.id, data.text]
    )

    return res.status(201).send()
})

async function shutdown() {
    try {
        await app.close()
        await client.end()
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
