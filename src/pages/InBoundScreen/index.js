import React from 'react';
import {StyleSheet, View, Text, Alert, ProgressBarAndroid, ScrollView, SafeAreaView, Modal} from 'react-native';
import {
    Button,
    Accordion,
    Provider,
    SearchBar,
    List,
    Drawer,
    Toast,
} from '@ant-design/react-native';
import * as Font from 'expo-font';
import {fontData} from "../../config/fontData";
import asyncStorage from '@react-native-async-storage/async-storage';
import Loading from "../../components/Loading";
import {chuLiCode} from "../../Tool/common";
import QRCode from 'react-native-qrcode-svg';
import {zipFunc,unzipFunc} from '../../Tool/util';
const Item = List.Item;

class index extends React.Component {
    static navigationOptions = {
        title: '用户',
    }

    constructor(props) {
        super(props);
        this.state = {
            layout: 'list',
            fontsLoaded: false,

            isLoading: true,
            //网络请求状态
            error: false,


            loading: false,
            getDataLoading: false,
            value: '',

            pageIndex: 0,
            pageSize: 50,

            dataArray: [],
            dataArrayL:[],
            dataArrayYW: [],
            queryDataList: [], //保存查询数据
            pageDataList: [],//保存当页也数据

            activeSections: [],

            tab: 1,

            itemList:[],
            queryItemList:[],
            childValue:'',
            childLoading: false,

            qrStr:'',
            visible: false
        }
    }

    async _loadFontsAsync() {
        await Font.loadAsync(fontData);
        this.setState({fontsLoaded: true});
    }

    componentDidMount() {
        this._loadFontsAsync();
    }

    getData = async () => {
        this.setState({
            getDataLoading: true
        })
        const {pageIndex, pageSize, tab} = this.state;
        if (tab === 1) {
            const array = await this.getDataList("ruKu") || [];
            const dataArrayL = chuLiCode(array)
            this.setState({
                dataArray: dataArrayL,
                dataArrayL: dataArrayL,
            })
            this.setDataList(dataArrayL, pageIndex, pageSize)
        } else {
            const arrayY = await this.getDataList("shiWuY") || [];
            const arrayW = await this.getDataList("shiWuW") || [];
            console.log("arrayW",arrayW)
            const arrList = [...arrayY,...arrayW];
            this.setState({
                dataArrayYW: arrList,
                dataArray: arrList
            })
            this.setDataList(arrList, pageIndex, pageSize)
        }
    }

    onChangeValue = (value) => {
        this.setState({
            value
        })
    };

    onCancelValue = () => {
        const {dataArray} = this.state;
        this.setState({
            value: '',
            getDataLoading: true
        })
        setTimeout(() => {
            this.setDataList(dataArray, 0, 50);
        }, 0)
    }

    onSubmitInput = (value) => {
        const {dataArray, dataArrayYW, tab} = this.state;
        let list = [];
        if (tab === 1) {
            list = dataArray.filter((item) => {
                if (JSON.stringify(item).indexOf(value) !== -1) {
                    return item;
                }
            })
        } else {
            list = dataArrayYW.filter((item) => {
                console.log(JSON.stringify(item).indexOf(value) !== -1)
                if (JSON.stringify(item).indexOf(value) !== -1) {
                    return item;
                }
            })
        }
        this.setDataList(list, 0, 50)
    }

    onClean = () => {
        Alert.alert("温馨提示", "确认清空吗?", [
            {
                text: "取消"
            },
            {
                text: "确认",
                onPress: async () => {
                    await this.cleanData("ruKu");
                    await this.cleanData("shiWuY");
                    await this.cleanData("shiWuW");

                    this.setState({
                        value: '',
                        pageIndex: 0,
                        pageSize: 50,
                        dataArray: [],
                        dataArrayL:[],
                        dataArrayYW: [],
                        queryDataList: [],
                        pageDataList: [],
                        activeSections: [],
                        tab: 1,
                        itemList:[],
                        queryItemList:[],
                        childValue:'',
                        childLoading: false,
                    })
                }
            }
        ])
    };

    cleanData = async (fileName)=>{
        const data = await asyncStorage.getItem(fileName);
        const list = JSON.parse(data);
        if (list.length) {
            for (let i = 0; i < list.length; i++) {
                await asyncStorage.removeItem(list[i]);
            }
        }
        await asyncStorage.removeItem(fileName);
    }

    getDataList = async (fileName)=>{
        const array = await asyncStorage.getItem(fileName);
        let arrList = [];
        if(array){
            const arrData = JSON.parse(array);
            if (arrData.length) {
                for (let i = 0; i < arrData.length; i++) {
                    const list = await asyncStorage.getItem(arrData[i]);
                    arrList = [...arrList, ...JSON.parse(list)];
                }
            }
        }
        return arrList;
    }

