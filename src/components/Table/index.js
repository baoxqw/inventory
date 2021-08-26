import React, { Component } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Table, TableWrapper, Row } from 'react-native-table-component';
import {Button} from "@ant-design/react-native";

export default class ExampleThree extends Component {
    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            btnIndex: null
        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if(nextProps.btnIndexStatus !== this.props.btnIndexStatus){
            this.setState({
                btnIndex: null
            })
        }
    }

    render() {
        const { btnIndex } = this.state;

        const { tableHead,widthArr,tableList,titleCode,clickFunc,titleBtn='点击' } = this.props;
        let tableData = []

        if(tableList.length){
            tableList.forEach((item,index) =>{
                const arr = [];
                Object.keys(item).filter(item=>item !== 'key').sort((a,b)=>titleCode.indexOf(a) - titleCode.indexOf(b)).map((te, i) =>{
                    const value = item[te];
                    arr.push(value);
                })
                if(tableHead.join(",").indexOf('操作')!== -1){
                    arr.push(<Button size={'small'} style={{backgroundColor: btnIndex === index?'#5abdf5':'#fff'}} onPress={()=>{
                        this.setState({
                            btnIndex: index
                        })
                        clickFunc(index,arr);
                    }}>{titleBtn}</Button>)
                }
                tableData.push(arr)
            })
        }

        return (
            <View style={styles.container}>
                <ScrollView horizontal={true}>
                    <View>
                        <Table borderStyle={{borderWidth: 1, borderColor: '#C1C0B9'}}>
                            <Row data={tableHead} widthArr={widthArr} style={styles.header} textStyle={styles.text}/>
                        </Table>
                        <ScrollView style={styles.dataWrapper}>
                            <Table borderStyle={{borderWidth: 1, borderColor: '#C1C0B9'}}>
                                {
                                    tableData.map((rowData, index) => (
                                        <Row
                                            key={index}
                                            data={rowData}
                                            widthArr={widthArr}
                                            style={[styles.row, index%2 && {backgroundColor: '#F7F6E7'}]}
                                            textStyle={styles.text}
                                        />
                                    ))
                                }
                            </Table>
                        </ScrollView>
                    </View>
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: { flex: 1,backgroundColor: '#fff' },
    header: { height: 50, backgroundColor: '#53918FFF' },
    text: { textAlign: 'center', fontWeight: '100' },
    dataWrapper: { marginTop: -1 },
    row: { height: 40, backgroundColor: '#E7E6E1' }
});
