<!-- Created on 2023/03/31 - 12:10 -->
<template>
    <div class="PromptDict">
        <div class="notion-settings" :class="{ isHoverButton }">
            <button
                class="notion-me"
                @click="doGotoNotionMe"
                @mousemove="setNotionHover(true)"
                @mouseleave="setNotionHover(false)"
            >
                <Icon icon="logos:notion-icon" />
                {{ notionName ?? (loading ? "连接中..." : "连接我的 Notion") }}
            </button>

            <div class="notion-config">
                <div class="help">
                    <Icon icon="ant-design:question-circle-outlined" />
                    <a
                        target="_blank"
                        href="https://github.com/Moonvy/OpenPromptStudio#2-%E5%88%9B%E5%BB%BA%E8%87%AA%E5%B7%B1%E7%9A%84-noiton-%E9%9B%86%E6%88%90%E6%8F%92%E4%BB%B6integrations"
                        >使用方法</a
                    >
                </div>
                <div class="line checkbox">
                    <label for="enableNotion">启用我的 Notion</label>
                    <input id="enableNotion" v-model="enableMyNotion" type="checkbox" />
                </div>
                <div class="line"><label>Integration Token</label> <input v-model="apiKey" type="text" /></div>
                <div class="line" v-tooltip="databaseId">
                    <label>Database ID </label> <input v-model="input_databaseId" type="text" />
                </div>

                <div class="line checkbox">
                    <label for="onlyMyNotion">仅使用此数据库 </label>
                    <input id="onlyMyNotion" v-model="onlyMyNotion" type="checkbox" />
                    <div class="desc">忽略默认词典</div>
                </div>
                <div class="line buttons">
                    <button
                        class="full"
                        :class="{ disabled: !notioConfigActive || loading || !enableMyNotion }"
                        @click="reloadData()"
                    >
                        {{ loading ? "载入中..." : "载入" }}
                    </button>
                </div>
            </div>
        </div>

        <div class="dir-buttons-container" v-if="dict" ref="dirButtonsContainer">
            <div class="dir-buttons" :class="{ 'expanded': dirExpanded }">
                <button v-for="dir in dict" :class="{ active: dir == activeDir }" @click="doChangeActiveDir(dir)">
                    {{ dir.name }}
                </button>
            </div>
            <div v-if="hasOverflow" class="expand-toggle" @click="dirExpanded = !dirExpanded">
                <Icon :icon="dirExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'" />
            </div>
        </div>

        <div class="active-dir" v-if="activeDir">
            <details class="sub-dir" v-for="subDir in activeSubDirs" open :key="subDir.name">
                <summary class="name" v-show="subDir.name != activeDir.name">
                    <span class="title">{{ subDir.name }}</span>
                    <span class="len">{{ subDir.words.length }}</span>
                </summary>
                <div class="list">
                    <div class="item" v-for="word in subDir.words">
                        <PromptItem :item="word" @click="doApplyWord(word)" class="dict-word" />
                    </div>
                </div>
            </details>
        </div>
    </div>
