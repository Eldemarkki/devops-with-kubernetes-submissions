// @ts-check

import { fastify } from "fastify"
import fastifyStatic from "@fastify/static"
import { mkdir, readFile, stat, writeFile } from "node:fs/promises"
import path from "node:path"

const imageCacheTtlMs = process.env.IMAGE_CACHE_TTL_MS
if (imageCacheTtlMs == null) throw new Error("IMAGE_CACHE_TTL_MS environment variable must be defined")
const IMAGE_CACHE_TTL_MS = Number(imageCacheTtlMs)
if (!Number.isFinite(IMAGE_CACHE_TTL_MS) || IMAGE_CACHE_TTL_MS <= 0) {
    throw new Error("IMAGE_CACHE_TTL_MS environment variable must be a positive number")
}

const IMAGE_CACHE_ROOT = process.env.IMAGE_CACHE_ROOT
if (IMAGE_CACHE_ROOT == null) throw new Error("IMAGE_CACHE_ROOT environment variable must be defined")

const IMAGE_URL = process.env.IMAGE_URL
if (IMAGE_URL == null) throw new Error("IMAGE_URL environment variable must be defined")

const port = process.env.PORT
if (!port) throw new Error("Please specify a port")

const IMAGE_CACHE_PATH = path.join(IMAGE_CACHE_ROOT, ".image-cache")
const IMAGE_CACHE_METADATA_PATH = path.join(IMAGE_CACHE_ROOT, ".image-cache.json")

const app = fastify()

app.register(fastifyStatic, {
    root: path.join(import.meta.dirname, "static"),
})

/** @type {number | null} */
let lastImageFetchTime = null

/** @type {Buffer | null} */
let lastImage = null

let lastImageContentType = "application/octet-stream"

async function loadCachedImage() {
    try {
        const [image, metadata, imageStats] = await Promise.all([
            readFile(IMAGE_CACHE_PATH),
            readFile(IMAGE_CACHE_METADATA_PATH, "utf8"),
            stat(IMAGE_CACHE_PATH),
        ])
        const { contentType } = JSON.parse(metadata)

        lastImage = image
        lastImageContentType = typeof contentType === "string" ? contentType : lastImageContentType
        lastImageFetchTime = imageStats.mtimeMs
    }
    catch (error) {
        if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error
    }
}

await mkdir(IMAGE_CACHE_ROOT, { recursive: true })
await loadCachedImage()

app.get("/image", async (req, res) => {
    if (lastImageFetchTime == null || (Date.now() - lastImageFetchTime) > IMAGE_CACHE_TTL_MS) {
        const imageResponse = await fetch(IMAGE_URL)
        lastImage = Buffer.from(await imageResponse.arrayBuffer())
        lastImageContentType = imageResponse.headers.get("content-type") ?? "application/octet-stream"
        await Promise.all([
            writeFile(IMAGE_CACHE_PATH, lastImage),
            writeFile(IMAGE_CACHE_METADATA_PATH, JSON.stringify({ contentType: lastImageContentType })),
        ])
        lastImageFetchTime = Date.now()
    }

    if (lastImage == null) throw new Error("Image cache is empty")

    return res.type(lastImageContentType).send(lastImage)
})

async function shutdown() {
    try {
        await app.close()
    }
    catch (error) {
        console.error(error)
        process.exitCode = 1
    }
}

process.once("SIGTERM", () => shutdown())
process.once("SIGINT", () => shutdown())

app.listen({
    port: parseInt(port, 10),
    host: process.env.HOST
}, () => {
    console.log(`Server started in port ${port}`)
})
