import React from 'react';
import { Text, View, StyleSheet, Modal, Alert, SafeAreaView, DeviceEventEmitter } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { List,Button,WhiteSpace,InputItem } from '@ant-design/react-native';
import asyncStorage from '@react-native-async-storage/async-storage';
import saoma from '../../assets/saoma.mp3';
import {Audio} from "expo-av";
import {spArr} from "../../Tool/util";

export default class index extends React.Component{
    state = {
        hasPermission:null,
        scanned:false,
        modalVisible:false,
        value:'',
        superInfo:[],
        materialInfo:[],
        dataArray:[],
        superVisible:false
    };

    async componentDidMount() {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        this.setState({
            hasPermission: status === 'granted'
        });
        this.getData();
    }

    componentWillUnmount() {
        DeviceEventEmitter.emit('BackRefresh', {});
    }

    getData = ()=>{
        asyncStorage.getItem('dowList',async (error,result)=>{
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
                    this.setState({
                        dataArray: arrList
                    })
                }else{
                    this.setState({
                        dataArray: []
                    })
                }
            }
        })
    }

    onSave = async()=>{
        this.setState({
            superVisible:false,
            scanned:false
        })
    }

    onSetTile = ()=>{
        this.setState({
            modalVisible:false,
            scanned:false,
            superVisible:false
        })
    }

    onSubmit = ()=>{
        const { superInfo,materialInfo,value,dataArray } = this.state;
        if(!value){
            return Alert.alert("????????????",'?????????????????????',[{
                text:'??????'
            }])
        }
        if(!superInfo.length){
            return Alert.alert("????????????",'????????????????????????',[{
                text:'??????'
            }])
        }
        if(!materialInfo.length){
            return Alert.alert("????????????",'???????????????',[{
                text:'??????'
            }])
        }
        let status = false;
        dataArray.map(item =>{
            if(item.storcode === superInfo[0] && item.rackname === superInfo[1] && item.code === materialInfo[0] && item.vbatchcode === materialInfo[1]){
                item.ncountastnum = value
                item.ncountnum = value
                status = true
            }
        })
        this.setStorageData(dataArray,2,'rowList')
    }

    setItemData = (data,titleType)=>{
        asyncStorage.setItem("dowList",JSON.stringify(data),(error)=>{
            if(error){
                return Alert.alert("????????????",`${titleType === 1?'?????????????????????':'????????????'}`,[{
                    text:'??????',onPress:()=> this.onSetTile()
                }])
            }else{
                return Alert.alert("????????????",`${titleType === 1?'?????????????????????':'????????????'}`,[{
                    text:'??????',onPress:()=> this.onSetTile()
                }])
            }
        });
    }

    playSound = async()=> {
        try {
            const { sound } = await Audio.Sound.createAsync(saoma);
            await sound.playAsync();
        }catch (e) {
            console.log("????????????",e)
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
            Alert.alert("????????????",`${titleType === 1?'?????????????????????':'????????????'}`,[{
                text:'??????',onPress:()=> this.onSetTile()
            }])
        }catch (e) {
            Alert.alert("????????????",`${titleType === 1?'?????????????????????':'????????????'}`,[{
                text:'??????',onPress:()=> this.onSetTile()
            }])
        }
    }

    render(){
        const { hasPermission,scanned,modalVisible,materialInfo,value,superVisible,superInfo } = this.state;

        const handleBarCodeScanned = async ({ data,type }) => {
            await this.playSound();
            this.setState({
                scanned:true
            })
            if(type !== 256 || typeof data !== 'string'){
                return Alert.alert("????????????",'???????????????????????????',[{
                    text:'??????',onPress:()=> this.setState({
                        scanned:false
                    })
                }])
            }
            const strArr = data.split("$$");
            const{ dataArray,superInfo } = this.state;
            if(strArr.length === 3){
                let status = false;
                dataArray.map(item =>{
                    if(item.storcode === strArr[0] && item.rackname === strArr[1]){
                        status = true
                    }
                })
                if(!status){
                    return Alert.alert("????????????","???????????????????????????",[{
                        text:'??????',onPress:()=> this.setState({
                            scanned:false
                        })
                    }])
                }else{
                    this.setState({
                        superInfo:strArr,
                        superVisible: true
                    })
                }
            }else
            if(strArr.length === 6){
                if(!superInfo || !superInfo.length){
                    return Alert.alert("????????????","???????????????????????????",[{
                        text:'??????',onPress:()=> this.setState({
                            scanned:false
                        })
                    }])
                }
                let status = false;
                let arrStr = [];
                dataArray.forEach(item =>{
                    if(item.storcode === superInfo[0] && item.rackname === superInfo[1] && item.code === strArr[0] &&item.vbatchcode === strArr[1]){
                        status = true
                    }
                    if(item.code === strArr[0] &&item.vbatchcode === strArr[1]){
                        arrStr.push({
                            storcode:item.storcode,
                            rackname:item.rackname
                        })
                    }
                })
                if(!status){
                    if(arrStr && arrStr.length){
                        return Alert.alert("????????????",`???????????????????????????????????????,?????????${arrStr.map(item=>{
                            return "??????:" + item.storcode + " ??????:"+ item.rackname
                        })}`,[{
                            text:'??????',onPress:()=> this.setState({
                                scanned:false
                            })
                        }])
                    }
                    return Alert.alert("????????????","??????????????????????????????",[{
                        text:'??????',onPress:()=> this.setState({
                            scanned:false
                        })
                    }])
                }
                this.setState({
                    modalVisible: true,
                    materialInfo: strArr,
                })
            }else{
                return Alert.alert("????????????",'???????????????????????????',[{
                    text:'??????',onPress:()=> this.setState({
                        scanned:false
                    })
                }])
            }
        };

        if (hasPermission === null) {
            return <Text>??????????????????</Text>;
        }
        if (hasPermission === false) {
            return <Text>??????????????????</Text>;
        }

        const onChangeText = (value)=>{
            this.setState({
                value
            })
        }

        return (
            <SafeAreaView style={styles.container}>
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
                                        ????????????
                                    </List.Item>
                                    <List.Item extra={superInfo[1]} onPress={()=>Alert.alert(superInfo[1])}>
                                        ????????????
                                    </List.Item>
                                    <WhiteSpace />
                                    <Button type="primary" onPress={()=>this.onSave()}>?????????????????????</Button>
                                    <Button onPress={()=>this.onSetTile()}>??????</Button>
                                </List>
                            </View>
                        </View>
                    </View>
                </Modal>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <View>
                                <List>
                                    <List.Item extra={materialInfo[0]} onPress={()=>Alert.alert(materialInfo[0])}>
                                        ????????????
                                    </List.Item>
                                    <List.Item extra={materialInfo[1]} onPress={()=>Alert.alert(materialInfo[1])}>
                                        ?????????
                                    </List.Item>
                                    <List.Item extra={materialInfo[2]} onPress={()=>Alert.alert(materialInfo[2])}>
                                        ????????????
                                    </List.Item>
                                    <List.Item extra={materialInfo[3]} onPress={()=>Alert.alert(materialInfo[3])}>
                                        ????????????
                                    </List.Item>
                                    <List.Item extra={materialInfo[4]} onPress={()=>Alert.alert(materialInfo[4])}>
                                        ??????
                                    </List.Item>
                                    <InputItem value={value} onChange={(value)=>onChangeText(value)} placeholder={'?????????????????????'}>
                                        ????????????
                                    </InputItem>
                                    <WhiteSpace />
                                    <Button type="primary" onPress={()=>this.onSubmit()}>??????</Button>
                                    <WhiteSpace />
                                    <Button onPress={()=>this.onSetTile()}>??????</Button>
                                </List>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        )
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
