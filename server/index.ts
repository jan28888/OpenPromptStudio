// @ts-ignore
import express from "express"
// @ts-ignore
import cors from "cors"
import * as dotenv from "dotenv"
import { translate } from "./translate"
dotenv.config()
const app = express()

app.use(express.json())
app.use(cors())

app.post("/prompt-studio/translate/prompts", async (req: any, res: any) => {
    let input: { words: string[]; to: string } = req.body
    let orgText = input.words.join("\n")
    const finText = await translate({ text: orgText, to: input.to ?? "zh-cn", server: "tencent" })

    if (finText) {
        let words = finText.split("\n")
        res.json(words)
    } else {
        res.json([])
    }
})

// Notion 删除 API
app.post("/api/notion/delete", async (req: any, res: any) => {
    try {
        const { apiKey, pageId } = req.body
        
        if (!apiKey || !pageId) {
            return res.status(400).json({ error: 'Missing apiKey or pageId' })
        }

        const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                archived: true
            })
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return res.status(response.status).json({ 
                error: `HTTP ${response.status}: ${errorData.message || response.statusText}` 
            })
        }

        const result = await response.json()
        res.json(result)
    } catch (error: any) {
        console.error('Notion delete error:', error)
        res.status(500).json({ error: error.message || 'Internal server error' })
    }
})

const port = 39011
app.listen(port, () => {
    console.log(`translate server started on port ${port}`)
})
