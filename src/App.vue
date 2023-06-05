<template>
	<div>
    <h2 style="margin-left: 20px;">快速生成 SQL 和模拟数据，大幅提高开发测试效率！</h2>
		<div class="father">
			<common-card :title="title1" :width="900">
		    <el-select slot="button" style="float: right; padding: 3px 0" v-model="databaseTypeValue" placeholder="请选择" disabled size="mini">
			    <el-option
				    v-for="item,index in databaseType"
				    :key="index"
				    :label="item.label"
				    :value="item.value">
			    </el-option>
			  </el-select>
        <div slot="content">
          <el-button style="margin-left: 100px;" @click="()=>{this.dialog1.dialogVisible=true}">导入建表SQL</el-button>
          <br><br>
          <common-form :data="tableData" :structure="tableStructure" :buttonFlag="buttonFlag" :buttons="buttons" @formButtonClick="formButtonClick">
            <expand slot="table" :tableData="tableData.columnData" :tableLabel="columnLabel" :tableOperation="columnOperation" @selectChange="selectChange" @columnButtonCilck="columnButtonCilck">
            </expand>
          </common-form>
        </div>
      </common-card>

      <common-card :title="title2" :width="900">
        <div slot="content">
          <div v-if="resultState==true">
            <common-tabs :tabs="tabs" @tabsClick="tabsClick" :activeName="activeName"></common-tabs>
            <div v-if="activeName=='tab1'">
              <el-button type="primary" @click="openEditor($event,'editorShowState1',1)" style="border-radius: 0px">建表语句&nbsp;<i class="el-icon-arrow-right"></i></el-button>
              <div v-if="editorShowState1">
                <el-button size="mini" @click="copy('monaco1')" style="margin-left: 790px;border-radius: 0px;">复制&nbsp;<i class="el-icon-document-copy"></i></el-button>
                <monaco
                  v-if="containerReload1"
                  ref="monaco1"
                  :opts="opts1"
                  :isDiff="isDiff"
                  :height="600"
                ></monaco>
              </div>
              <el-button type="primary" @click="openEditor($event,'editorShowState2',2)" style="border-radius: 0px">插入语句&nbsp;<i class="el-icon-arrow-right"></i></el-button>
              <div v-if="editorShowState2">
                <el-button size="mini" @click="copy('monaco2')" style="margin-left: 790px;border-radius: 0px;">复制&nbsp;<i class="el-icon-document-copy"></i></el-button>
                <monaco
                v-if="containerReload2"
                  ref="monaco2"
                  :opts="opts2"
                  :isDiff="isDiff"
                  :height="600"
                ></monaco>
              </div>
            </div>
            <div v-if="activeName=='tab2'">
              <el-button size="mini" @click="copy('monaco3')" style="margin-left: 790px;border-radius: 0px;">复制&nbsp;<i class="el-icon-document-copy"></i></el-button>
              <monaco
                v-if="containerReload3"
                ref="monaco3"
                :opts="opts3"
                :isDiff="isDiff"
                :height="600"
              ></monaco>
            </div>

            <div v-if="activeName=='tab3'">
              <el-button size="mini" @click="copy('monaco4')" style="margin-left: 790px;border-radius: 0px;">复制&nbsp;<i class="el-icon-document-copy"></i></el-button>
              <monaco
                v-if="containerReload4"
                ref="monaco4"
                :opts="opts4"
                :isDiff="isDiff"
                :height="600"
              ></monaco>
            </div>
          </div>
          <el-empty v-if="resultState==false" description="请先输入配置并点击【一键生成】"></el-empty>
        </div>
      </common-card>
      <common-dialog :dialog="dialog1" @handleClose="dialogFormClose">
        <common-form slot="content" :data="dialogFormData" :structure="dialogFormStructure" :buttonFlag="dialogButtonFlag" :buttons="dialogButtons" @formButtonClick="dialogFormButtonClick" ></common-form>
      </common-dialog>
    </div>
	</div>
</template>

