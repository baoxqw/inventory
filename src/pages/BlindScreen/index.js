import React from 'react';
import {
    StyleSheet,
    View,
    DeviceEventEmitter,
    Alert, ProgressBarAndroid, Text
} from 'react-native';
import {Button, Provider, SearchBar, Toast} from '@ant-design/react-native';
import * as Font from 'expo-font';
import { fontData } from "../../config/fontData";
import asyncStorage from '@react-native-async-storage/async-storage';
import ExampleThree from '../../components/Table/index';
import Loading from "../../components/Loading";
import { saveFile } from "../../Tool/File";

class index extends React.Component {
    static navigationOptions ={
        title: '盲盘',
    }

    constructor(props) {
        super(props);
        this.state = {
            queryData:{
                storname:'',
                vbatchcode:'',
                code:'',
                name:'',
                type:'',
                spec:'',
            },
            layout: 'list',
            fontsLoaded: false,

            isLoading: true,
            //网络请求状态
            error: false,

            activeSections:[],

            storKey:{},

            rackKey:{},

            loading:false,

            tableHead:['序号','仓库编码','货位名称','物料编码','批次号','账面数量','质量等级','规格','盘点数量'],
            titleCode:['number','storcode','rackname','code','vbatchcode','nonhandastnum','quality','spec','ncountastnum'],
            widthArr: [100,200, 200, 200, 200, 200, 200, 200, 200],

            value:'',


            pageIndex: 0,
            pageSize: 50,

            dataArray: [], //保存总数据
            queryDataList:[], //保存查询数据
            pageDataList:[]//保存当页也数据
        }
    }

    async _loadFontsAsync() {
        await Font.loadAsync(fontData);
        this.setState({ fontsLoaded: true });
    }

    async componentDidMount() {
        await this._loadFontsAsync();
      /*  this.getData();
        this.backFromShopListener = DeviceEventEmitter.addListener(
            'BackRefresh',  //监听器名
            () => {
                this.getData(); //此处写你的得到列表数据的函数
            },
        );
        this._navListener = this.props.navigation.addListener('didFocus', () => { this.getData(); })*/
    }

/*    componentWillUnmount() {
        this.backFromShopListener && this.backFromShopListener.remove();
        this._navListener && this._navListener.remove();
    }*/

    getData = ()=>{
        asyncStorage.getItem('blindList',async (error,result)=>{
            if (!error) {
                if(result){
                    let arrList = [];
                    const arrData = JSON.parse(result);
                    if(arrData.length){
                        for(let i = 0;i<arrData.length;i++){
                            const list = await asyncStorage.getItem(arrData[i]);
                            arrList = [...arrList,...JSON.parse(list)];
                        }
                    }

                    const { pageIndex,pageSize } = this.state;
                    this.setState({
                        dataArray: arrList
                    })
                    this.setDataList(arrList,pageIndex,pageSize)
                }else{
                    this.setState({
                        dataArray: [],
                        queryDataList: [],
                        pageDataList:[],
                        getDataLoading: false
                    })
                }
            }
        })
    }

    onSave = async ()=>{
        const { dataArray } = this.state
        try{
            this.setState({
                loading:true
            });
            const bool = await saveFile("blindList.txt",dataArray);
            if(bool){
                Toast.info("保存成功",1)
            }
        }catch (e) {
            this.setState({
                loading:false
            })
        }
        this.setState({
            loading:false
        })
    };

    onChangeValue = (value) => {
        this.setState({
            value
        })
    };

    onCancelValue = () => {
        const { dataArray } = this.state;
        this.setState({
            value: '',
            getDataLoading: true
        })
        setTimeout(()=>{
            this.setDataList(dataArray,0,50);
        },0)
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
        this.setDataList(list,0,50)
    }

    onClean = ()=>{
        Alert.alert("温馨提示","确认清空吗?",[
            {
                text: "取消"
            },
            {
                text:"确认",
                onPress:async ()=>{
                    await asyncStorage.removeItem("blindList");
                    this.setState({
                        dataArray: [],
                        queryDataList:[],
                        pageDataList:[],
                        value:'',
                        pageIndex: 0
                    })
                }
            }
        ])
    };

