<template>
	<div>
		<el-table
			:data="tableData"
			:show-header=false
			style="width: 100%">
			<el-table-column type="expand">
				<template slot-scope="prop">
					<common-form slot="form" :data="prop.row.formData" :structure="prop.row.formStructure" @selectChange="(val,item)=>{selectChange(val,item,prop.$index)}"></common-form>
				</template>
			</el-table-column>

			<el-table-column v-for="(item,index) in tableLabel" :key="index" :prop="item.prop" :width="item.width ? item.width:100">
				<template slot-scope="scope">
					<span v-if="item.type=='value'">{{ scope.row[item.prop] }}</span>
					<el-input v-if="item.type=='input'" v-model="scope.row[item.prop]" :placeholder="item.placeholder"></el-input>
				</template>
			</el-table-column>
			<el-table-column
				fixed="right"
				label="操作"
				width="200">
				<template slot-scope="prop">
					<el-button v-for="(item2,index) in tableOperation" :key="index" :type="item2.type" :icon="item2.icon ? item2.icon : ''" @click="columnButtonCilck(item2,prop.row,prop.$index)">{{ item2.label }}</el-button>
				</template>
			</el-table-column>
		</el-table>
	</div>
</template>

<script>
import commonForm from '@/components/commonForm/index.vue'
export default {
	components:{
		commonForm
	},
	props:{
		tableData:Array,//表格数据
		tableLabel:Array,//表格标签
		tableOperation:Array,//表格操作
	},
	data(){
		return{
		}
	},
	methods:{
		columnButtonCilck(operation,row,index){
			this.$emit('columnButtonCilck',operation,row,index);
			
		},
		selectChange(val,item,index){
			this.$emit('selectChange',val,item,index);
		}
	}
}
</script>

<style>

</style>
