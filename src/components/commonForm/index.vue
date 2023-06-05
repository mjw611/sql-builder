<template>
	<div>
		<el-form :model="data" ref="form" label-width="100px" class="demo-dynamic">
			<el-form-item v-for="(item,index) in structure" :key="index" :prop="item.prop" :label="item.label" :rules="item.rules">
				<!-- 输入框 -->
				<el-input v-if="item.type=='input'" v-model="data[item.prop]" :placeholder="item.placeholder" :style="`width:${item.width}px`"></el-input>
			<!-- 计数器 -->
			<el-input-number v-if="item.type=='number'" v-model="data[item.prop]" controls-position="right"></el-input-number>
			<!-- 下拉选 -->
				<el-select v-if="item.type=='select'" filterable v-model="data[item.prop]" :style="`width:${item.width}px`" @change="selectChange(data[item.prop],item)">
					<el-option
				v-for="(item2,index) in item.option"
				:key="index"
				:label="item2.label"
				:value="item2.value">
					</el-option>
						</el-select>
						<!-- 开关 -->
						<el-switch v-if="item.type=='switch'" v-model="data[item.prop]"></el-switch>
						<!-- 复选框 -->
						<el-checkbox-group v-if="item.type=='checkbox'" v-model="data[item.prop]">
							<el-checkbox v-for="(item3,index) in item.option" :key="index" :label="item3"></el-checkbox>
						</el-checkbox-group>
						<!-- 单选按钮 -->
						<el-radio-group v-if="item.type=='radio'" v-model="data[item.prop]">
							<el-radio v-for="(item4,index) in item.option" :key="index" :label="item4"></el-radio>
						</el-radio-group>
						<!-- 文本域 -->
						<el-input v-if="item.type=='textarea'" v-model="data[item.prop]" :style="`width:${item.width}px`" type="textarea" :rows="10" :placeholder="item.placeholder"></el-input>
						<!-- 日期选择器 -->
						<el-date-picker v-if="item.type=='date' || item.type=='datetime'" :type="item.type" placeholder="选择日期" v-model="data[item.prop]" :style="`width:${item.width}px`"></el-date-picker>
			<!-- 表格 -->
			<slot name="table" v-if="item.type=='table'"></slot>

			<!-- 删除按钮 -->
				<el-button v-if="item.remove ? item.remove:false" @click="removeFormItem(item)">删除</el-button>
			</el-form-item>

				<el-form-item v-if="buttonFlag ? buttonFlag:true">
				<el-button v-for="(item5,index) in buttons" :key="index" :type="item5.type" @click="formButtonClick(item5.label,data)">{{ item5.label }}</el-button>
					</el-form-item>
					</el-form>
	</div>
</template>

<script>
export default {
	props:{
		data:Object,//数据
		structure:Array,//结构
		column:Array,//字段
	buttonFlag:Boolean,//是否显示按钮组
	buttons:Array,//按钮组
		},
	data() {
		return {

		}
	},
	methods: {
		formButtonClick(operation,data){
			this.$emit('formButtonClick',operation,data);
		},
		selectChange(val,item){
			this.$emit('selectChange',val,item);
		}
	},
	mounted(){
	}
	}
</script>

<style lang="scss" scoped>
	::v-deep .el-form-item .el-form-item {
    margin-bottom: 22px;
}
</style>
