import { readFileSync } from "node:fs"
import { createServer } from "node:http"

const path = process.env.LOG_PATH
const pongPath = process.env.PONG_PATH

const port = process.env.PORT ?? 3000

function getPongCount() {
    try {
        const pongFileContent = readFileSync(pongPath)

        const pongCount = parseInt(pongFileContent.toString(), 10)

        return pongCount
    }
    catch {
        return 0
    }
}

const server = createServer((req, res) => {
    res.writeHead(200, {
        "content-type": "text/plain"
    })

    const fileContent = readFileSync(path)

    const pongCount = getPongCount()
    res.end(`${fileContent}\nPing / Pongs: ${pongCount}`)
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
