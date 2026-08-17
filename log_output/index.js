import { createServer } from "node:http"
import { randomUUID } from "node:crypto"

const port = process.env.PORT ?? 3000
const randomString = randomUUID()

const server = createServer((req, res) => {
    res.writeHead(200, {
        "content-type": "application/json"
    })
    res.end(JSON.stringify({
        timestamp: new Date().toISOString(),
        randomString
    }))
})

server.listen(port)

while (true) {
    const timestamp = new Date().toISOString()
    console.log(`${timestamp}: ${randomString}`)
    await new Promise(r => setTimeout(r, 5000))
}