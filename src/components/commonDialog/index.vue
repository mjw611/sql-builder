<template>
	<el-dialog :title="dialog.dialogTitle" :visible.sync="dialog.dialogVisible" :before-close="handleClose">
        <slot name="content"></slot>
    </el-dialog>
</template>

<script>
export default {
    props:{
        dialog:Object
    },
    methods:{
        handleClose(done){
            // console.log("关闭",done);
            this.$emit('handleClose',done);
        }
    }
}
</script>

<style>

</style>
