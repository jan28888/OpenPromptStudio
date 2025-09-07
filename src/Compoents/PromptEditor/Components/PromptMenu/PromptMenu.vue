<!-- Created on 2023/03/24 - 22:14 -->
<template>
    <div class="PromptMenu" ref="menu" v-show="show">
        <button @click="doCopy"><Icon icon="radix-icons:clipboard-copy" /> 复制</button>
        <button @click="doEdit"><Icon icon="radix-icons:pencil-2" /> 编辑</button>
        <button @click="doEditLang"><Icon icon="cil:language" /> 编辑译文</button>
        <button @click="doInsertToNotion" :class="{ 'notion-exists': notionPageExists }">
            <Icon icon="logos:notion-icon" /> 
            {{ notionPageExists ? '已在 Notion 中' : '插入到 Notion' }}
        </button>
        <button @click="doDeleteFromNotion" v-if="notionPageExists" class="delete-notion">
            <Icon icon="radix-icons:trash" /> 从 Notion 删除
        </button>
        <button @click="doDelete"><Icon icon="radix-icons:trash" /> 删除</button>
        
    </div>
</template>
<style lang="scss">
.PromptMenu {
    position: fixed;
    display: flex;
    flex-direction: column;
    width: 170px;
    background: #000000cf;
    backdrop-filter: blur(20px);
    border-radius: 4px;
    box-shadow: 0 2px 3px #0000004f, 0 8px 8px #00000014;
    max-width: 200px;
    z-index: 100;
    overflow: hidden;

    .button-list {
        border-top: 1px solid #5a5a5a;
        display: flex;
        flex-direction: column;
    }

    button {
        --bk-color: transparent;
        color: #bcbece;
        place-content: flex-start;
        display: flex;
        text-shadow: none;
        place-items: center;
        .iconify {
            margin-right: 10px;
            font-size: 1.2em;
        }
        &:hover {
            --bk-color: #cac2ff26;
            color: #ffffffe8;
        }
        &:active {
            --bk-color: #00000024;
            color: rgba(138, 134, 134, 0.91);
        }

        &.notion-exists {
            color: #4ade80;
            border-left: 3px solid #4ade80;
        }

        &.delete-notion {
            color: #f87171;
            border-left: 3px solid #f87171;
        }
    }
}

.PromptMenu-ghost {
    position: fixed;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
}
</style>
<script>
import { useClipboard, useStorage } from "@vueuse/core"
let { copy } = useClipboard({ legacy: true })