    setDataList = (dataList, pageIndex, pageSize, value) => {
        let list = dataList;
        if (value) {
            list = dataList.filter((item) => {
                for (let key in item) {
                    if (item[key] && JSON.stringify(item[key]).indexOf(value) !== -1) {
                        return item;
                    }
                }
            })
        }
        list.map((item, index) => {
            item.number = index + 1;
        })
        const pageList = list.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
        if (pageList.length) {
            this.setState({
                pageIndex
            })
        }
        this.setState({
            queryDataList: list,
            pageDataList: pageList,
            getDataLoading: false,
            activeSections: []
        })
    }

    shuaXin = () => {
        this.setState({
            pageIndex: 0,
            pageSize: 50,
            getDataLoading: true
        })
        setTimeout(() => {
            this.getData()
        }, 0)
    }

    shang = () => {
        const {pageIndex, pageSize, queryDataList} = this.state;
        if (pageIndex === 0) {
            return
        }
        this.setState({
            getDataLoading: true
        })
        setTimeout(() => {
            this.setDataList(queryDataList, pageIndex - 1, pageSize);
        }, 0)
    }

    xia = () => {
        const {pageIndex, pageSize, queryDataList} = this.state;
        if ((pageIndex + 1) * pageSize > queryDataList.length) {
            return
        }
        this.setState({
            getDataLoading: true
        })
        setTimeout(() => {
            this.setDataList(queryDataList, pageIndex + 1, pageSize);
        }, 0)
    }

    onTab = (type) => {
        const {tab,dataArrayL,dataArrayYW} = this.state;
        if (tab === type) {
            return
        }
        this.setState({
            tab: type,
            value: '',
            activeSections: [],
            itemList:[],
            queryItemList:[],
            childValue:'',
            childLoading: false,
            dataArray: type === 1?dataArrayL:dataArrayYW,
            queryDataList: type === 1?dataArrayL:dataArrayYW,
            pageIndex: 0,
            pageSize: 50,
            pageDataList:[]
        })
    }

    onOpenChange = isOpen => {
        console.log('是否打开了 Drawer', isOpen.toString());
    };

    onChangeAcc = (activeSections)=>{
        this.setState({ activeSections });
    }

    onChangeChildValue = (value) => {
        this.setState({
            childValue: value
        })
    };

    onCancelChildValue = () => {
        const {itemList} = this.state;
        this.setState({
            childValue: '',
            queryItemList: itemList,
            childLoading: false
        })
    }

    onSubmitChildInput = (value) => {
        const {itemList} = this.state;
        this.setState({
            childLoading: true
        })
        setTimeout(()=>{
            const queryItemList = itemList.filter((item) => {
                if (JSON.stringify(item).indexOf(value) !== -1) {
                    return item;
                }
            })
            this.setState({
                queryItemList,
                childLoading: false
            })
        },0)
    }

    onShowQR = ()=>{
        const { dataArrayYW,tab } = this.state;
        if(!dataArrayYW.length || tab === 1){
            return
        }
        let qrStr = "";
        dataArrayYW.forEach(item =>{
            qrStr = qrStr + item.codes + item.numbers
        })
        const base64Str = zipFunc(qrStr);
        this.setState({
            qrStr:base64Str,
            visible: true
        })
    }

    onOff = ()=>{
        this.setState({
            qrStr:'',
            visible: false
        })
    }