    setDataList = (dataList,pageIndex,pageSize,value)=>{
        let list = dataList;
        if(value){
            list = dataList.filter((item)=>{
                for(let key in item){
                    if(item[key] && item[key].toString().indexOf(value) !== -1){
                        return item;
                    }
                }
            })
        }
        list.map((item,index)=>{
            item.number = index + 1;
        })
        const pageList = list.slice(pageIndex * pageSize,(pageIndex + 1) * pageSize);
        if(pageList.length){
            this.setState({
                pageIndex
            })
        }
        this.setState({
            queryDataList: list,
            pageDataList: pageList,
            getDataLoading: false,
        })
    }

    shuaXin = ()=>{
        this.setState({
            pageIndex: 0,
            pageSize: 50,
            getDataLoading: true
        })
        setTimeout(()=>{
            this.getData()
        },0)
    }

    shang = ()=>{
        const { pageIndex,pageSize,queryDataList } = this.state;
        if(pageIndex === 0){
            return
        }
        this.setState({
            getDataLoading: true
        })
        setTimeout(()=>{
            this.setDataList(queryDataList,pageIndex - 1,pageSize);
        },0)
    }

    xia = ()=>{
        const { pageIndex,pageSize,queryDataList } = this.state;
        if((pageIndex + 1) * pageSize > queryDataList.length){
            return
        }
        this.setState({
            getDataLoading: true
        })
        setTimeout(()=>{
            this.setDataList(queryDataList,pageIndex + 1,pageSize);
        },0)
    }

    render() {
        const { fontsLoaded,getDataLoading, pageDataList,loading,titleCode,queryDataList,value,widthArr,tableHead,pageIndex} = this.state;

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
            },
            zanWu:{
                flex:1,
                alignItems:'center',
                justifyContent:'center',
            }
        });

        let tableData = [];
        if(pageDataList && pageDataList.length){
            tableData = pageDataList.map((item,index) =>{
                const obj = {};
                //过滤数据
                for(let key in item){
                    obj['number'] = index + 1
                    if(key === 'storcode'){
                        obj['storcode'] = item[key];
                    }
                    if(key === 'rackname'){
                        obj['rackname'] = item[key];
                    }
                    if(key === 'code'){
                        obj['code'] = item[key];
                    }
                    if(key === 'vbatchcode'){
                        obj['vbatchcode'] = item[key];
                    }
                   /* if(key === 'nonhandnum'){
                        obj['nonhandnum'] = item[key] || 0;
                    }*/
                    if(key === 'nonhandastnum'){
                        obj['nonhandastnum'] = item[key] || 0;
                    }
                    if(key === 'quality'){
                        obj['quality'] = item[key];
                    }
                    if(key === 'spec'){
                        obj['spec'] = item[key];
                    }
                    if(key === 'ncountastnum'){
                        obj['ncountastnum'] = item[key] || 0;
                    }
                    /*if(key === 'ncountnum'){
                        obj['ncountnum'] = item[key] || 0;
                    }*/
                }
                return obj;
            })
        }

        return (
            <Provider style={styles.container}>
                <View style={{flexDirection: 'row'}}>
                    <View style={{flex:1}}>
                        <Button onPress={()=>this.props.navigation.navigate('Cargo',{

                        })}>扫码</Button>
                    </View>
                    <View style={{flex:1}}>
                        <Button  onPress={()=>{this.onClean()}}>清空</Button>
                    </View>
                    <View style={{flex:1}}>
                        <Button  onPress={()=>{this.onSave()}}>保存</Button>
                    </View>
                    <View style={{flex:1}}>
                        <Button  onPress={()=>{this.shuaXin()}}>刷新</Button>
                    </View>
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
                    <ExampleThree widthArr={widthArr} tableHead={tableHead} tableList={tableData} titleCode={titleCode}/>
                </View>
                <View style={{flexDirection: 'row'}}>
                    <View style={{flex:1}}>
                        <Button onPress={this.shang}>上一页</Button>
                    </View>
                    <View style={{flex:1,backgroundColor:'#fff'}}>
                        {
                            getDataLoading? <ProgressBarAndroid styleAttr='Inverse' color='#0d11ec' /> : <View style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                                <Text style={{marginTop: 5}}>第 {`${pageIndex + 1}`}页</Text>
                                <Text>共 {`${queryDataList.length}`}条</Text>
                            </View>
                        }
                    </View>
                    <View style={{flex:1}}>
                        <Button onPress={this.xia}>下一页</Button>
                    </View>
                </View>
                {
                    loading? <Loading title={'正在保存'}/> :null
                }
            </Provider >
        );
    }
}

export default index;
