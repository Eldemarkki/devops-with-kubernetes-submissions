import { randomUUID } from "node:crypto"
import { writeFileSync } from "node:fs"

const path = process.env.LOG_PATH
const randomString = randomUUID()
let running = true

function shutdown() {
    running = false
}

process.once("SIGTERM", () => shutdown())
process.once("SIGINT", () => shutdown())

while (running) {
    const timestamp = new Date().toISOString()

    writeFileSync(path, `${timestamp}: ${randomString}`)

    await new Promise(resolve => setTimeout(resolve, 5000))
}