// 使用与 PromptDict 相同的配置管理方式
const apiKey = useStorage("ops-notion-apiKey", "")
const databaseId = useStorage("ops-notion-databaseId", "")
export default {
    mounted() {
        this.$nextTick(() => {})
        document.addEventListener("mousedown", (e) => {
            if (this.show) {
                if (!this.$el.contains(e.target)) this.close()
            }
        })
        
    },
    data() {
        return {
            show: false,
            bindEl: null,
            clickW: 0,
            promptList: null,
            item: null,
            notionPageExists: false,
            notionPageId: null,
        }
    },
    methods: {
        doCopy() {
            this.close()
            copy(this.item.data.word.rawText)
        },
        doEdit() {
            this.close()
            this.item.state.isEdit = "text"
            this.bindEl.__vue__.doFoucs()
        },
        doEditLang() {
            this.close()
            this.item.state.isEdit = "lang"
            this.bindEl.__vue__.doFoucs()
        },
        doDelete() {
            this.close()
            this.promptList.removePrompt(this.item)
            this.bindEl.__vue__.$emit("update")
        },
        async doInsertToNotion() {
            this.close()
            try {
                // 获取 Notion 配置
                const notionConfig = this.getNotionConfig()
                
                // 验证配置是否完整
                if (!notionConfig.apiKey || !notionConfig.databaseId) {
                    alert('请先在词典设置中配置 Notion API Key 和 Database ID\n\n配置步骤：\n1. 打开词典设置\n2. 在 Notion 设置中输入 Integration Token 和 Database ID\n3. 点击"连接我的 Notion"测试连接')
                    return
                }

                // 验证 Database ID 格式
                if (notionConfig.databaseId.length !== 32) {
                    alert('Database ID 格式不正确，应该是32位字符\n\n请检查：\n1. 是否复制了完整的 Database ID\n2. 是否包含了多余的空格或字符')
                    return
                }

                // 准备要插入的数据
                const promptData = {
                    text: this.item.data.word.rawText,
                    lang_zh: this.item.data.word.langText || '',
                    subType: this.item.data.word.subType || '普通',
                    dir: this.item.data.word.dir || '',
                    desc: this.item.data.word.desc || '',
                    source: 'local'
                }


                // 调用插入到 Notion 的 API
                const { useDatabaseServer } = await import('../../Lib/DatabaseServer/DatabaseServer')
                const databaseServer = useDatabaseServer()
                const result = await databaseServer.insertToNotion(notionConfig, promptData)
                
                // 更新状态
                this.notionPageExists = true
                this.notionPageId = result.id
                
                // 更新当前项目的来源标记
                this.item.data.word.source = 'notion'
                
                alert('成功插入到 Notion！')
            } catch (error) {
                console.error('插入到 Notion 失败:', error)
                let errorMessage = '插入到 Notion 失败: ' + error.message
                
                // 提供更友好的错误提示
                if (error.message.includes('unauthorized')) {
                    errorMessage += '\n\n可能的原因：\n1. API Key 不正确\n2. 数据库没有共享给集成应用'
                } else if (error.message.includes('not_found')) {
                    errorMessage += '\n\n可能的原因：\n1. Database ID 不正确\n2. 数据库不存在或已被删除'
                } else if (error.message.includes('validation_error')) {
                    errorMessage += '\n\n可能的原因：\n1. 数据库字段结构不匹配\n2. 必填字段缺失'
                }
                
                alert(errorMessage)
            }
        },
        async doDeleteFromNotion() {
            this.close()
            try {
                if (!this.notionPageId) {
                    alert('无法找到 Notion 页面 ID')
                    return
                }

                // 获取 Notion 配置
                const notionConfig = this.getNotionConfig()
                
                // 验证配置是否完整
                if (!notionConfig.apiKey || !notionConfig.databaseId) {
                    alert('请先在词典设置中配置 Notion API Key 和 Database ID')
                    return
                }

                // 确认删除
                if (!confirm('确定要从 Notion 中删除这个提示词吗？')) {
                    return
                }

                // 调用删除 API
                const { useDatabaseServer } = await import('../../Lib/DatabaseServer/DatabaseServer')
                const databaseServer = useDatabaseServer()
                await databaseServer.deleteFromNotion(notionConfig, this.notionPageId)
                
                // 更新状态
                this.notionPageExists = false
                this.notionPageId = null
                
                // 更新当前项目的来源标记
                this.item.data.word.source = 'local'
                
                alert('成功从 Notion 中删除！')
            } catch (error) {
                console.error('从 Notion 删除失败:', error)
                alert('从 Notion 删除失败: ' + error.message)
            }
        },
        async checkNotionExistence() {
            try {
                const notionConfig = this.getNotionConfig()
                
                // 如果没有配置，直接返回
                if (!notionConfig.apiKey || !notionConfig.databaseId) {
                    this.notionPageExists = false
                    this.notionPageId = null
                    return
                }

                // 查询 Notion 中是否存在
                const { useDatabaseServer } = await import('../../Lib/DatabaseServer/DatabaseServer')
                const databaseServer = useDatabaseServer()
                const page = await databaseServer.findNotionPage(notionConfig, this.item.data.word.rawText)
                
                if (page) {
                    this.notionPageExists = true
                    this.notionPageId = page.id
                } else {
                    this.notionPageExists = false
                    this.notionPageId = null
                }
            } catch (error) {
                console.error('检查 Notion 存在性失败:', error)
                this.notionPageExists = false
                this.notionPageId = null
            }
        },
        getNotionConfig() {
            // 使用响应式配置，确保与 PromptDict 同步
            return { 
                apiKey: apiKey.value, 
                databaseId: databaseId.value 
            }
        },
        async open({ item, el, event, promptList }) {
            this.bindEl = el
            this.clickW = event.clientX
            this.show = true
            this.item = item
            this.promptList = promptList
            this.updatePosition()
            
            // 检查是否已在 Notion 中存在
            await this.checkNotionExistence()
        },
        close() {
            this.show = false
        },
        updatePosition() {
            if (this.bindEl) {
                let elMenu = this.$refs.menu
                if (elMenu) {
                    let menuW = elMenu.getBoundingClientRect().width
                    let rect = this.bindEl.getBoundingClientRect()
                    elMenu.style.left = `${this.clickW - menuW / 2}px`
                    elMenu.style.top = `${rect.y + rect.height}px`
                }
            }
        },
    },
    computed: {},
    beforeDestroy() {},
}
</script>
