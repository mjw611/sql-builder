<template>
	<div>
		<el-card class="box-card" shadow="hover" :style="`width:${width}px`">
			<div slot="header" class="clearfix">
				<span class="title">{{ title }}</span>
				<slot name="button"/>
			</div>
			<slot name="content"/>
			</el-card>
	</div>
</template>

<script>
export default {
    props:{
        title:String,
        width:Number
    }
}
</script>

<style>
	.text {
	font-size: 14px;
	}

	.item {
		margin-bottom: 18px;
	}

	.clearfix:before,
	.clearfix:after {
		display: table;
		content: "";
	}
	.clearfix:after {
		clear: both
	}

	.box-card { 
        margin: 18px;
	}
    .title{
        margin-top: 20px;
    }
</style>
