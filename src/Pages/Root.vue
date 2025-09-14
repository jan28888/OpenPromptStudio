<template>
    <div class="VueRoot">
        <router-view></router-view>
    </div>
</template>
<style lang="scss"></style>
<script>
import "../Style/Font"
import "./../Style/var.scss"
import { loadAllCSVFiles } from "../utils/csvLoader"

export default {
    async mounted() {
        const csvData = await loadAllCSVFiles('/data/src/dict')
        this.$root.$emit('csv-data-loaded', csvData)
    }
}
</script>
