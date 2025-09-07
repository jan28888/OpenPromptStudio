import { fetchFromNotion } from "./lib/fetchFromNotion"
import { insertToNotion, deleteFromNotion, findNotionPage, INotionInsertData, INotionPage } from "./lib/insertToNotion"

export interface IPromptDefineItem {
    text: string
    subType?: string
    desc?: string
    dir?: string
    lang_zh?: string
    sampleCmds?: string[]
    isAlias?: boolean
    tags?: string[]
    source?: 'local' | 'notion' // 添加来源字段
}

export class DatabaseServer {
    localPromptDefineMap: { [key: string]: IPromptDefineItem } = {}
    notionPromptDefineMap: { [key: string]: IPromptDefineItem } = {}
    isReady: null | Promise<boolean> = null
    constructor() {}
    async ready() {
        if (this.isReady != null) return this.isReady
        this.isReady = this.init()
        return this.isReady
    }
    async init() {
        // localJson
        let localPromptDescMap = await (await fetch("./localPromptDefineMap.json")).json()
        // console.log('localPromptDescMap',localPromptDescMap)
        this.localPromptDefineMap = localPromptDescMap
        return true
    }
    async queryPromptsDefine(prompts: string[]): Promise<IPromptDefineItem[]> {
        await this.ready()
        let reuslt = []
        for (let prompt of prompts) {
            let re = this.localPromptDefineMap[prompt?.toLowerCase()]
            if (re) {
                reuslt.push(re)
            } else {
                reuslt.push(null)
            }
        }
        return <any>reuslt
    }

    async getPromptsDefine(options?: { onlyMyNotion?: boolean }) {
        await this.ready()
        if (options?.onlyMyNotion) {
            return this.notionPromptDefineMap
        } else {
            return this.localPromptDefineMap
        }
    }

    async fetchNotion(options: { apiKey: string; databaseId: string }) {
        console.log("fetchNotion options", options)
        let { defineMap, me } = await fetchFromNotion(options)
        this.notionPromptDefineMap = defineMap
        Object.assign(this.localPromptDefineMap, defineMap)
        return { defineMap, me }
    }

    async insertToNotion(options: { apiKey: string; databaseId: string }, data: INotionInsertData) {
        console.log("insertToNotion options", options, "data", data)
        return await insertToNotion(options, data)
    }

    async deleteFromNotion(options: { apiKey: string; databaseId: string }, pageId: string) {
        console.log("deleteFromNotion options", options, "pageId", pageId)
        return await deleteFromNotion(options, pageId)
    }

    async findNotionPage(options: { apiKey: string; databaseId: string }, text: string): Promise<INotionPage | null> {
        console.log("findNotionPage options", options, "text", text)
        return await findNotionPage(options, text)
    }
}

let databaseServer: DatabaseServer
export function useDatabaseServer() {
    if (!databaseServer) databaseServer = new DatabaseServer()
    return databaseServer
}
