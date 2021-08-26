import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    VirtualizedList,
    SafeAreaView,
    DeviceEventEmitter,
    TouchableHighlight,
    Alert
} from 'react-native';
import {Button, List, SearchBar} from '@ant-design/react-native';
import * as Font from 'expo-font';
import { fontData } from "../../config/fontData";
import asyncStorage from "@react-native-async-storage/async-storage";
import LockTableView from "../../components/LockTableView";
import Api from "../../service/Api";

class index extends React.Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: navigation.getParam('detail', '')
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            fontsLoaded: false,

            isLoading: true,
            //网络请求状态
            error: false,

            dataArray: [],

            name: '',
            id: null,
            param:{},

            activeSections:[],
            dataKey:{},

            titleData:['盘点单号','仓库编码','仓库名称','货位编码','批次号','物料编码','物料名称','差异数量','差异主数量','账面数量','账面主数量','盘点数量','盘点主数量'],
            titleCode:['vbillcode','storcode','storname','rackcode','vbatchcode','code','name','ndiffastnum','ndiffnum','nonhandastnum','nonhandnum','ncountastnum','ncountnum'],

            value:'',

            copyDataList:[],

        }
    }

    async _loadFontsAsync() {
        await Font.loadAsync(fontData);
        this.setState({ fontsLoaded: true });
    }

    componentDidMount() {
        this._loadFontsAsync();
        this.getData();
        this.backFromShopListener = DeviceEventEmitter.addListener(
            'BackRefreshDetails',  //监听器名
            () => {
                this.getData(); //此处写你的得到列表数据的函数
            },
        );
    }

    componentWillUnmount() {
        this.backFromShopListener && this.backFromShopListener.remove();
        DeviceEventEmitter.emit('BackRefresh', {});
    }

    getData = ()=>{
        const { params } = this.props.navigation.state;
        console.log("执行",params)
        if(params){
            const { name,id } = params;
            this.props.navigation.setParams({ detail: name })
            this.getAsyncStoreData(id)
            this.setState({
                name,
                id
            })
        }
    }

    getAsyncStoreData = (id)=>{
        asyncStorage.getItem('dataList',(error,result)=>{
            if (!error) {
                if(result){
                    const dataList = JSON.parse(result);
                    const list = dataList.filter(item =>item.cwarehouseid === id);
                    if(list.length){
                        const dataList = this.getForData(list);
                        console.log("data",dataList)
                        this.setState({
                            dataArray: dataList,
                            copyDataList: dataList,
                        })
                    }else{
                        this.setState({
                            dataArray: [],
                            copyDataList:[]
                        })
                    }
                }
            }
        })
    }

    getForData = (list)=>{
        const dataList = [];
        list.forEach((item,index)=>{
            const arr = item.data
            if(arr && arr.length){
                arr.map(it=>{
                    if(it.data && it.data.length){
                        it.data.map((t)=>{
                            dataList.push(t)
                        })
                    }
                })
            }
        })
        return dataList;
    }

    onChangeValue = (value) => {
        this.setState({
            value
        })
    };

    onCancelValue = () => {
        const { dataArray } = this.state;
        this.setState({
            value: '',
            copyDataList: dataArray,
            loading:false
        })
    }

    onSubmitInput = (value) => {
        const { dataArray } = this.state;
        const list = dataArray.filter((item)=>{
            for(let key in item){
                if(item[key] && item[key].toString().indexOf(value) !== -1){
                    return item;
                }
            }
        })
        this.setState({
            copyDataList:list
        })
    }

    render() {
        const { fontsLoaded, dataArray,copyDataList,name,id,titleData,titleCode,value } = this.state;

        if (!fontsLoaded) {
            return <View></View>
        }

        const styles = StyleSheet.create({
            container: {
                flex: 1
            },
            item:{
                padding: 12,
                //border: '1px solid red'
            }
        });
        let tableData = [];
        if(copyDataList && copyDataList.length){
            tableData = copyDataList.map((item,index) =>{
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
        console.log("tableData",tableData)
        return (
            <SafeAreaView style={styles.container}>
                <View>
                    <Button onPress={()=>this.props.navigation.navigate('Material',{
                        name,
                        id
                    })}>扫码</Button>
                </View>
                <View>
                    <SearchBar
                        placeholder={'请输入查询条件'}
                        value={value}
                        showCancelButton={true}
                        onChange={(value) => this.onChangeValue(value)}
                        onCancel={() => this.onCancelValue()}
                        onSubmit={(value) => this.onSubmitInput(value)}
                    />
                </View>
                <View style={{flex:1}}>
                    <LockTableView titleCode={titleCode} tableData={tableData} titleData={titleData} keyStr={"code"}/>
                </View>
            </SafeAreaView >
        );
    }
}

export default index;