<script>
import commonCard from './components/commonCard/index.vue'
import commonForm from './components/commonForm/index.vue'
import expand from './components/commonTable/expand.vue'
import monaco from './components/commonEditor/index.vue'
import commonTabs from './components/commonTabs/index.vue'
import commonDialog from './components/commonDialog/index.vue'
import RandExp from 'randexp'
import Axios from 'axios'
export default {
	components:{
		commonCard,
    commonForm,
    expand,
    monaco,
    commonTabs,
    commonDialog
	},
	data(){
		return{
      opts1: {
        value: null,
        readOnly: false, // 是否可编辑
        language: 'sql', // 语言类型
        theme: 'vs-dark' // 编辑器主题
      },
      opts2: {
        value: null,
        readOnly: false, // 是否可编辑
        language: 'sql', // 语言类型
        theme: 'vs-dark' // 编辑器主题
      },
      opts3: {
        value: null,
        readOnly: false, // 是否可编辑
        language: 'json', // 语言类型
        theme: 'vs-dark' // 编辑器主题
      },
      opts4: {
        value: null,
        readOnly: false, // 是否可编辑
        language: 'typescript', // 语言类型
        theme: 'vs-dark' // 编辑器主题
      },
      isDiff: false,
      containerReload1: true,
      containerReload2: true,
      containerReload3: true,
      containerReload4: true,
			title1:"输入配置",
				title2:"生成结果",
				databaseType:[
					{
						value:"MySQL",
						label:"MySQL"
					},
					{
						value:"Oracle",
						label:"Oracle"
					}
				],
        databaseTypeValue:"MySQL",
        buttonFlag:true,
        buttons:[
          {
            type:"primary",
            label:"一键生成"
          },
          {
            label:"新增字段"
          },
          {
            label:"重置"
          }
        ],
        tableData:{
          tableName:null,
          tableNote:null,
          tableCount:20,
          columnData:[]
        },
        tableStructure:[
          {
            type:"input",
            width:550,
            prop:"tableName",
            label:"表名:",
            placeholder:"多个单词建议用下划线分割",
            rules:[
              { required: true, message: '请输入表名', trigger: 'blur'}
            ],
            remove:false
          },
          {
            type:"input",
            width:550,
            prop:"tableNote",
            label:"表注释:",
            placeholder:"描述表的中文名称、作用等",
            rules:[
              { required: false, message: '请输入表注释', trigger: 'blur'}
            ],
            remove:false
          },
          {
            type:"number",
            width:550,
            prop:"tableCount",
            label:"数据条数:",
            rules:[
              { required: true, message: '请输入数据条数', trigger: 'blur'}
            ],
            remove:false
          },
          {
            type:"table",
            width:400,
            label:"字段:",
            remove:false
          },
        ],
        columnLabel:[
          {
            type:"value",
            prop:"title",
            label:"字段名:",
            width:100,
          },
          {
            type:"input",
            prop:"columnName",
            placeholder:"建议使用纯英文",
            label:"字段名",
            width:300,
          }
        ],
        columnOperation:[
          {
            type:"text",
            label:"删除"
          }
			  ],
        resultState:false,
        tabs:[
          {
            label:"SQL代码",
            name:"tab1"
          },
          {
            label:"JSON代码",
            name:"tab2"
          },
          {
            label:"Node代码",
            name:"tab3"
          }
        ],
        activeName:null,
        editorShowState1:true,
        editorShowState2:true,
        editorValue1:null,
        editorValue2:null,
        editorValue3:null,
        editorValue4:null,
        tempJson:null,
        dialog1:{
          dialogTitle:"导入建表SQL",
          dialogVisible:false,
        },
        dialogFormData:{
          createTableSql:null
        },
        dialogFormStructure:[
          {
            type:"textarea",
            width:550,
            prop:"createTableSql",
            label:"建表语句:",
            placeholder:"请输入建表语句",
            rules:[
              { required: true, message: '请输入建表语句', trigger: 'blur'}
            ],
            remove:false
          },
        ],
        dialogButtonFlag:true,
        dialogButtons:[
          {
            type:"primary",
            label:"导入"
          },
          {
            label:"重置"
          }
        ],
		}
	},
  provide () {
    return {
      reload: this.reload
    }
  },
  methods:{
    
    //字段按钮点击
    columnButtonCilck(operation,row,index){
      if(operation.label=='删除'){
        this.tableData.columnData.splice(index,1);
      }
    },
    //下拉选改变
    selectChange(val,item,index){
      if(val=='固定'){
        this.tableData.columnData[index].formStructure[this.tableData.columnData[index].formStructure.length-1]=
          {
            type:"input",
            width:200,
            prop:"fixedValue",
            placeholder:"请输入固定值",
            label:"固定值:"
          }
      }else if(val=='随机'){
        this.tableData.columnData[index].formStructure[this.tableData.columnData[index].formStructure.length-1]=
          {
            type:"select",
            prop:"randomRule",
            label:"随机规则:",
            option:[
              {
                value:"字符串",
                label:"字符串"
              },
              {
                value:"整数",
                label:"整数"
              },
              {
                value:"小数",
                label:"小数"
              },
              {
                value:"日期",
                label:"日期"
              },
              {
                value:"时间戳",
                label:"时间戳"
              },
              {
                value:"网址",
                label:"网址"
              },
              {
                value:"IP",
                label:"IP"
              },
              {
                value:"邮箱",
                label:"邮箱"
              },
              {
                value:"手机号",
                label:"手机号"
              },
              {
                value:"人名",
                label:"人名"
              },
              {
                value:"性别",
                label:"性别"
              }
            ]
          }
        }else if(val=='递增'){
          this.tableData.columnData[index].formStructure[this.tableData.columnData[index].formStructure.length-1]=
            {
              type:"number",
              width:200,
              prop:"initialValue",
              label:"起始值:"
            }
        }else if(val=='规则'){
          this.tableData.columnData[index].formStructure[this.tableData.columnData[index].formStructure.length-1]=
            {
              type:"input",
              width:200,
              prop:"regexp",
              placeholder:"请输入正则表达式",
              label:"正则表达式:"
            }
        }else if(val=='不模拟'){
          this.tableData.columnData[index].formStructure[this.tableData.columnData[index].formStructure.length-1]=
            {
            }
        }
    },
    //表单按钮提交
    async formButtonClick(operation,data){
      if(operation=='一键生成'){
        if(data.tableName && data.columnData.length>0){
          let loadingInstance = this.$loading({ fullscreen: true });
          this.resultState=true;//显示生成结果
          this.activeName='tab1';//默认展示选项卡1
          await this.createTableStatement(data);
          await this.insertStatement(data);
          await this.createEntityCode(data);
          loadingInstance.close();
        }else{
          this.$message({
            showClose: true,
            message: '表名不能为空,且至少有1个字段',
            type: 'error'
          });
        }
      }else if(operation=='新增字段'){
        this.addColumn();
      }else if(operation=='重置'){
        this.$confirm('此操作将清空所有配置, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.tableData={
            tableName:null,
            tableNote:null,
            tableCount:20,
            columnData:[]
          }
          this.$message({
            type: 'success',
            message: '重置成功!'
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消重置'
          });          
        });
      }
    },
    //新增字段
    addColumn(){
      this.tableData.columnData.push(
        {
          title:"字段名:",
          columnName:null,
          formData:{
            columnType:null,//字段类型
            default:null,//默认值
            columnNote:null,//字段注释
            notNull:false,//非空
            primary:false,//主键
            autoIncrement:false,//自增
            analogType:null,//模拟类型
            fixedValue:null,//固定值
            randomRule:null,//随机规则
            initialValue:null,//起始值
            regexp:null,//正则表达式

          },
          formStructure:[
            {
              type:"select",
              width:200,
              prop:"columnType",
              label:"字段类型:",
              option:[
                {
                  value:"tinyint",
                  label:"tinyint"
                },
                {
                  value:"smailint",
                  label:"smailint"
                },
                {
                  value:"mediumint",
                  label:"mediumint"
                },
                {
                  value:"int",
                  label:"int"
                },
                {
                  value:"bigint",
                  label:"bigint"
                },
                {
                  value:"float",
                  label:"float"
                },
                {
                  value:"double",
                  label:"double"
                },
                {
                  value:"decimal",
                  label:"decimal"
                },
                {
                  value:"date",
                  label:"date"
                },
                {
                  value:"time",
                  label:"time"
                },
                {
                  value:"year",
                  label:"year"
                },
                {
                  value:"datetime",
                  label:"datetime"
                },
                {
                  value:"timestamp",
                  label:"timestamp"
                },
                {
                  value:"char",
                  label:"char"
                },
                {
                  value:"varchar(255)",
                  label:"varchar(255)"
                },
                {
                  value:"tinytext",
                  label:"tinytext"
                },
                {
                  value:"text",
                  label:"text"
                },
                {
                  value:"mediumtext",
                  label:"mediumtext"
                },
                {
                  value:"longtext",
                  label:"longtext"
                },
                {
                  value:"tinyblob",
                  label:"tinyblob"
                },
                {
                  value:"blob",
                  label:"blob"
                },
                {
                  value:"mediumblob",
                  label:"mediumblob"
                },
                {
                  value:"longblob",
                  label:"longblob"
                },
                {
                  value:"binary",
                  label:"binary"
                },
                {
                  value:"varbinary(255)",
                  label:"varbinary(255)"
                }
              ]
            },
            {
              type:"input",
              width:200,
              prop:"default",
              placeholder:"要和字段类型匹配",
              label:"默认值:"
            },
            {
              type:"input",
              width:200,
              prop:"columnNote",
              placeholder:"描述中文名称、作用等",
              label:"注释:"
            },
            {
              type:"switch",
              prop:"notNull",
              label:"非空:"
            },
            {
              type:"switch",
              prop:"primary",
              label:"主键:"
            },
            {
              type:"switch",
              prop:"autoIncrement",
              label:"自增:"
            },
            {
              type:"select",
              prop:"analogType",
              label:"模拟类型:",
              option:[
                {
                  value:"固定",
                  label:"固定"
                },
                {
                  value:"随机",
                  label:"随机"
                },
                {
                  value:"递增",
                  label:"递增"
                },
                {
                  value:"规则",
                  label:"规则"
                },
                {
                  value:"不模拟",
                  label:"不模拟"
                },
              ]
            },
            {},
          ]
        }
      );
    },
    async reload (tab) {
      if(tab==='tab1'){
        this.containerReload1 = false
        await this.$nextTick()
        this.containerReload1 = true
        this.containerReload2 = false
        await this.$nextTick()
        this.containerReload2 = true
      }
      if(tab==='tab2'){
        this.containerReload3 = false
        await this.$nextTick()
        this.containerReload3 = true
      }
      if(tab==='tab3'){
        this.containerReload4 = false
        await this.$nextTick()
        this.containerReload4 = true
      }
        
      },
    //选项卡点击
    tabsClick(tab){
      this.activeName=tab.name;
      this.reload(this.activeName)
      if(this.activeName=='tab1'){
        this.editorShowState1=true;
        this.editorShowState2=true;
        //编译器加载
        setTimeout(()=>{
          this.$refs.monaco1.setVal(this.editorValue1);
          this.$refs.monaco2.setVal(this.editorValue2);
        },100);
      }else if(this.activeName=='tab2'){
        setTimeout(()=>{
          this.$refs.monaco3.setVal(this.editorValue3);
          this.$refs.monaco3.format();
        },100);
      }else if(this.activeName=='tab3'){
        setTimeout(()=>{
          this.$refs.monaco4.setVal(this.editorValue4);
          this.$refs.monaco4.format();
        },100);
      }
    },
    //显示编译器
    openEditor(event,editor,number){
      if(event.currentTarget.firstElementChild.firstElementChild.className=='el-icon-arrow-right'){
        event.currentTarget.firstElementChild.firstElementChild.className='el-icon-arrow-down';
        this[editor]=!this[editor];
        
      }else{
        event.currentTarget.firstElementChild.firstElementChild.className='el-icon-arrow-right';
        this[editor]=!this[editor];
        setTimeout(()=>{
          this.$refs['monaco'+number].setVal(this['editorValue'+number]);
        },100);
      }
      
    },
    //复制代码
    copy(event){
      navigator.clipboard.writeText(this.$refs[event].getVal());
      
    },
    //生成建表语句
    createTableStatement(data){
      let sql=``;
      if(data.tableName){
        if(data.tableNote){
          sql=sql.concat(`-- ${data.tableNote}\n`);
        }
        sql=sql.concat(`create table if not exists \`${data.tableName}\`\n(\n`);
        let tempSqls=[];
        let flag=true;
        for(let i=0;i<data.columnData.length;i++){
          //如果字段名和字段类型存在
          if(data.columnData[i].columnName && data.columnData[i].formData.columnType){
            let tempSql=`\`${data.columnData[i].columnName}\` ${data.columnData[i].formData.columnType}`;
            //如果默认值
            if(data.columnData[i].formData.default){
              //如果字段类型不为二进制类型
              if(data.columnData[i].formData.columnType.indexOf('blob')==-1 && data.columnData[i].formData.columnType.indexOf('binary')==-1){
                //如果字段类型为数字
                if(data.columnData[i].formData.columnType.indexOf('int')!=-1 || data.columnData[i].formData.columnType=='float' || data.columnData[i].formData.columnType=='double' || data.columnData[i].formData.columnType=='decimal'){
                  if(Number(data.columnData[i].formData.default)==NaN){
                    data.columnData[i].formData.default=0;
                  }else{
                    data.columnData[i].formData.default=Number(data.columnData[i].formData.default);
                  }
                  tempSql=tempSql.concat(` default ${data.columnData[i].formData.default}`);
                }
                //如果默认值为函数
                else if(data.columnData[i].formData.default.toUpperCase().indexOf('NOW()')!=-1 || data.columnData[i].formData.default.toUpperCase().indexOf('CURRENT')!=-1){
                  tempSql=tempSql.concat(` default ${data.columnData[i].formData.default}`);
                }
                else{
                  tempSql=tempSql.concat(` default '${data.columnData[i].formData.default}'`);
                }
              } 
            }
            //如果非空
            if(data.columnData[i].formData.notNull){
              tempSql=tempSql.concat(' not null');
            }
            //如果主键
            if(data.columnData[i].formData.primary){
              tempSql=tempSql.concat(' primary key');
            }
            //如果自增
            if(data.columnData[i].formData.autoIncrement){
              tempSql=tempSql.concat(' auto_increment');
            }
            //如果注释
            if(data.columnData[i].formData.columnNote){
              tempSql=tempSql.concat(` comment '${data.columnData[i].formData.columnNote}'`);
            }
            tempSqls.push(tempSql);
          }else{
            this.$message({
              showClose: true,
              message: '字段名和字段类型不能为空,请检查后再试',
              type: 'error'
            });
            flag=false;
            break;
          }
        }
        if(flag){
          for(let i=0;i<tempSqls.length;i++){
            //如果是最后一个字段
            if(i==tempSqls.length-1){
              sql=sql.concat(`${tempSqls[i]}\n`);
            }else{
              sql=sql.concat(`${tempSqls[i]} ,\n`);
            }
          }
          //语句尾
          sql=sql.concat(`)`);
          if(data.tableNote){
            sql=sql.concat(` comment '${data.tableNote}';`);
          }
          this.editorValue1=sql;
          setTimeout(()=>{
            this.$refs.monaco1.setVal(sql);
          },100);
        }
      }else{
        this.$message({
          showClose: true,
          message: '表名不能为空,请检查后再试',
          type: 'error'
        });
      }
    },
    //生成插入语句
    async insertStatement(data){
      let sql=``;
      if(data.tableName){
        let tempSqls=[];//存放多条插入语句
        let tempArray=[];//存放json数据
        //数据条数
        for(let i=0;i<data.tableCount;i++){
          let tempSql=`insert into \`${data.tableName}\` (`;//单条插入语句
          let tempObject={};
          //处理字段名
          for(let j=0;j<data.columnData.length;j++){
            //如果字段名、字段类型、模拟类型存在且模拟类型不为不模拟
            if(data.columnData[j].columnName  && data.columnData[j].formData.columnType && data.columnData[j].formData.analogType && data.columnData[j].formData.analogType!='不模拟'){
              tempSql=tempSql.concat(`\`${data.columnData[j].columnName}\`,`);
              tempObject[data.columnData[j].columnName]=null;
            }
          }
          tempSql=tempSql.substr(0,tempSql.length-1).concat(') values (');
          //处理字段值
          for(let k=0;k<data.columnData.length;k++){
            //如果字段名、字段类型、模拟类型存在且模拟类型不为不模拟
            if(data.columnData[k].columnName  && data.columnData[k].formData.columnType && data.columnData[k].formData.analogType && data.columnData[k].formData.analogType!='不模拟'){
              //如果模拟类型为固定值
              if(data.columnData[k].formData.analogType=='固定'){
                //如果字段类型为数字
                if(data.columnData[k].formData.columnType.indexOf('int')!=-1 || data.columnData[k].formData.columnType=='float' || data.columnData[k].formData.columnType=='double' || data.columnData[k].formData.columnType=='decimal'){
                  if(Number(data.columnData[k].formData.fixedValue)==NaN){
                    tempSql=tempSql.concat(`${0},`);
                    tempObject[data.columnData[k].columnName]=0;
                  }else{
                    tempSql=tempSql.concat(`${Number(data.columnData[k].formData.fixedValue)},`);
                    tempObject[data.columnData[k].columnName]=Number(data.columnData[k].formData.fixedValue);
                  }
                }
                //如果固定值为函数
                else if(data.columnData[k].formData.fixedValue.toUpperCase().indexOf('NOW()')!=-1 || data.columnData[k].formData.fixedValue.toUpperCase().indexOf('CURRENT')!=-1){
                  tempSql=tempSql.concat(`${data.columnData[k].formData.fixedValue},`);
                  tempObject[data.columnData[k].columnName]=`${data.columnData[k].formData.fixedValue}`;
                }
                else{
                  tempSql=tempSql.concat(`'${data.columnData[k].formData.fixedValue}',`);
                  tempObject[data.columnData[k].columnName]=`${data.columnData[k].formData.fixedValue}`;
                }
              }else if(data.columnData[k].formData.analogType=='随机'){
                let randomVal;
                if(data.columnData[k].formData.randomRule=='字符串'){
                  randomVal=new RandExp(/[a-zA-Z]{10}/).gen();
                  //如果字段类型为数字
                  if(data.columnData[k].formData.columnType.indexOf('int')!=-1 || data.columnData[k].formData.columnType=='float' || data.columnData[k].formData.columnType=='double' || data.columnData[k].formData.columnType=='decimal'){
                    tempSql=tempSql.concat(`${0},`);
                    tempObject[data.columnData[k].columnName]=0;
                  }else{
                    tempSql=tempSql.concat(`'${randomVal}',`);
                    tempObject[data.columnData[k].columnName]=`${randomVal}`;
                  }
                }else if(data.columnData[k].formData.randomRule=='整数'){
                  randomVal=Math.floor(Math.random()*100);
                  //如果字段类型为数字
                  if(data.columnData[k].formData.columnType.indexOf('int')!=-1 || data.columnData[k].formData.columnType=='float' || data.columnData[k].formData.columnType=='double' || data.columnData[k].formData.columnType=='decimal'){
                    tempSql=tempSql.concat(`${randomVal},`);
                    tempObject[data.columnData[k].columnName]=randomVal;
                  }else{
                    tempSql=tempSql.concat(`'${randomVal}',`);
                    tempObject[data.columnData[k].columnName]=`${randomVal}`;
                  }
                }else if(data.columnData[k].formData.randomRule=='小数'){
                  randomVal=(Math.random()*100).toFixed(2);
                  //如果字段类型为数字
                  if(data.columnData[k].formData.columnType.indexOf('int')!=-1 || data.columnData[k].formData.columnType=='float' || data.columnData[k].formData.columnType=='double' || data.columnData[k].formData.columnType=='decimal'){
                    tempSql=tempSql.concat(`${randomVal},`);
                    tempObject[data.columnData[k].columnName]=randomVal;
                  }else{
                    tempSql=tempSql.concat(`'${randomVal}',`);
                    tempObject[data.columnData[k].columnName]=`${randomVal}`;
                  }
                }else if(data.columnData[k].formData.randomRule=='日期'){
                  randomVal=this.randomDate('date');
                  //如果字段类型为数字
                  if(data.columnData[k].formData.columnType.indexOf('int')!=-1 || data.columnData[k].formData.columnType=='float' || data.columnData[k].formData.columnType=='double' || data.columnData[k].formData.columnType=='decimal'){
                    tempSql=tempSql.concat(`${0},`);
                    tempObject[data.columnData[k].columnName]=0;
                  }else{
                    tempSql=tempSql.concat(`'${randomVal}',`);
                    tempObject[data.columnData[k].columnName]=`${randomVal}`;
                  }
                }else if(data.columnData[k].formData.randomRule=='时间戳'){
                  randomVal=this.randomDate('timestamp');
                  //如果字段类型为数字
                  if(data.columnData[k].formData.columnType.indexOf('int')!=-1 || data.columnData[k].formData.columnType=='float' || data.columnData[k].formData.columnType=='double' || data.columnData[k].formData.columnType=='decimal'){
                    tempSql=tempSql.concat(`${0},`);
                    tempObject[data.columnData[k].columnName]=0;
                  }else{
                    tempSql=tempSql.concat(`'${randomVal}',`);
                    tempObject[data.columnData[k].columnName]=`${randomVal}`;
                  }
                }else if(data.columnData[k].formData.randomRule=='网址'){
                  randomVal=this.randomUrl();
                  //如果字段类型为数字
                  if(data.columnData[k].formData.columnType.indexOf('int')!=-1 || data.columnData[k].formData.columnType=='float' || data.columnData[k].formData.columnType=='double' || data.columnData[k].formData.columnType=='decimal'){
                    tempSql=tempSql.concat(`${0},`);
                    tempObject[data.columnData[k].columnName]=0;
                  }else{
                    tempSql=tempSql.concat(`'${randomVal}',`);
                    tempObject[data.columnData[k].columnName]=`${randomVal}`;
                  }
                }else if(data.columnData[k].formData.randomRule=='IP'){
                  randomVal=this.randomIP();
                  //如果字段类型为数字
                  if(data.columnData[k].formData.columnType.indexOf('int')!=-1 || data.columnData[k].formData.columnType=='float' || data.columnData[k].formData.columnType=='double' || data.columnData[k].formData.columnType=='decimal'){
                    tempSql=tempSql.concat(`${0},`);
                    tempObject[data.columnData[k].columnName]=0;
                  }else{
                    tempSql=tempSql.concat(`'${randomVal}',`);
                    tempObject[data.columnData[k].columnName]=`${randomVal}`;
                  }
                }else if(data.columnData[k].formData.randomRule=='邮箱'){
                  randomVal=this.randomEmail();
                  //如果字段类型为数字
                  if(data.columnData[k].formData.columnType.indexOf('int')!=-1 || data.columnData[k].formData.columnType=='float' || data.columnData[k].formData.columnType=='double' || data.columnData[k].formData.columnType=='decimal'){
                    tempSql=tempSql.concat(`${0},`);
                    tempObject[data.columnData[k].columnName]=0;
                  }else{
                    tempSql=tempSql.concat(`'${randomVal}',`);
                    tempObject[data.columnData[k].columnName]=`${randomVal}`;
                  }
                }else if(data.columnData[k].formData.randomRule=='手机号'){
                  randomVal=this.randomPhone();
                  //如果字段类型为数字
                  if(data.columnData[k].formData.columnType.indexOf('int')!=-1 || data.columnData[k].formData.columnType=='float' || data.columnData[k].formData.columnType=='double' || data.columnData[k].formData.columnType=='decimal'){
                    tempSql=tempSql.concat(`${0},`);
                    tempObject[data.columnData[k].columnName]=0;
                  }else{
                    tempSql=tempSql.concat(`'${randomVal}',`);
                    tempObject[data.columnData[k].columnName]=`${randomVal}`;
                  }
                }else if(data.columnData[k].formData.randomRule=='人名'){
                  randomVal=await this.randomName();
                  //如果字段类型为数字
                  if(data.columnData[k].formData.columnType.indexOf('int')!=-1 || data.columnData[k].formData.columnType=='float' || data.columnData[k].formData.columnType=='double' || data.columnData[k].formData.columnType=='decimal'){
                    tempSql=tempSql.concat(`${0},`);
                    tempObject[data.columnData[k].columnName]=0;
                  }else{
                    tempSql=tempSql.concat(`'${randomVal}',`);
                    tempObject[data.columnData[k].columnName]=`${randomVal}`;
                  }
                }else if(data.columnData[k].formData.randomRule=='性别'){
                  //如果字段类型为数字
                  if(data.columnData[k].formData.columnType.indexOf('int')!=-1 || data.columnData[k].formData.columnType=='float' || data.columnData[k].formData.columnType=='double' || data.columnData[k].formData.columnType=='decimal'){
                    randomVal=await this.randomSex('number');
                    tempSql=tempSql.concat(`${randomVal},`);
                    tempObject[data.columnData[k].columnName]=randomVal;
                  }else{
                    randomVal=await this.randomSex('string');
                    tempSql=tempSql.concat(`'${randomVal}',`);
                    tempObject[data.columnData[k].columnName]=`${randomVal}`;
                  }
                }
              }else if(data.columnData[k].formData.analogType=='递增'){
                //如果字段类型为数字
                if(data.columnData[k].formData.columnType.indexOf('int')!=-1 || data.columnData[k].formData.columnType=='float' || data.columnData[k].formData.columnType=='double' || data.columnData[k].formData.columnType=='decimal'){
                  tempSql=tempSql.concat(`${data.columnData[k].formData.initialValue+i},`);
                  tempObject[data.columnData[k].columnName]=data.columnData[k].formData.initialValue+i;
                }
                else{
                  tempSql=tempSql.concat(`'${data.columnData[k].formData.initialValue+i}',`);
                  tempObject[data.columnData[k].columnName]=`${data.columnData[k].formData.initialValue+i}`;
                }
              }else if(data.columnData[k].formData.analogType=='规则'){
                let ruleVal=new RandExp(data.columnData[k].formData.regexp).gen();
                ruleVal=ruleVal.substr(1,ruleVal.length-2);//去掉两边的/
                //如果字段类型为数字
                if(data.columnData[k].formData.columnType.indexOf('int')!=-1 || data.columnData[k].formData.columnType=='float' || data.columnData[k].formData.columnType=='double' || data.columnData[k].formData.columnType=='decimal'){
                  if(Number(ruleVal)==NaN){
                    ruleVal=0;
                  }else{
                    ruleVal=Number(ruleVal);
                  }
                  tempSql=tempSql.concat(`${ruleVal},`);
                  tempObject[data.columnData[k].columnName]=ruleVal;
                }
                else{
                  tempSql=tempSql.concat(`'${ruleVal}',`);
                  tempObject[data.columnData[k].columnName]=`${ruleVal}`;
                }
              }
            }
          }
          tempSql=tempSql.substr(0,tempSql.length-1).concat(');');
          tempSqls.push(tempSql);
          tempArray.push(tempObject);
        }
        this.createJsonCode(tempArray);//生成json代码
        for(let i=0;i<tempSqls.length;i++){
          if(i==tempSqls.length-1){
            sql=sql.concat(`${tempSqls[i]}`);
          }else{
            sql=sql.concat(`${tempSqls[i]}\n`);
          }
          
        }
        this.editorValue2=sql;
          setTimeout(()=>{
            this.$refs.monaco2.setVal(sql);
          },100);
      }else{
        this.$message({
          showClose: true,
          message: '表名不能为空,请检查后再试',
          type: 'error'
        });
      }
    },
    //生成json代码
    createJsonCode(array){
      this.editorValue3=JSON.stringify(array);
    },
    //生成实体代码
    createEntityCode(data){
      let sql=`import { Column,Entity,PrimaryGeneratedColumn,PrimaryColumn } from "typeorm";\n\n`;
      if(data.tableName){
        if(data.tableNote){
          sql=sql.concat(`//${data.tableNote}\n`);
        }
        sql=sql.concat(`@Entity({ name:'${data.tableName}' })\nexport class ${data.tableName.replace(data.tableName.substr(0,1),data.tableName.substr(0,1).toUpperCase())} {\n`);
        for(let i=0;i<data.columnData.length;i++){
          //如果字段名和字段类型存在
          if(data.columnData[i].columnName && data.columnData[i].formData.columnType){
            //如果主键
            if(data.columnData[i].formData.primary){
              //如果自增
              if(data.columnData[i].formData.autoIncrement){
                sql=sql.concat(`@PrimaryGeneratedColumn({`);
              }else{
                sql=sql.concat(`@PrimaryColumn({`);
              }
            }else{
              sql=sql.concat(`@Column({`);
            }
            //处理类型
            if(data.columnData[i].formData.columnType.indexOf("(255)")!=-1){
              data.columnData[i].formData.columnType=data.columnData[i].formData.columnType.substr(0,data.columnData[i].formData.columnType.length-5);
            }
            sql=sql.concat(` type: '${data.columnData[i].formData.columnType}',`);
            //如果非空
            if(data.columnData[i].formData.notNull){
              sql=sql.concat(` nullable: false,`);
            }
            //如果可为空
            if(data.columnData[i].formData.notNull==false){
              sql=sql.concat(` nullable: true,`);
            }
            //如果默认值
            if(data.columnData[i].formData.default){
              //如果字段类型为数字
              if(data.columnData[i].formData.columnType.indexOf('int')!=-1 || data.columnData[i].formData.columnType=='float' || data.columnData[i].formData.columnType=='double' || data.columnData[i].formData.columnType=='decimal'){
                if(Number(data.columnData[i].formData.default)==NaN){
                  data.columnData[i].formData.default=0;
                }else{
                  data.columnData[i].formData.default=Number(data.columnData[i].formData.default);
                }
                sql=sql.concat(` default: ${data.columnData[i].formData.default},`);
              }else{
                sql=sql.concat(` default: '${data.columnData[i].formData.default}',`);
              }
            }
            //如果注释
            if(data.columnData[i].formData.columnNote){
              sql=sql=sql.concat(` comment:'${data.columnData[i].formData.columnNote}',`);
            }
            sql=sql.substr(0,sql.length-1).concat(`})\n`);
            sql=sql.concat(`${data.columnData[i].columnName}: `);
            //如果字段类型为数字
            if(data.columnData[i].formData.columnType.indexOf('int')!=-1 || data.columnData[i].formData.columnType=='float' || data.columnData[i].formData.columnType=='double' || data.columnData[i].formData.columnType=='decimal'){
              sql=sql.concat(`number;\n\n`);
            }else{
              sql=sql.concat(`string;\n\n`);
            }
          }else{
            this.$message({
              showClose: true,
              message: '字段名和字段类型不能为空,请检查后再试',
              type: 'error'
            });
            break;
          }
        }
        sql=sql.concat(`}`);
        this.editorValue4=sql;
      }else{
        this.$message({
          showClose: true,
          message: '表名不能为空,请检查后再试',
          type: 'error'
        });
      }
    },
    //随机生成日期/时间戳
    randomDate(type){
      let min=new Date('1970-01-01').getTime();
      let max=new Date().getTime();
      let random=Math.floor(Math.random()*(max-min+1)+min);
      if(type=='date'){
        return new Date(random).toJSON().substr(0,10);
      }else if(type=='timestamp'){
        return random;
      }
    },
    //随机生成网址
    randomUrl(){
      let letters = 'abcdefghijklmnopqrstuvwxyz';
      let numbers = '0123456789';
      let url = 'https://';
      for (let i = 0; i < 10; i++) {
        let randChar = Math.random() < 0.5 ? letters[Math.floor(Math.random() * letters.length)] : numbers[Math.floor(Math.random() * numbers.length)];
        url += randChar;
      }
      url += '.com';
      return url;
    },
    //随机生成IP
    randomIP(){
      return new RandExp(/((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))/).gen();
    },
    //随机生成邮箱
    randomEmail(){
      const usernameLength = Math.floor(Math.random() * 10) + 5; // 长度在5到14之间
      let username = '';
      const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
      for (let i = 0; i < usernameLength; i++) {
        username += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      //随机生成域名
      const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
      const domainIndex = Math.floor(Math.random() * domains.length);
      const domain = domains[domainIndex];
      //返回邮箱地址
      return `${username}@${domain}`;
    },
    //随机生成手机号
    randomPhone(){
      return new RandExp(/^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/).gen();
    },
    //随机生成人名
    async randomName(){
      let result=await Axios.get('https://v.api.aa1.cn/api/api-xingming/index.php',{
        params:{
        }
      });
      return result.data.xingming;
    },
    //随机性别
    randomSex(type){
      let sexs=['男','女'];
      let random=Math.floor(Math.random()*sexs.length);
      if(type=='string'){
        return sexs[random];
      }else if(type=='number'){
        return random;
      }
      

    },
    dialogFormButtonClick(operation,data){
      if(operation=='导入'){
        this.importCreateTableSql(data.createTableSql);
        this.dialog1.dialogVisible=false;
      }else if(operation=='重置'){
        this.$confirm('此操作将清空导入的建表语句, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.dialogFormData={
            createTableSql:null
          }
          this.$message({
            type: 'success',
            message: '重置成功!'
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消重置'
          });          
        });
      }
    },
    dialogFormClose(done){
      this.$confirm('关闭将不会保存导入的建表语句, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          done();
          this.dialog1.dialogVisible=false;
          this.dialogFormData={
            createTableSql:null
          }
          this.$message({
            type: 'success',
            message: '关闭成功!'
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消关闭'
          });          
        });
    },
    //导入建表SQL
    importCreateTableSql(data){
      this.tableData={
        tableName:null,
        tableNote:null,
        tableCount:20,
        columnData:[]
      }
      this.tableData.tableName=data.substring(data.match(/table/i).index+6,data.match(/\(/).index).trim().replaceAll('`','');
      let columns=data.substring(data.indexOf('(')+1,data.lastIndexOf(')')).split(',');
      for(let i=0;i<columns.length;i++){
        //如果数据类型正确
        if(this.isType(columns[i].split(' ')[3])){
          this.addColumn();
          this.tableData.columnData[this.tableData.columnData.length-1].columnName=columns[i].split(' ')[2].trim().replaceAll('`','');
          this.tableData.columnData[this.tableData.columnData.length-1].formData.columnType=columns[i].split(' ')[3].trim().replaceAll('`','');
          //如果非空
          if(columns[i].match(/not null/i)!=null){
            this.tableData.columnData[this.tableData.columnData.length-1].formData.notNull=true;
          }
          //如果默认值
          if(columns[i].split(' ').findIndex(item=>item.match(/default/i))!=-1){
            let tempDefault=columns[i].split(' ')[columns[i].split(' ').findIndex(item=>item.match(/default/i))+1];
            //如果默认值不为空
            if(tempDefault.match(/null/i)==null){
              this.tableData.columnData[this.tableData.columnData.length-1].formData.default=tempDefault.trim().replaceAll("'",'');
            }
          }
          //如果主键
          if(columns[i].match(/primary key/i)!=null){
            this.tableData.columnData[this.tableData.columnData.length-1].formData.primary=true;
          }
          //如果自增
          if(columns[i].match(/auto_increment/i)!=null){
            this.tableData.columnData[this.tableData.columnData.length-1].formData.autoIncrement=true;
          }
          //如果注释
          if(columns[i].split(' ').findIndex(item=>item.match(/comment/i))!=-1){
            let tempColumnNote=columns[i].split(' ')[columns[i].split(' ').findIndex(item=>item.match(/comment/i))+1];
            this.tableData.columnData[this.tableData.columnData.length-1].formData.columnNote=tempColumnNote.trim().replaceAll("'",'');
          }
        }
        //如果是主键索引语句
        else if(columns[i].match(/primary key/i)!=null){
          let primaryColumn=columns[i].substring(columns[i].indexOf('(')+1,columns[i].indexOf(')')).trim().replaceAll('`','');
          for(let i=0;i<this.tableData.columnData.length;i++){
            if(this.tableData.columnData[i].columnName==primaryColumn){
              this.tableData.columnData[i].formData.primary=true;
            }
          }
        }
      }
    },
    //判断是否是数据类型
    isType(data){
      let types=["tinyint","smailint","mediumint","int","bigint","float","double","decimal","date","time","year","datetime","timestamp","char","varchar","tinytext","text","mediumtext","longtext","tinyblob","blob","mediumblob","longblob","binary","varbinary"];
      let flag=false;
      for(let i=0;i<types.length;i++){
        if(data.indexOf(types[i])!=-1){
          flag=true;
        }
      }
      return flag;
    },
  },
  mounted(){
  }
}
</script>

<style scoped>
	.el-dropdown-link {
		cursor: pointer;
		color: #409EFF;
	}
	.el-icon-arrow-down {
		font-size: 12px;
	}
  .father{
    display: flex;
    align-self: auto;
    justify-self: auto;
  }
</style>
