<template>
    <el-tabs v-model="value" @tab-click="tabsClick">
        <el-tab-pane v-for="(item,index) in tabs" :key="index" :label="item.label" :name="item.name">
            <slot :name="item.name"></slot>
        </el-tab-pane>
    </el-tabs>
</template>

<script>
export default {
    props:{
        tabs:Array,
        activeName:String
    },
    data(){
        return{
            value:this.activeName
        }
    },
    methods:{
        tabsClick(tab,event){
            console.log(tab.name)
            this.$emit('tabsClick',tab);
        }
    }
}
</script>

<style>

</style>