<template>
    <div class="IndexPage">
        <nav>
            <a class="logo" href="https://github.com/Moonvy/OpenPromptStudio"><b>OPS</b>/OpenPromptStudio</a>
            <a class="icon-link" href="https://github.com/Moonvy/OpenPromptStudio" target="_blank">
                <Icon icon="radix-icons:github-logo"
            /></a>

            <div class="dict-button-box" @click="toggleDictPad()">
                提示词词典
                <button class="icon dict-button"><Icon icon="mingcute:book-4-fill" /></button>
            </div>
        </nav>
        <PromptEditor ref="PromptEditor" :init-prompts="initPrompts" />
        <footer>
            <a href="https://github.com/Moonvy/OpenPromptStudio" target="_blank">
                <img class="icon" src="/icon.svg" /> OpenPromptStudio / v{{ version }} /
            </a>
            <a href="https://moonvy.com/?homepage"> made by <img src="./assets/logo_full_cn.svg" /></a>
        </footer>
        <section class="PromptDictPad" v-if="needDictPad" v-show="showDictPad" :style="{ height: dictPadHeight + 'px' }">
            <div class="resize-handle" @mousedown="startResize"></div>
            <div class="title">
                <Icon icon="mingcute:book-4-fill" />
                提示词词典
                <div class="search-box">
                    <Icon icon="mingcute:search-line" />
                    <input 
                        v-model="searchTerm" 
                        type="text" 
                        placeholder="搜索标签..." 
                        @input="onSearchInput"
                    />
                </div>
                <!--                <a class="github-dict" href="https://github.com/Moonvy/OpenPromptStudio" target="_blank">-->
                <!--                    <Icon icon="radix-icons:github-logo" />一起维护词典</a-->
                <!--                >-->
                <button class="icon close-button" @click="toggleDictPad(false)">
                    <Icon icon="radix-icons:cross-1" />
                </button>
            </div>
            <PromptDict :search-term="searchTerm" />
        </section>
    </div>
