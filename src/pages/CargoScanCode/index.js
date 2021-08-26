import React from 'react';
import { Text, View, StyleSheet, Modal, Alert, SafeAreaView, DeviceEventEmitter } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { List, Button, WhiteSpace, InputItem } from '@ant-design/react-native';
import asyncStorage from '@react-native-async-storage/async-storage';
import moment from "moment";
import { Audio } from 'expo-av';
import saoma from '../../assets/saoma.mp3';
import {spArr} from "../../Tool/util";

export default class index extends React.Component{
    state = {
        hasPermission:null,
        scanned:false,
        superVisible:false,
        materialVisible:false,
        superInfo:[],
        materialInfo:[],
        date: '',
        rackname: '',
        storcode: '',
        value: '',
        sound:null
    };

    async componentDidMount() {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        this.setState({
            hasPermission: status === 'granted'
        });
    }

    componentWillUnmount() {
        DeviceEventEmitter.emit('BackRefresh', {});
    }

    setItemData = (data,titleType)=>{
        asyncStorage.setItem("blindList",JSON.stringify(data),(error)=>{
            if(error){
                return Alert.alert("错误提示",`${titleType === 1?'保存并锁定失败':'保存失败'}`,[{
                    text:'关闭',onPress:()=> this.onSetTile()
                }])
            }else{
                return Alert.alert("温馨提醒",`${titleType === 1?'保存并锁定成功':'保存成功'}`,[{
                    text:'关闭',onPress:()=> this.onSetTile()
                }])
            }
        });
    }

    onSave = async()=>{
        const { superInfo } = this.state;
        const rackname = superInfo[1]; //货位名称
        const storcode = superInfo[0]; //仓库编码
        this.setState({
            rackname,
            storcode,
            superVisible:false,
            scanned:false
        })
    }

    getStorageData = async ()=>{
        const blindListString = await asyncStorage.getItem("blindList");
        if(blindListString){
            let arrList = [];
            const arrData = JSON.parse(blindListString);
            if(arrData.length){
                for(let i = 0;i<arrData.length;i++){
                    const list = await asyncStorage.getItem(arrData[i]);
                    arrList = [...arrList,...JSON.parse(list)];
                }
            }
            return arrList
        }
    }

    setStorageData = async (data,titleType,fileName)=>{
        try {
            const dataKey = spArr(data,1000, fileName);
            if(dataKey.keyList.length){
                await asyncStorage.setItem(fileName,JSON.stringify(dataKey.keyList));
                for(let i = 0;i<dataKey.dataArr.length;i++){
                    await asyncStorage.setItem(dataKey.dataArr[i].key,JSON.stringify(dataKey.dataArr[i].value));
                }
            }
            Alert.alert("温馨提醒",`${titleType === 1?'保存并锁定成功':'保存成功'}`,[{
                text:'关闭',onPress:()=> this.onSetTile()
            }])
        }catch (e) {
            Alert.alert("错误提示",`${titleType === 1?'保存并锁定失败':'保存失败'}`,[{
                text:'关闭',onPress:()=> this.onSetTile()
            }])
        }
    }

    onSubmit = async()=>{
        const { superInfo,materialInfo,value } = this.state;
        if(!value){
            return Alert.alert("错误提示",'请输入盘点数量',[{
                text:'关闭'
            }])
        }
        if(!superInfo.length){
            return Alert.alert("错误提示",'未锁定仓库和货位',[{
                text:'关闭'
            }])
        }
        if(!materialInfo.length){
            return Alert.alert("错误提示",'请扫描物料',[{
                text:'关闭'
            }])
        }
        const rackname = superInfo[1]; //货位名称
        const storcode = superInfo[0]; //仓库编码
        const code = materialInfo[0]; //物料编码
        const vbatchcode = materialInfo[1]; //批次号
        const nonhandnum = materialInfo[2]; //入库数量
        const nonhandastnum = materialInfo[2]; //入库数量
        const quality = materialInfo[3]; //质量等级
        const spec = materialInfo[4]; //规格
        const blindList = await this.getStorageData();
        //存在数据
        if(blindList){
            let status = false;
            blindList.map(item =>{
                if(item.storcode === storcode && item.rackname === rackname && item.code === code && item.vbatchcode === vbatchcode){
                    item.ncountastnum = value
                    item.ncountnum = value
                    item.nidffastnum = 0
                    item.nidffnum = 0
                    status = true
                }
            })
            if(!status){
                blindList.push({
                    code,
                    vbatchcode,
                    nonhandnum,
                    nonhandastnum,
                    quality,
                    spec,
                    ncountastnum:value,
                    ncountnum:value,
                    rackname,
                    storcode:storcode,
                    nidffastnum:0,
                    nidffnum:0,
                })
            }
            this.setStorageData(blindList,2,'blindList');
        }else{
            const data = [{
                code,
                vbatchcode,
                nonhandnum,
                nonhandastnum,
                quality,
                spec,
                ncountastnum:value,
                ncountnum:value,
                rackname,
                storcode,
                nidffastnum:0,
                nidffnum:0,
            }];
            this.setStorageData(data,2,'blindList');
        }
    }