</template>
<style lang="scss">
.PromptDict {
    padding: 0 20px;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .dir-buttons-container {
        position: relative;
        margin: 0 4px;
        margin-bottom: 12px;
    }

    .dir-buttons {
        display: flex;
        flex-wrap: wrap;
        padding: 0 15px 0 0;
        border-radius: 4px;
        overflow: hidden;
        max-height: 36px; /* 默认只显示一行 */
        transition: max-height 0.3s ease;
        flex: none;
        width: auto;
        background: #d5d7ef;
        
        &.expanded {
            max-height: 500px; /* 展开后的最大高度 */
        }
        button {
            background: #d5d7ef;
            color: #4545b2;
            border-radius: 0;
            flex: auto;
            min-width: 72px;
            white-space: nowrap;
            place-content: center;
            height: 36px;
            &.active {
                background: #4545b2;
                color: #d5d7ef;
                text-shadow: 0 1px 1px rgb(49 52 88);
            }
        }
    }
    
    .expand-toggle {
        position: absolute;
        right: 8px;
        bottom: 6px;
        color: #4545b2;
        cursor: pointer;
        z-index: 10;
        background: transparent;
        border: none;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .iconify {
            font-size: 20px;
            opacity: 0.7;
            transition: opacity 0.2s ease;
        }
        
        &:hover .iconify {
            opacity: 1;
        }
    }
    .active-dir {
        height: auto;
        overflow-y: scroll;

        .sub-dir > .name {
            padding: 12px 0;
            font-size: 14px;
            font-weight: bold;
            color: #7e7e7e;
            text-shadow: 0 1px rgba(255, 255, 255, 0.4901960784);
            cursor: pointer;
            user-select: none;
            > .title {
                padding-left: 6px;
            }
            > .len {
                background: #e6e6e6;
                color: #7e7e7eb0;
                border-radius: 4px;
                padding: 1px 8px;
                margin-left: 4px;
                text-align: center;
                display: inline-flex;
                place-content: center;
                font-size: 12px;
                font-weight: normal;
                font-family: "JetBrains Mono";
            }

            &::marker {
                color: rgba(126, 126, 126, 0.5);
            }
        }
        .list {
            display: flex;
            flex-wrap: wrap;
        }
        &::-webkit-scrollbar {
            width: 12px;
            height: 12px;
            background-color: #aaa0;
        }
        &::-webkit-scrollbar-thumb {
            background: #838383;
            border-radius: 29px;
            border: 2px solid #e9e9e9;
        }
    }

    .notion-settings {
        .notion-me {
            position: absolute;
            right: 57px;
            top: 14px;
            font-size: 13px;
            z-index: 222;
            height: 32px;
        }

        .notion-config {
            opacity: 0;
            right: 54px;
            top: 11px;
            /* padding-top: 100px; */
            width: 420px;
            height: auto;
            background: #ffffff;
            position: absolute;
            z-index: 100;
            padding: 20px;
            padding-top: 49px;
            border-radius: 4px;
            box-shadow: -2px 0 64px rgba(6, 5, 73, 0.1215686275);
            transition: all 0.2s ease;
            pointer-events: none;
            .line:not(:last-child) {
                margin-bottom: 8px;
            }
            .help {
                color: #4b4894;
                position: absolute;
                top: 12px;
                display: flex;
                place-items: center;
                .iconify {
                    margin-right: 4px;
                }
                a {
                    font-weight: bold;
                }
            }
            a {
                font-size: 13px;
                color: #4b4894;
                text-decoration: none;
                &:hover {
                    color: #4545b2;
                    text-decoration: underline;
                }
            }
            label {
                display: inline-flex;
                font-size: 13px;
                color: #5a5a5a;
                width: 140px;
                place-content: flex-end;
                white-space: nowrap;
                margin-right: 12px;
            }

            input {
                background: #e9e9e975;
                width: auto;
                flex: auto;
            }

            .full {
                width: auto;
                flex: auto;
                place-content: center;
            }

            .line {
                display: flex;
                place-items: center;
                place-content: flex-start;
            }

            .line.checkbox {
                input {
                    flex: none;
                }
            }
            .desc {
                flex: auto;
                font-size: 13px;
                color: #c9c9c9;
                text-align: right;
            }
            .buttons {
                place-content: center;

                button.disabled {
                    pointer-events: none;
                    opacity: 0.5;
                }
            }
        }

        &.isHoverButton:hover .notion-config,
        .notion-config:hover {
            transition: all 0.2s ease;
            opacity: 1;
            pointer-events: auto;
        }
    }
}
</style>
<script>
import { getDictData } from "./getDictData"
import vPromptItem from "../../Compoents/PromptEditor/Components/PromptItem/PromptItem.vue"
import { useDatabaseServer } from "../PromptEditor/Lib/DatabaseServer/DatabaseServer"
import { useStorage } from "@vueuse/core"
import { debounce } from "lodash"

const apiKey = useStorage("ops-notion-apiKey", "")
const databaseId = useStorage("ops-notion-databaseId", "")
const onlyMyNotion = useStorage("ops-notion-onlyMyNotion", false)
const enableMyNotion = useStorage("ops-notion-enableMyNotion", true)

