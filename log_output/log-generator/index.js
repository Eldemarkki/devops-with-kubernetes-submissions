import { randomUUID } from "node:crypto"
import { appendFile } from "node:fs/promises"

const path = process.env.LOG_PATH
const randomString = randomUUID()

while (true) {
    const timestamp = new Date().toISOString()

    appendFile(path, `${timestamp}: ${randomString}\n`)

    await new Promise(r => setTimeout(r, 5000))
}