</template>
<style lang="scss">
.IndexPage {
    > nav {
        display: flex;
        place-items: center;
        padding-top: 11px;
        padding-bottom: 20px;
        padding-left: 23px;
        padding-right: 14px;
        .logo {
            font-family: "JetBrains Mono";
            color: #9f9f9f;
            text-shadow: 0 1px 1px #ffffff;
            display: flex;
            place-items: center;
            font-weight: 200;
            display: flex;
            place-content: flex-start;
            text-decoration: none;
        }

        .icon-link {
            display: flex;
            place-items: center;
            font-size: 18px;
            color: #888686;
            text-shadow: 0 1px 1px #ffffff;
            margin-left: 6px;
        }

        .dict-button-box {
            margin-left: auto;
            display: flex;
            font-size: 14px;
            place-items: center;
            color: #6161b7;
            text-shadow: 0 1px 1px #ffffff;
            margin-right: 40px;
            cursor: pointer;
        }
        .dict-button {
            color: #6161b7;
            margin-left: 6px;
            position: fixed;
            right: 20px;
            top: 14px;
            z-index: 50;
        }
    }

    > footer {
        display: flex;
        place-content: flex-end;
        place-items: center;
        padding-bottom: 20px;
        padding-top: 32px;
        padding-right: 20px;
        border-top: 1px solid #d7d7d7;
        box-shadow: 0 1px 0 rgba(255, 255, 255, 0.9215686275) inset;

        a {
            display: flex;
            place-content: flex-end;
            place-items: center;
            text-decoration: none;
            color: #4b4a4a;
            font-family: "JetBrains Mono";
            font-size: 13px;
            img {
                margin-left: 6px;
                height: 21px;
            }

            .icon {
                margin-right: 0.5em;
            }

            &:not(:last-child) {
                margin-right: 0.5em;
            }
        }
    }

    > .PromptDictPad {
        position: fixed;
        display: flex;
        flex-direction: column;
        bottom: 0;
        left: 0;
        width: 100%;
        z-index: 100;
        background: rgb(247 247 247 / 71%);
        backdrop-filter: blur(32px);
        box-shadow: 0 -2px 2px #26252512, 0 -2px 12px #26252521, 0 -2px 64px #0605491f;
        transition: height 0.1s ease;
        
        > .resize-handle {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 6px;
            cursor: ns-resize;
            background: transparent;
            z-index: 101;
            
            &:hover {
                background: rgba(97, 97, 183, 0.1);
            }
            
            &:active {
                background: rgba(97, 97, 183, 0.2);
            }
        }

        > .title {
            display: flex;
            place-items: center;
            padding: 14px 20px;
            font-size: 14px;
            color: #6161b7;
            text-shadow: 0 1px 1px #ffffff;
            font-weight: bold;
            > .iconify {
                font-size: 22px;
                margin-right: 8px;
                filter: drop-shadow(0 1px 1px #ffffff);
                color: #6161b7;
            }

            > .search-box {
                display: flex;
                align-items: center;
                margin-left: 20px;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 6px;
                padding: 4px 8px;
                border: 1px solid rgba(97, 97, 183, 0.2);
                
                .iconify {
                    font-size: 16px;
                    color: #9f9f9f;
                    margin-right: 6px;
                }
                
                input {
                    border: none;
                    background: transparent;
                    outline: none;
                    font-size: 13px;
                    color: #5a5a5a;
                    width: 150px;
                    
                    &::placeholder {
                        color: #b0b0b0;
                    }
                }
            }

            > .close-button {
                margin-left: auto;
            }

            .github-dict {
                display: flex;
                place-items: center;
                text-decoration: none;
                margin-left: 12px;
                font-weight: normal;
                color: #7a78dc;
                &:hover {
                    text-decoration: underline;
                }
                .iconify {
                    margin-right: 4px;
                }
            }
        }
    }
}

@media screen and (max-width: 1550px) {
    .IndexPage > footer {
        padding-top: 92px;
    }
}
</style>
<script lang="ts">
import Vue, { PropType } from "vue"
import vPromptEditor from "../../Compoents/PromptEditor/PromptEditor.vue"
import vPromptDict from "../../Compoents/PromptDict/PromptDict.vue"
import { debounce } from "lodash"

import pkg from "../../../package.json"
export default Vue.extend({
    data() {
        return {
            showDictPad: false,
            needDictPad: false,
            version: pkg.version,
            initPrompts: null,
            dictPadHeight: 300,
            resizing: false,
            searchTerm: '',
        }
    },
    methods: {
        toggleDictPad(show?: boolean) {
            this.showDictPad = show ?? !this.showDictPad
            if (this.showDictPad) this.needDictPad = true
        },
        
        startResize(event: MouseEvent) {
            this.resizing = true;
            document.addEventListener('mousemove', this.handleResize);
            document.addEventListener('mouseup', this.stopResize);
            // 防止选中文本
            event.preventDefault();
        },
        
        handleResize(event: MouseEvent) {
            if (!this.resizing) return;
            // 计算新高度 (窗口高度 - 鼠标Y坐标)
            const newHeight = window.innerHeight - event.clientY;
            // 限制最小和最大高度
            this.dictPadHeight = Math.max(150, Math.min(window.innerHeight * 0.8, newHeight));
        },
        
        stopResize() {
            this.resizing = false;
            document.removeEventListener('mousemove', this.handleResize);
            document.removeEventListener('mouseup', this.stopResize);
        },

        getPromptsFromUrlQuery() {
            if (this.$route?.query?.prompts) {
                try {
                    let prompts = JSON.parse(<any>this.$route.query.prompts)
                    console.log("[getPromptsFromUrlQuery]:", prompts)
                    this.initPrompts = prompts

                    let newQuery = Object.assign({}, this.$route.query)
                    delete newQuery.prompts
                    this.$router.replace({ query: newQuery })
                } catch (e) {
                    console.error(e)
                }
            }
        },
        
        onSearchInput: debounce(function() {
            // 防抖处理搜索输入
        }, 300),
    },
    components: {
        PromptEditor: <any>vPromptEditor,
        PromptDict: vPromptDict,
    },
    created() {
        this.getPromptsFromUrlQuery()
    },
    
    beforeDestroy() {
        // 确保移除所有事件监听器
        document.removeEventListener('mousemove', this.handleResize);
        document.removeEventListener('mouseup', this.stopResize);
    },
})
</script>