export default {
    props: {
        searchTerm: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            dict: null,
            originalDict: null, // 保存原始数据
            activeDir: null,
            apiKey,
            databaseId,
            input_databaseId: databaseId.value,
            onlyMyNotion,
            enableMyNotion,
            notionName: null,
            notionUrl: null,
            loading: false,
            isHoverButton: false,
            dirExpanded: false,
            hasOverflow: false,
        }
    },
    watch: {
        input_databaseId: {
            handler(val) {
                if (val.startsWith("https://")) {
                    let re = /\/([0-9a-f]{32})/.exec(val)
                    if (re?.[1]?.length == 32) {
                        let databaseId = re?.[1]
                        console.log("found databaseId", databaseId, re)
                        this.input_databaseId = databaseId
                        this.databaseId = databaseId
                        return
                    } else {
                        this.input_databaseId = ""
                    }
                } else {
                    if (val && val.length != 32) {
                        this.input_databaseId = ""
                    }
                }
                this.databaseId = val
            },
        },
        dict: {
            handler() {
                // 当字典数据变化时检查溢出
                this.$nextTick(() => {
                    this.checkOverflow();
                });
            },
            deep: true
        },
        searchTerm: {
            handler(newTerm) {
                this.filterDict(newTerm);
            },
            immediate: true
        },
    },
    created() {
        this.loadData()
        let databaseServer = useDatabaseServer()
        console.log("[PromptDict]", this, databaseServer)
        if (this.notioConfigActive) {
            this.reloadData()
        }
    },
    
    mounted() {
        this.$nextTick(() => {
            this.checkOverflow();
            window.addEventListener('resize', this.checkOverflow);
        });
    },
    
    beforeDestroy() {
        window.removeEventListener('resize', this.checkOverflow);
    },
    methods: {
        loadData() {
            getDictData(onlyMyNotion.value).then((dict) => {
                this.originalDict = dict // 保存原始数据
                this.filterDict(this.searchTerm) // 应用当前搜索过滤
                // 数据加载完成后检查溢出
                this.$nextTick(() => {
                    this.checkOverflow();
                });
            })
        },

        async reloadData() {
            if (enableMyNotion.value) {
                await this.fetchNotion()
            }
            this.loadData()
        },

        async fetchNotion() {
            try {
                console.log("[Notion] fetchNotion")
                this.loading = true
                this.notionName = null
                this.notionUrl = null
                let databaseServer = useDatabaseServer()
                let re = await databaseServer.fetchNotion({
                    apiKey: apiKey.value,
                    databaseId: databaseId.value,
                })
                this.notionName = re?.me?.name
                this.notionUrl = re?.me?.url
            } catch (e) {
                console.error("[Notion]", e)
                if (/Make sure the relevant pages and databases are shared with your integration/.test(e.message)) {
                    alert(`Notion 连接错误：` + e)
                } else {
                    alert(
                        `Notion 连接错误：没有 Notion 数据库的访问权限。请在此 Notion 数据库页面菜单的 'Connections' 中添加你的集成应用`
                    )
                }
            } finally {
                this.loading = false
            }
        },

        async doApplyWord(item) {
            let activeInputEl = document.body.querySelector(".PromptWork.active")
            if (!activeInputEl) activeInputEl = document.body.querySelector(".PromptWork")
            // console.log("activeInputEl", activeInputEl)

            if (activeInputEl) {
                let insertText = item.data.word.rawText ?? item.data.word.text
                let vueIns = activeInputEl.__vue__
                await vueIns.promptWork.reflowPrompts(insertText)
                vueIns.doExportPrompt()
            }
        },

        doChangeActiveDir(dir) {
            this.activeDir = dir
        },

        doGotoNotionMe() {
            if (this.notionUrl) window.open(this.notionUrl)
        },

        setNotionHover: debounce(function (v) {
            this.isHoverButton = v
        }, 400),
        
        checkOverflow() {
            this.$nextTick(() => {
                const container = this.$refs.dirButtonsContainer;
                if (!container) return;
                
                const dirButtons = container.querySelector('.dir-buttons');
                if (!dirButtons) return;
                
                // 获取第一个按钮的高度作为单行高度参考
                const firstButton = dirButtons.querySelector('button');
                if (!firstButton) return;
                
                const buttonHeight = firstButton.offsetHeight;
                
                // 如果按钮区域的高度大于单个按钮的高度，说明有多行
                this.hasOverflow = dirButtons.scrollHeight > buttonHeight * 1.5;
                
                // 强制重新渲染以确保图标显示
                this.$forceUpdate();
            });
        },
        
        filterDict(searchTerm) {
            if (!this.originalDict) return;
            
            if (!searchTerm || searchTerm.trim() === '') {
                // 没有搜索词时显示所有数据
                this.dict = this.originalDict;
                this.activeDir = this.dict[0];
                return;
            }
            
            const term = searchTerm.toLowerCase().trim();
            
            // 过滤字典数据
            const filteredDict = this.originalDict.map(dir => {
                // 过滤主目录的词汇
                const filteredWords = dir.words.filter(word => 
                    this.matchesSearchTerm(word, term)
                );
                
                // 过滤子目录
                const filteredChildren = dir.children.map(subDir => ({
                    ...subDir,
                    words: subDir.words.filter(word => 
                        this.matchesSearchTerm(word, term)
                    )
                })).filter(subDir => subDir.words.length > 0);
                
                return {
                    ...dir,
                    words: filteredWords,
                    children: filteredChildren
                };
            }).filter(dir => dir.words.length > 0 || dir.children.length > 0);
            
            this.dict = filteredDict;
            this.activeDir = this.dict[0] || null;
        },
        
        matchesSearchTerm(word, term) {
            if (!word || !word.data || !word.data.word) return false;
            
            const wordData = word.data.word;
            
            // 搜索英文文本
            if (wordData.text && wordData.text.toLowerCase().includes(term)) {
                return true;
            }
            
            // 搜索中文翻译
            if (wordData.langText && wordData.langText.toLowerCase().includes(term)) {
                return true;
            }
            
            // 搜索原始文本（如果有）
            if (wordData.rawText && wordData.rawText.toLowerCase().includes(term)) {
                return true;
            }
            
            // 搜索描述
            if (wordData.desc && wordData.desc.toLowerCase().includes(term)) {
                return true;
            }
            
            return false;
        },
    },
    components: { PromptItem: vPromptItem },

    computed: {
        activeSubDirs() {
            if (this.activeDir) {
                return [this.activeDir, ...this.activeDir.children]
            }
        },

        notioConfigActive() {
            return !!(this.databaseId && this.apiKey)
        },
    },
}
</script>
