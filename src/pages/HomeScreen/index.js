import React from 'react';
import { StyleSheet, Text, View, Alert, DeviceEventEmitter,ProgressBarAndroid } from 'react-native';
import {Toast, SearchBar, Button, Provider} from '@ant-design/react-native';
import * as Font from 'expo-font';
import { fontData } from "../../config/fontData";
import asyncStorage from '@react-native-async-storage/async-storage';
import Api from '../../service/Api';
import LockTableView from "../../components/LockTableView";

class index extends React.Component {
    static navigationOptions = {
        title: '首页',
    }

    constructor(props) {
        super(props);
        this.state = {
            layout: 'list',
            fontsLoaded: false,

            isLoading: true,
            //网络请求状态
            error: false,
            errorInfo: "",
            dataArray: [],

            value: '',

            loading: false,

            titleData:['盘点单号','仓库编码','仓库名称','货位编码','批次号','物料编码','物料名称','差异数量','差异主数量','账面数量','账面主数量','盘点数量','盘点主数量'],
            titleCode:['vbillcode','storcode','storname','rackcode','vbatchcode','code','name','ndiffastnum','ndiffnum','nonhandastnum','nonhandnum','ncountastnum','ncountnum'],

        }
    }

    async _loadFontsAsync() {
        await Font.loadAsync(fontData);
        this.setState({fontsLoaded: true});
    }

    componentDidMount() {
        this._loadFontsAsync();
    }

    componentWillUnmount() {
        DeviceEventEmitter.emit('BackRefresh', {});
    }

    onChangeValue = (value) => {
        this.setState({
            value: value
        })
    };

    onCancelValue = () => {
        this.setState({
            value: '',
            dataArray:[],
            loading:false
        })
    }

    onSubmitInput = async (value) => {
        this.setState({
            loading:true,
            dataArray:[]
        })
        const res = await Api(`/servlet/InventoryHttpImpl?address=queryOnhandByParam&vbillcode=${value}`,'get',{}).catch((error)=>{
            console.log("error",error)
            Alert.alert("错误提示",`网络连接超时,请检查网络`,[{
                text:'关闭',onPress:()=>this.setState({
                    loading:false
                })
            }])
        })
        console.log("res",res)
        if(res.code === "1"){
            this.setState({
                dataArray: res.data
            })
        }else{
            this.setState({
                dataArray: []
            })
        }
        this.setState({
            loading:false
        })
    }

    onPress = async () => {
        Alert.alert("温馨提示", '确定保存到本地吗? 如果本地有已存在的物料将会被清除', [{
            text: '取消'
        }, {
            text: '确定', onPress: async () => {
               const { dataArray } = this.state;
                /* const resList = await asyncStorage.getItem("dataList");
                if (resList !== null) {
                    const dataList = JSON.parse(resList);
                    //标记已存在的
                    for(let i = 0;i<dataList.length;i++){
                        for(let j = 0;j<dataArray.length;j++){
                            if(dataList[i].code === dataArray[j].code && dataList[i].storcode === dataArray[j].storcode && dataList[i].vbillcode === dataArray[j].vbillcode){
                                dataArray[j].status = true
                            }
                        }
                    }
                    //过滤掉已存在的
                    const list = dataArray.filter(item=>!item.status);
                    this.setDataItem([...dataList,...list])
                }else{
                    this.setDataItem(dataArray)
                }*/
                await asyncStorage.removeItem("dataList")
                this.setDataItem(dataArray)
            }
        }])
    }

    setDataItem = (data)=>{
        asyncStorage.setItem("dataList", JSON.stringify(data),(error)=>{
            if(error){
                Toast.info("保存失败",1.5)
            }else{
                Toast.success("保存成功",1.5,()=>{
                    this.setState({
                        dataArray:[],
                        value:''
                    })
                })
            }
        })
    }

    render() {
        const {value, fontsLoaded, dataArray,loading,titleCode,titleData} = this.state;

        if (!fontsLoaded) {
            return <View></View>
        }

        const styles = StyleSheet.create({
            container: {
                flex: 1,
            },
            contentList: {
                marginBottom: 200
            },
            item: {
                padding: 12,
                //border: '1px solid red'
            },
            loadingBox:{
                flex:1,
                alignItems:'center',
                justifyContent:'center',
                backgroundColor:'rgb(255,255,255)',
            },
            zanWu:{
                flex:1,
                alignItems:'center',
                justifyContent:'center',
            }
        });

        let tableData = [];
        if(dataArray && dataArray.length){
            tableData = dataArray.map((item,index) =>{
                const obj = {};
                //过滤数据
                for(let key in item){
                    if(key === 'vbillcode'){
                        obj['vbillcode'] = item[key];
                    }
                    if(key === 'storcode'){
                        obj['storcode'] = item[key];
                    }
                    if(key === 'storname'){
                        obj['storname'] = item[key];
                    }
                    if(key === 'rackcode'){
                        obj['rackcode'] = item[key];
                    }
                    if(key === 'vbatchcode'){
                        obj['vbatchcode'] = item[key];
                    }
                    if(key === 'code'){
                        obj['code'] = item[key];
                    }
                    if(key === 'name'){
                        obj['name'] = item[key];
                    }
                    if(key === 'ndiffastnum'){
                        obj['ndiffastnum'] = item[key];
                    }
                    if(key === 'ndiffnum'){
                        obj['ndiffnum'] = item[key];
                    }
                    if(key === 'nonhandastnum'){
                        obj['nonhandastnum'] = item[key];
                    }
                    if(key === 'nonhandnum'){
                        obj['nonhandnum'] = item[key];
                    }
                    if(key === 'ncountastnum'){
                        obj['ncountastnum'] = item[key];
                    }
                    if(key === 'ncountnum'){
                        obj['ncountnum'] = item[key];
                    }

                    if(!obj['vbatchcode']){
                        obj['vbatchcode'] = ''
                    }
                }
                return obj;
            })
        }

        return (
            <Provider style={styles.container}>
                <View>
                    <SearchBar
                        placeholder={'请输入盘点单号'}
                        value={value}
                        showCancelButton={true}
                        onChange={(value) => this.onChangeValue(value)}
                        onCancel={() => this.onCancelValue()}
                        onSubmit={(value) => this.onSubmitInput(value)}
                    />
                </View>
                {
                    loading? <View style={styles.loadingBox}>
                        <ProgressBarAndroid styleAttr='Inverse' color='#0d11ec' />
                    </View>:dataArray.length?<View style={{flex:1}}>
                        <Button onPress={this.onPress}>保存</Button>
                        <LockTableView titleCode={titleCode} tableData={tableData} titleData={titleData} keyStr={"code"}/>
                    </View>:<View style={styles.zanWu}>
                        <Text style={{fontSize: 24,color:'#bfbfbf'}}>暂无数据</Text>
                    </View>
                }
            </Provider>
        );
    }
}

export default index;