    onSetTile = ()=>{
        this.setState({
            scanned: false,
            superVisible: false,
            materialVisible: false
        })
    }

    onScanned = (bool = false)=>{
        this.setState({
            scanned: bool
        })
    }

    onChangeText = (value)=>{
        this.setState({
            value
        })
    }

    playSound = async()=> {
        try {
            const { sound } = await Audio.Sound.createAsync(saoma);
            await sound.playAsync();
        }catch (e) {
            console.log("文件错误",e)
        }
    }

    render(){
        const { hasPermission,scanned,superVisible,materialVisible,superInfo,materialInfo,value,sound } = this.state;

        if (hasPermission === null) {
            return <Text>申请相机许可</Text>;
        }
        if (hasPermission === false) {
            return <Text>无法使用相机</Text>;
        }

        const handleBarCodeScanned = async ({ data,type }) => {
            await this.playSound();
            this.setState({
                scanned:true
            })
            if(type !== 256 || typeof data !== 'string'){
                return Alert.alert("错误提示",'请扫描正确的二维码',[{
                    text:'关闭',onPress:()=> this.onScanned()
                }])
            }
            const date = moment().format('YYYY-MM-DD HH:mm:ss');
            const strArr = data.split("$$");
            //await sound.unloadAsync();
            if(strArr.length === 3){
                this.setState({
                    superVisible: true,
                    superInfo: strArr,
                    date
                })
            }else if (strArr.length === 6){
                const { rackname,storcode } = this.state;
                if(!rackname || !storcode){
                    return Alert.alert("错误提示",'请先锁定仓库货位后再扫描',[{
                        text:'关闭',onPress:()=> this.onScanned()
                    }])
                }
                this.setState({
                    materialVisible: true,
                    materialInfo: strArr,
                    date
                })
            }else{
                return Alert.alert("错误提示",'请扫描正确的二维码',[{
                    text:'关闭',onPress:()=> this.onScanned()
                }])
            }
        };

        return <SafeAreaView style={styles.container}>
            <BarCodeScanner
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={styles.barCode}

            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={superVisible}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View>
                            <List>
                                <List.Item extra={superInfo[0]} onPress={()=>Alert.alert(superInfo[0])}>
                                    仓库编码
                                </List.Item>
                                <List.Item extra={superInfo[1]} onPress={()=>Alert.alert(superInfo[1])}>
                                    货位名称
                                </List.Item>
                                <WhiteSpace />
                                <Button type="primary" onPress={()=>this.onSave()}>锁定仓库和货位</Button>
                                <Button onPress={()=>this.onSetTile()}>取消</Button>
                            </List>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={materialVisible}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View>
                            <List>
                                <List.Item extra={materialInfo[0]} onPress={()=>Alert.alert(materialInfo[0])}>
                                    物料编码
                                </List.Item>
                                <List.Item extra={materialInfo[1]} onPress={()=>Alert.alert(materialInfo[1])}>
                                    批次号
                                </List.Item>
                                <List.Item extra={materialInfo[2]} onPress={()=>Alert.alert(materialInfo[2])}>
                                    入库数量
                                </List.Item>
                                <List.Item extra={materialInfo[3]} onPress={()=>Alert.alert(materialInfo[3])}>
                                    质量等级
                                </List.Item>
                                <List.Item extra={materialInfo[4]} onPress={()=>Alert.alert(materialInfo[4])}>
                                    规格
                                </List.Item>
                                <InputItem type='number' value={value} onChange={(value)=>this.onChangeText(value)} placeholder={'请输入实际数量'}>
                                    实际数量
                                </InputItem>
                                <WhiteSpace />
                                <Button type="primary" onPress={()=>this.onSubmit()}>保存</Button>
                                <WhiteSpace />
                                <Button onPress={()=>this.onSetTile()}>取消</Button>
                            </List>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        //flexDirection: 'column',
        justifyContent: 'center',
    },
    barCode:{
        flex: 1,
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
        //alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    },
});
