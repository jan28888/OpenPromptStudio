import Vue from "vue"
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'

// ----------------- 全局组件 -----–––––––––––––––-
import { Icon as vIcon } from "@iconify/vue2"
import Notification from "../components/Notification.vue"

// 创建通知插件
const Notify = {
  install(Vue) {
    // 创建通知构造器
    const NotificationConstructor = Vue.extend(Notification)
    
    // 添加通知方法
    Vue.prototype.$notify = (options) => {
      const instance = new NotificationConstructor({
        propsData: options
      })
      
      instance.$mount()
      document.body.appendChild(instance.$el)
    }
  }
}
// ----------------------–––––––––––––––-
import vRoot from "../Pages/Root.vue"
import { getPagesRouter } from "../Pages"

export function bootVue(setVueHandler?: (VueConstructor: typeof Vue) => any) {
    // 设置 Vue
    if (setVueHandler) setVueHandler(Vue)
    // --------––––––––––––––––––––––––––––––
    Vue.component("Icon", vIcon)
    Vue.use(FloatingVue)
    Vue.use(Notify)
    // --------––––––––––––––––––––––––––––––
    let router = getPagesRouter(Vue)
    let vueIns = new Vue({
        el: "#app-root",
        router,
        render: (h) => h(vRoot),
    })

    // 注册变量
    Object.assign(window, {
        vueIns,
        _Vue: Vue,
    })
    return { Vue, vueIns }
}
