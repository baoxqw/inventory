import React from 'react';
import {Text, View, StyleSheet, Modal, Alert, SafeAreaView, DeviceEventEmitter, ScrollView} from 'react-native';
import {BarCodeScanner} from 'expo-barcode-scanner';
import {Button, InputItem, List, WhiteSpace} from '@ant-design/react-native';
import asyncStorage from '@react-native-async-storage/async-storage';
import moment from "moment";
import {Audio} from 'expo-av';
import saoma from '../../assets/saoma.mp3';
import {spArr} from "../../Tool/util";
import {findElem, groupFunc, compare} from '../../Tool/util';

const Item = List.Item;

export default class index extends React.Component {
    state = {
        hasPermission: null,
        scanned: false,
        pageData: [], //分组前的所有数据
        groupData: [], //分组后的所有数据
        infoArr: [], //详细的
        visible: false
    };

    async componentDidMount() {
        const {status} = await BarCodeScanner.requestPermissionsAsync();
        this.setState({
            hasPermission: status === 'granted'
        });
    }

    componentWillUnmount() {
        DeviceEventEmitter.emit('BackRefresh', {});
    }

    onSave = async () => {
        try {
            const {groupData} = this.state;
            if (!groupData.length) {
                throw '无数据保存'
            }
            for (let i = 0; i < groupData.length; i++) {
                const gData = groupData[i];
                console.log("gData", gData)
                if (gData.length !== gData[0].total) {
                    throw '存在未完整的页码'
                }
            }
            let dataList = [];
            for (let i = 0; i < groupData.length; i++) {
                const arr = groupData[i];
                const obj = {
                    math: arr[0].math
                }
                arr.sort(compare("pageIndex"));
                let str = "";
                arr.forEach(item => {
                    str += item.data;
                })
                obj.value = str;
                dataList.push(obj)
            }
            asyncStorage.getItem('ruKu', async (error, result) => {
                if (!error) {
                    if (result) {
                        let arrList = [];
                        const arrData = JSON.parse(result);
                        if (arrData.length) {
                            for (let i = 0; i < arrData.length; i++) {
                                const list = await asyncStorage.getItem(arrData[i]);
                                arrList = [...arrList, ...JSON.parse(list)];
                            }
                        }

                        if (arrList && arrList.length) {
                            dataList.forEach(item => {
                                arrList.map(it => {
                                    if (item.math === it.math) {
                                        it.disabled = true
                                    }
                                })
                            })
                        }

                        arrList = arrList.filter(item => !item.disabled)

                        await this.setStorageData([...arrList, ...dataList], "ruKu");

                    } else {
                        await this.setStorageData(dataList, "ruKu");
                    }
                }
            })
        } catch (e) {
            return Alert.alert("错误提示", e, [{
                text: '关闭', onPress: () => this.onScanned()
            }])
        }
    }

    getStorageData = async () => {
        const ruKuString = await asyncStorage.getItem("ruKu");
        if (ruKuString) {
            let arrList = [];
            const arrData = JSON.parse(ruKuString);
            if (arrData.length) {
                for (let i = 0; i < arrData.length; i++) {
                    const list = await asyncStorage.getItem(arrData[i]);
                    arrList = [...arrList, ...JSON.parse(list)];
                }
            }
            return arrList
        }
    }

    setStorageData = async (data, fileName) => {
        try {
            const dataKey = spArr(data, 500, fileName);
            if (dataKey.keyList.length) {
                await asyncStorage.setItem(fileName, JSON.stringify(dataKey.keyList));
                for (let i = 0; i < dataKey.dataArr.length; i++) {
                    await asyncStorage.setItem(dataKey.dataArr[i].key, JSON.stringify(dataKey.dataArr[i].value));
                }
            }
            Alert.alert("温馨提醒", `保存成功`, [{
                text: '关闭', onPress: () => this.onSetTile()
            }])
        } catch (e) {
            Alert.alert("错误提示", `保存失败`, [{
                text: '关闭', onPress: () => this.onSetTile()
            }])
        }
    }

    onSetTile = () => {
        this.setState({
            scanned: false,
            pageData: [], //分组前的所有数据
            groupData: [], //分组后的所有数据
            infoArr: [], //详细的
            visible: false
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

    render() {
        const {hasPermission, scanned, groupData, visible, infoArr} = this.state;

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

                const {pageData} = this.state;
                const date = moment().format('YYYY-MM-DD HH:mm:ss');
                //截取前8位
                const qStr = data.slice(0, 8);
                const hStr = data.slice(data.length - 8, data.length);
                if (qStr !== hStr) {
                    throw '分页标识符不一致';
                }
                //截取中间的base64码
                const baseData = data.split(data.slice(0, 8)).join('');
                //解码
               /* const char = new Buffer(baseData,'base64')
                console.log("char",char)
                const resStr = char.toString();*/
                const number = data.slice(0, 8); //页码
                const math = number.slice(0, 4); //随机数
                const pageIndex = Number(number.slice(4, 6)); //当前页数
                const total = Number(number.slice(6, 8)); //总页数
                const obj = {
                    number,
                    math,
                    pageIndex,
                    total,
                    data: baseData,
                    date
                }
                //拿到所有的math相同的项
                const mathData = pageData.filter(item => item.math === math);
                const res = findElem(mathData, 'pageIndex', pageIndex);
                if (res === -1) {
                    pageData.push(obj)
                }
                const groupData = groupFunc(pageData);
                this.setState({
                    pageData: [...pageData],
                    groupData: [...groupData],
                    scanned: false
                })
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
            <ScrollView
                style={{flex: 1, backgroundColor: '#f5f5f9'}}
                automaticallyAdjustContentInsets={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
            >
                <List renderHeader={'页码'} renderFooter={<Button onPress={() => this.onSave()}>保存</Button>}>
                    {
                        groupData.map((arr, index) => {
                            if (arr.length) {
                                return <Item key={index} extra={`${arr.length} / ${arr[0].total}`} onPress={() => {
                                    arr.sort(compare("pageIndex"))
                                    this.setState({
                                        visible: true,
                                        infoArr: arr,
                                        scanned: true
                                    })
                                }}>
                                    {arr[0].math}
                                </Item>
                            }
                        })
                    }
                </List>
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={visible}
                onRequestClose={() => this.onSetTile()}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View>
                            <List>
                                {
                                    infoArr.map((item, index) => {
                                        return <Item key={index} extra={item.date}>
                                            {item.number}
                                        </Item>
                                    })
                                }
                            </List>
                        </View>
                        <View style={styles.button}>
                            <Button size={'small'} onPress={() => this.onSetTile()}>关闭</Button>
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
    }
});