    render() {
        const {
            fontsLoaded,
            pageIndex,
            loading,
            queryDataList,
            value,
            getDataLoading,
            activeSections,
            tab,
            childLoading,
            queryItemList,
            childValue,
            visible,
            qrStr
        } = this.state;

        if (!fontsLoaded) {
            return <View></View>
        }

        console.log("queryDataList", queryDataList)

        const sidebar = (
            <ScrollView style={{flex: 1}}>
                <View>
                    <SearchBar
                        placeholder={'请输入查询条件'}
                        value={childValue}
                        showCancelButton={true}
                        onChange={(value) => this.onChangeChildValue(value)}
                        onCancel={() => this.onCancelChildValue()}
                        onSubmit={(value) => this.onSubmitChildInput(value)}
                    />
                </View>
                {
                    childLoading ? <Loading title={'正在查询'}/> : <Accordion
                        onChange={this.onChangeAcc}
                        activeSections={activeSections}
                    >
                        {
                            queryItemList.map((item,index)=>{
                                return <Accordion.Panel key={index} header={item.inbound}>
                                    <List style={{paddingLeft: 12}} renderHeader={item.drawing}>
                                        {
                                            item.children.map((it,i)=>{
                                                return <Item key={i}>
                                                    {it.value}
                                                </Item>
                                            })
                                        }
                                    </List>
                                </Accordion.Panel>
                            })
                        }
                    </Accordion>
                }
            </ScrollView>
        );

        return (
            <Provider style={styles.container}>
                <Drawer
                    sidebar={sidebar}
                    position="left"
                    open={false}
                    drawerRef={el => (this.drawer = el)}
                    onOpenChange={this.onOpenChange}
                    drawerBackgroundColor="#fff"
                >
                <View style={{flexDirection: 'row'}}>
                    <View style={{flex: 1}}>
                        <Button style={{fontSize: 10}}
                                onPress={() => this.props.navigation.navigate('InCargo', {})}>信息库</Button>
                    </View>
                    <View style={{flex: 1}}>
                        <Button style={{fontSize: 10}}
                                onPress={() => this.props.navigation.navigate('InPicCargo', {})}>交接单</Button>
                    </View>
                    <View style={{flex: 1}}>
                        <Button onPress={() => {
                            this.onClean()
                        }}>清空</Button>
                    </View>
                    <View style={{flex: 1}}>
                        <Button onPress={() => {
                            this.onShowQR()
                        }}>查看</Button>
                    </View>
                    <View style={{flex: 1}}>
                        <Button onPress={() => {
                            this.shuaXin()
                        }}>刷新</Button>
                    </View>
                </View>
                <View style={{flexDirection: 'row'}}>
                    <View style={{flex: 1}}>
                        <Button style={{fontSize: 10, backgroundColor: tab === 1 ? '#5abdf5' : "#fff"}}
                                onPress={() => this.onTab(1)}>信息库</Button>
                    </View>
                    <View style={{flex: 1}}>
                        <Button style={{fontSize: 10, backgroundColor: tab === 2 ? '#5abdf5' : "#fff"}}
                                onPress={() => this.onTab(2)}>交接单</Button>
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
                <View style={{flex: 1}}>
                    <ScrollView
                        style={{flex: 1}}
                        automaticallyAdjustContentInsets={false}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                    >
                        {
                            tab === 1 ? <List>
                                    {
                                        queryDataList.map((item, index) => {
                                            return <Item key={index} extra={item.value} onPress={()=>{
                                                this.setState({
                                                  itemList: item.children,
                                                  queryItemList: item.children
                                                })
                                                this.drawer && this.drawer.openDrawer()
                                            }}>
                                                {item.title}
                                            </Item>
                                        })
                                    }
                                </List>:<Accordion
                                onChange={this.onChangeAcc}
                                activeSections={activeSections}
                                style={{backgroundColor:'#fff'}}
                            >
                                {
                                    queryDataList.map((item,index)=>{
                                        return <Accordion.Panel key={index} header={item.codes}>
                                            <List style={{paddingLeft: 12}}>
                                                <Item extra={item.numbers} onPress={()=>{
                                                    Toast.info(item.numbers,2.5)
                                                }}>序列号</Item>
                                                <Item extra={item.date}>时间</Item>
                                            </List>
                                        </Accordion.Panel>
                                    })
                                }
                            </Accordion>
                        }
                    </ScrollView>
                </View>

                <View style={{flexDirection: 'row'}}>
                    <View style={{flex: 1}}>
                        <Button onPress={this.shang}>上一页</Button>
                    </View>
                    <View style={{flex: 1, backgroundColor: '#fff'}}>
                        {
                            getDataLoading ? <ProgressBarAndroid styleAttr='Inverse' color='#0d11ec'/> :
                                <View style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <Text style={{marginTop: 5}}>第 {`${pageIndex + 1}`}页</Text>
                                    <Text>共 {`${queryDataList.length}`}条</Text>
                                </View>
                        }
                    </View>
                    <View style={{flex: 1}}>
                        <Button onPress={this.xia}>下一页</Button>
                    </View>
                </View>
                {
                    loading ? <Loading title={'正在保存'}/> : null
                }
                </Drawer>


                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={visible}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <View>
                                <QRCode
                                    value={qrStr}
                                />
                                <View style={{marginTop: 12}}>
                                    <Button size={'small'} onPress={()=>this.onOff()}>关闭</Button>
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>
            </Provider>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: 48
    },
    item: {
        padding: 12,
        //border: '1px solid red'
    },
    zanWu: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    content: {
        marginBottom: 12
    },
    centeredView: {
        //flex: 1,
        //justifyContent: "center",
        //alignItems: "center",
        marginTop: '20%'
    },
    modalView: {
        margin: 10,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
        alignItems: "center",
        justifyContent:'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
});

export default index;
