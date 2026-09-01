import { readFileSync } from "node:fs"
import { createServer } from "node:http"

const logPath = process.env.LOG_PATH
const configPath = process.env.CONFIG_PATH
const message = process.env.MESSAGE

const port = process.env.PORT ?? 3000

async function getPongCount() {
    try {
        const res = await fetch("http://pingpong-svc:2347/pings")
        const text = await res.text()
        const pongCount = parseInt(text, 10)
        return pongCount
    }
    catch {
        return 0
    }
}

const server = createServer(async (req, res) => {
    res.writeHead(200, {
        "content-type": "text/plain"
    })

    const configFileContent = readFileSync(configPath)
    const logFileContent = readFileSync(logPath)

    const pongCount = await getPongCount()
    const rows = [
        `file content: ${configFileContent}`,
        `env variable: MESSAGE=${message}`,
        logFileContent,
        `Ping / Pongs: ${pongCount}`
    ]
    
    res.end(rows.join("\n"))
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
