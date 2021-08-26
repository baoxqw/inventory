import React from 'react';
import {Text, View, StyleSheet, Modal, Alert, SafeAreaView, DeviceEventEmitter, ScrollView} from 'react-native';
import {BarCodeScanner} from 'expo-barcode-scanner';
import {Button, InputItem, List, Provider, Toast} from '@ant-design/react-native';
import asyncStorage from '@react-native-async-storage/async-storage';
import moment from "moment";
import {Audio} from 'expo-av';
import saoma from '../../assets/saoma.mp3';
import {spArr} from "../../Tool/util";
import {chuLiCode} from "../../Tool/common";
import ExampleThree from "../../components/Table";

const Item = List.Item;

export default class index extends React.Component {
    state = {
        hasPermission: null,
        scanned: false,
        dataList: [],
        matchList: [],
        number: "",
        date: "",

        tableHead:['备料计划号','入库单','图号','产品','任务','操作'],
        titleCode:['materialPlan','inbound','drawing','product','taskId','btn'],
        widthArr: [200,200,200,200,200,200],

        saveStr: '',

        shiWuYList:[], //有入库单的数据
        shiWuWList:[], //无入库单的数据

        moShi: 1, // 0无入库单模式，1有入库单模式

        btnIndexStatus: false
    };

    async componentDidMount() {
        const {status} = await BarCodeScanner.requestPermissionsAsync();
        this.setState({
            hasPermission: status === 'granted'
        });
        setTimeout(async () => {
            const ruKu = await this.getStorageData("ruKu");
            const shiWuY = await this.getStorageData("shiWuY");
            const shiWuW = await this.getStorageData("shiWuW");
            const dataList = chuLiCode(ruKu);
            console.log("dataL",dataList)
            this.setState({
                dataList,
                shiWuYList: shiWuY || [],
                shiWuWList: shiWuW || [],
            })
        }, 0)
    }

    componentWillUnmount() {
        DeviceEventEmitter.emit('BackRefresh', {});
    }

    getStorageData = async (fileName) => {
        const ruKuString = await asyncStorage.getItem(fileName);
        let arrList = [];
        if (ruKuString) {
            const arrData = JSON.parse(ruKuString);
            if (arrData.length) {
                for (let i = 0; i < arrData.length; i++) {
                    const list = await asyncStorage.getItem(arrData[i]);
                    arrList = [...arrList, ...JSON.parse(list)];
                }
            }
        }
        return arrList
    }

    setStorageData = async (data, fileName) => {
        try {
            const dataKey = spArr(data, 100, fileName);
            if (dataKey.keyList.length) {
                await asyncStorage.setItem(fileName, JSON.stringify(dataKey.keyList));
                for (let i = 0; i < dataKey.dataArr.length; i++) {
                    await asyncStorage.setItem(dataKey.dataArr[i].key, JSON.stringify(dataKey.dataArr[i].value));
                }
            }
            Alert.alert("温馨提醒", `保存成功`, [{
                text: '关闭', onPress: () => this.clean()}]);
        } catch (e) {
            Alert.alert("错误提示", `保存失败`, [{
                text: '关闭', onPress: () => this.onSetTile()
            }])
        }
    }

    onSetTile = () => {
        this.setState({
            scanned: false
        })
    }

    playSound = async () => {
        try {
            const {sound} = await Audio.Sound.createAsync(saoma);
            await sound.playAsync();
        } catch (e) {
            console.log("文件错误", e)
        }
    }

    onScanned = (bool = false) => {
        this.setState({
            scanned: bool
        })
    }

    clickFunc = (index,data)=>{
        console.log("data",data)
        const inbound = data[1]; //入库单
        const product = data[3]; //产品
        const taskId = data[4]; // 任务
        const str = "$R" + inbound + "," + product + "," + taskId;
        console.log("str",str)
        this.setState({
            saveStr: str
        })
    }

    onSaveData = async ()=>{
        const { saveStr,number,date,shiWuYList,moShi,shiWuWList} = this.state;
        try{
            if(!number || !date){
                throw '请先扫码'
            }
            if(!saveStr){
                throw '请选择一条入库单'
            }
            if(moShi){
                let sts = false;
                shiWuYList.map(item =>{
                    if(item.codes === saveStr){
                        if(item.numbers.indexOf(number) === -1){
                            item.numbers = item.numbers + "," + number;
                        }
                        sts = true;
                    }
                })
                if(!sts){
                    const obj = {
                        codes:saveStr,
                        date,
                        numbers:"$S" + number
                    }
                    shiWuYList.push(obj)
                }
                console.log("shiWuYList",shiWuYList)
                await this.setStorageData(shiWuYList,'shiWuY');
            }else{
                let s = false;
                shiWuWList.map(item =>{
                    if(item.codes === saveStr){
                        if(item.numbers.indexOf(number) === -1){
                            item.numbers = item.numbers + "," + number;
                        }
                        s = true
                    }
                })
                if(!s){
                    const obj = {
                        codes:saveStr,
                        date,
                        numbers: "$S"+number
                    }
                    shiWuWList.push(obj)
                }
                console.log("shiWuWList",shiWuWList)
                await this.setStorageData(shiWuWList,'shiWuW');
            }
        }catch (e) {
            return Alert.alert("错误提示", e, [{
                text: '关闭'
            }])
        }
    }

