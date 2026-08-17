import { readFile, readFileSync } from "node:fs"
import { createServer } from "node:http"

const path = process.env.LOG_PATH
const port = process.env.PORT ?? 3000

const server = createServer((req, res) => {
    res.writeHead(200, {
        "content-type": "text/plain"
    })

    const fileContent = readFileSync(path)
    res.end(fileContent)
})

server.listen(port)