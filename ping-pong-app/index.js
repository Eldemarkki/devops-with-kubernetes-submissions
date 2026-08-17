import { createServer } from "node:http"

const port = process.env.PORT ?? 3000

let counter = 0
const server = createServer((req, res) => {
    res.writeHead(200, {
        "content-type": "text/plain"
    })
    res.end(`pong ${counter}`)
    counter++
})

server.listen(port)