// @ts-check

import { createServer } from "node:http"
import pg from "pg"

const { Client } = pg
const port = process.env.PORT ?? 3000
const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD
})

await client.connect()
await client.query(`
    CREATE TABLE IF NOT EXISTS pong_count (
        id INTEGER PRIMARY KEY,
        count INTEGER NOT NULL
    )
`)
await client.query(`
    INSERT INTO pong_count (id, count)
    VALUES (1, 0)
    ON CONFLICT (id) DO NOTHING
`)

async function getPongCount() {
    const result = await client.query(
        "SELECT count FROM pong_count WHERE id = 1"
    )

    return result.rows[0].count
}

async function incrementPongCount() {
    const result = await client.query(`
        UPDATE pong_count
        SET count = count + 1
        WHERE id = 1
        RETURNING count
    `)

    return result.rows[0].count
}

let counter = await getPongCount()
console.log("Loaded pong count", counter)

const server = createServer(async (req, res) => {
    console.log("REQ URL", req.url)

    try {
        if (req.url === "/pingpong") {
            counter = await incrementPongCount()
            res.writeHead(200, { "content-type": "text/plain" })
            res.end(`pong ${counter}`)
            return
        }

        if (req.url === "/pings") {
            res.writeHead(200, { "content-type": "text/plain" })
            res.end(counter.toString())
            return
        }

        res.writeHead(404)
        res.end()
    }
    catch (error) {
        console.error("Database operation failed", error)
        res.writeHead(500, { "content-type": "text/plain" })
        res.end("Internal server error")
    }
})

function shutdown() {
    server.close(async error => {
        if (error) {
            console.error(error)
            process.exitCode = 1
        }

        await client.end()
    })
}

process.once("SIGTERM", () => shutdown())
process.once("SIGINT", () => shutdown())

server.listen(port)
