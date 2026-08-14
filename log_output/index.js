import { randomUUID } from "node:crypto"

const randomString = randomUUID()

while (true) {
    const timestamp = new Date().toISOString()
    console.log(`${timestamp}: ${randomString}`)
    await new Promise(r => setTimeout(r, 5000))
}