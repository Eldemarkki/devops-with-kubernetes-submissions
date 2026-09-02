const { randomUUID } = require("node:crypto")

const wikipediaRandomUrl = process.env.WIKIPEDIA_RANDOM_URL
const todoBackendUrl = process.env.TODO_BACKEND_URL

async function main() {
    const wikipediaResponse = await fetch(wikipediaRandomUrl, {
        redirect: "manual",
    })

    const location = wikipediaResponse.headers.get("location")
    const articleUrl = new URL(location, wikipediaRandomUrl).href
    await fetch(todoBackendUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            id: randomUUID(),
            text: `Read ${articleUrl}`,
        }),
    })
}

main()
