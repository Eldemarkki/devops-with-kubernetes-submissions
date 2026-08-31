// @ts-check

import { readFileSync, writeFileSync } from "node:fs"
import { createServer } from "node:http"

const port = process.env.PORT ?? 3000
const path = process.env.PONG_PATH

if (path == null) throw new Error("Define pong path")

function getPongCount() {
    if (path == null) throw new Error("Define pong path")
    try {
        const pongFileContent = readFileSync(path)
        const pongCount = parseInt(pongFileContent.toString(), 10)
        return pongCount
    }
    catch (e) {
        console.error(e)
        return 0
    }
}

let counter = getPongCount()
console.log("Loaded pong count", counter)

const server = createServer((req, res) => {
    console.log("REQ URL", req.url)
    if (req.url === "/pingpong") {

        res.writeHead(200, {
            "content-type": "text/plain"
        })

        counter++
        writeFileSync(path, counter.toString())
        res.end(`pong ${counter}`)
        return
    }
    else if (req.url === "/pings") {
        res.writeHead(200, {
            "content-type": "text/plain"
        })

        res.end(counter.toString())
        return
    }

    res.writeHead(404)
    res.end()
})

function shutdown() {
    server.close(error => {
        if (error) {
            console.error(error)
            process.exitCode = 1
        }
    })
}

process.once("SIGTERM", () => shutdown())
process.once("SIGINT", () => shutdown())

server.listen(port)
