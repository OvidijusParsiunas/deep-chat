import { NextFunction, Request, Response } from 'express'
import FormData from 'form-data'
import https from 'https'
import dotenv from 'dotenv'


// Load environment variables
dotenv.config()

// Validate API key
if (!process.env.OPENROUTER_API_KEY) {
    console.warn('Warning: OPENROUTER_API_KEY environment variable is not set. OpenRouter service will not work.')
}

const defaultModel = process.env.OPENROUTER_DEFAULT_MODEL || 'moonshotai/kimi-k2:free'
const defaultImageModel = process.env.OPENROUTER_IMAGE_MODEL || 'qwen/qwen2.5-vl-72b-instruct:free'
console.log(`OpenRouter default model: ${defaultModel}`)
console.log(`OpenRouter default image model: ${defaultImageModel}`)

// Make sure to set the OPENROUTER_API_KEY environment variable in a .env file (create if does not exist)
// You can also set OPENROUTER_BASE_URL to use a custom base URL (defaults to https://openrouter.ai/api/v1)

export class OpenRouter {
    private static readonly BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';

    public static async chat(inReq: Request, res: Response, next: NextFunction) {
        const body = inReq.body //OpenRouter.createChatBody(inReq)
        const isImg = JSON.stringify(body).includes('image_url')
        body.model = body.model || (isImg ? defaultImageModel : defaultModel)

        // console.log(JSON.stringify(chatBody))
        const req = https.request(
            `${OpenRouter.BASE_URL}/chat/completions`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'HTTP-Referer': process.env.OPENROUTER_HTTP_REFERER || 'http://localhost:3000',
                    'X-Title': process.env.OPENROUTER_X_TITLE || 'Deep Chat',
                },
            },
            (reqResp) => {
                let data = ''
                reqResp.on('error', next) // forwarded to error handler middleware in ErrorUtils.handle
                reqResp.on('data', (chunk) => {
                    data += chunk
                })
                reqResp.on('end', () => {
                    try {
                        const result = JSON.parse(data)
                        if (result.error) {
                            next(result.error) // forwarded to error handler middleware in ErrorUtils.handle
                        } else {
                            // Sends response back to Deep Chat using the Response format:
                            // https://deepchat.dev/docs/connect/#Response
                            res.json({ text: result.choices[0].message.content })
                        }
                    } catch (error) {
                        next(error) // Handle JSON parsing errors
                    }
                })
            }
        )
        req.on('error', next) // forwarded to error handler middleware in ErrorUtils.handle
        // Send the chat request to OpenRouter
        req.write(JSON.stringify(body))
        req.end()
    }

    public static async chatStream(inReq: Request, res: Response, next: NextFunction) {
        const { body } = inReq // OpenRouter.createChatBody(inReq, true)
        const req = https.request(
            `${OpenRouter.BASE_URL}/chat/completions`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'HTTP-Referer': process.env.OPENROUTER_HTTP_REFERER || 'http://localhost:3000',
                    'X-Title': process.env.OPENROUTER_X_TITLE || 'Deep Chat',
                },
            },
            (streamResp) => {
                streamResp.on('error', next) // forwarded to error handler middleware in ErrorUtils.handle
                streamResp.on('data', (chunk) => {
                    try {
                        if (chunk?.toString().match(/^\{\n\s+\"error\"\:/)) {
                            console.error('Error in the retrieved stream chunk:')
                            return next(JSON.parse(chunk?.toString()).error) // forwarded to error handler middleware in ErrorUtils.handle
                        }
                        const lines = chunk?.toString()?.split('\n') || []
                        const filteredLines = lines.filter((line: string) => line.trim())
                        filteredLines.forEach((line: string) => {
                            const data = line.toString().replace('data:', '').replace('[DONE]', '').replace('data: [DONE]', '').trim()
                            if (data) {
                                try {
                                    const result = JSON.parse(data)
                                    if (result.choices[0].delta?.content) {
                                        // Sends response back to Deep Chat using the Response format:
                                        // https://deepchat.dev/docs/connect/#Response
                                        res.write(`data: ${JSON.stringify({ text: result.choices[0].delta.content })}\n\n`)
                                    }
                                } catch (e) { } // sometimes OpenRouter sends incomplete JSONs that you don't need to use
                            }
                        })
                    } catch (error) {
                        console.error('Error when retrieving a stream chunk')
                        return next(error) // forwarded to error handler middleware in ErrorUtils.handle
                    }
                })
                streamResp.on('end', () => {
                    res.end()
                })
                streamResp.on('abort', () => {
                    res.end()
                })
            }
        )
        req.on('error', next) // forwarded to error handler middleware in ErrorUtils.handle
        // Send the chat request to OpenRouter
        req.write(JSON.stringify(body))
        req.end()
    }

    // Note: OpenRouter supports image generation through various models
    // This method uses the image generation endpoint
    public static async imageGeneration(req: Request, res: Response, next: NextFunction) {
        const generationBody = {
            model: req.body.model || defaultImageModel,
            prompt: req.body.prompt || 'A beautiful landscape',
            n: 1,
            size: req.body.size || '1024x1024',
            response_format: 'url',
        }

        const apiReq = https.request(
            `${OpenRouter.BASE_URL}/images/generations`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + process.env.OPENROUTER_API_KEY,
                    'HTTP-Referer': process.env.OPENROUTER_HTTP_REFERER || 'http://localhost:3000',
                    'X-Title': process.env.OPENROUTER_X_TITLE || 'Deep Chat',
                },
            },
            (apiResp) => {
                let data = ''
                apiResp.on('error', next)
                apiResp.on('data', (chunk) => {
                    data += chunk
                })
                apiResp.on('end', () => {
                    try {
                        const result = JSON.parse(data)
                        if (result.error) {
                            next(result.error)
                        } else {
                            // Sends response back to Deep Chat using the Response format:
                            // https://deepchat.dev/docs/connect/#Response
                            res.json({ files: [{ type: 'image', src: result.data[0].url }] })
                        }
                    } catch (error) {
                        next(error)
                    }
                })
            }
        )
        apiReq.on('error', next)
        apiReq.write(JSON.stringify(generationBody))
        apiReq.end()
    }

    // Method to list available models from OpenRouter
    public static async listModels(req: Request, res: Response, next: NextFunction) {
        const apiReq = https.request(
            `${OpenRouter.BASE_URL}/models`,
            {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + process.env.OPENROUTER_API_KEY,
                },
            },
            (apiResp) => {
                let data = ''
                apiResp.on('error', next)
                apiResp.on('data', (chunk) => {
                    data += chunk
                })
                apiResp.on('end', () => {
                    try {
                        const result = JSON.parse(data)
                        if (result.error) {
                            next(result.error)
                        } else {
                            res.json(result)
                        }
                    } catch (error) {
                        next(error)
                    }
                })
            }
        )
        apiReq.on('error', next)
        apiReq.end()
    }
}