    clean = async ()=>{
        const shiWuY = await this.getStorageData("shiWuY");
        const shiWuW = await this.getStorageData("shiWuW");
        this.setState({
            matchList: [],
            number: "",
            date: "",
            scanned: false,
            moShi: 1,
            saveStr: '',
            shiWuYList:shiWuY,
            shiWuWList:shiWuW,
            btnIndexStatus: !this.state.btnIndexStatus
        })
    }

    render() {
        const {hasPermission, scanned, dataList, number, date, moShi,saveStr,btnIndexStatus, tableHead,titleCode,widthArr,matchList,widths,headers,titles} = this.state;

        if (hasPermission === null) {
            return <Text>申请相机许可</Text>;
        }
        if (hasPermission === false) {
            return <Text>无法使用相机</Text>;
        }

        const handleBarCodeScanned = async ({data, type}) => {
            await this.playSound();
            console.log("data", data)

            this.setState({
                scanned: true
            })
            try {
                if (type !== 256 || typeof data !== 'string' || data.length < 20) {
                    throw "请扫描正确的二维码";
                }
                const { shiWuYList } = this.state;
                const date = moment().format('YYYY-MM-DD HH:mm:ss');
                const arr = data.split(",");
                const product = arr[0]; //产品单号
                const number = arr[1]; //序列号
                const taskId = arr[2]; //任务id
                const arrList = [];
                dataList.forEach(item => {
                    if (item.children) {
                        item.children.forEach(ite => {
                            if (ite.children) {
                                ite.children.forEach(it => {
                                    if (it.product === product && it.taskId === taskId) {
                                        const obj = {
                                            materialPlan: item.value,
                                            inbound: ite.inbound,
                                            drawing: ite.drawing,
                                            product: it.product,
                                            taskId: it.taskId
                                        }
                                        arrList.push(obj)
                                    }
                                })
                            }
                        })
                    }
                })
                let status = false;
                arrList.forEach(item =>{
                    const str = "$R" + item.inbound + "," + item.product + "," + item.taskId;
                    shiWuYList.forEach(it=>{
                        if(it.codes === str){
                            if(it.numbers.indexOf(number) !== -1){
                                status = true;
                            }
                        }
                    })
                })

                if(status){
                    return Alert.alert("温馨提示", "此码数据已存在，是否更新?", [{
                        text: '忽略',onPress:()=>{
                            this.setState({
                                scanned: false,
                            })
                        }
                    }, {
                        text: '更新', onPress: () => {
                            this.setState({
                                scanned: false,
                                matchList: arrList,
                                number,
                                date,
                                moShi: 1
                            })
                        }
                    }])
                }

                if (arrList.length) {
                    this.setState({
                        scanned: false,
                        matchList: arrList,
                        number,
                        date,
                        moShi:1
                    })
                } else {
                    return Alert.alert("温馨提示", "没有匹配的对应的入库单，是否使用无入库单模式", [{
                        text: '否',onPress:()=>{
                            this.setState({
                                scanned: false
                            })
                        }
                    }, {
                        text: '是', onPress: () => {
                            const saveStr = "$RX," + product + "," + taskId;
                            this.setState({
                                moShi: 0,
                                number,
                                date,
                                saveStr
                            })
                        }
                    }])
                }
            } catch (e) {
                return Alert.alert("错误提示", e, [{
                    text: '关闭', onPress: () => this.onSetTile()
                }])
            }
        };

        return <SafeAreaView style={styles.container}>
            <BarCodeScanner
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={styles.barCode}
            />
            <Provider>
                <View style={{flex:1}}>
                    {
                        moShi?<ExampleThree btnIndexStatus={btnIndexStatus} widthArr={widthArr} tableHead={tableHead} tableList={matchList} titleCode={titleCode} clickFunc={(index,data)=>this.clickFunc(index,data)} titleBtn={'选择'}/>:null
                    }
                </View>
                <View style={styles.button}>
                    <List>
                        {
                            !moShi?<Item extra={saveStr} onPress={()=>{
                                Toast.info(saveStr,3)
                            }}>
                                无入库单
                            </Item>:null
                        }
                        <Item extra={number}>
                            当前序列号
                        </Item>
                        <Item extra={date}>
                            扫码时间
                        </Item>
                    </List>
                </View>
                <View style={styles.button}>
                    <Button onPress={() => this.onSaveData()}>保存</Button>
                </View>
            </Provider>

        </SafeAreaView>
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    barCode: {
        flex: 1
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
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    button: {
        marginTop: 12
    },
    header: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    listStyle: {
        marginBottom: 12
    }
});
