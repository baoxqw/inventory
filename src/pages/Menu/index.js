import React, { Component } from 'react';
import{
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
    TextInput,
    StyleSheet,
} from 'react-native';
import Ionicons from "react-native-vector-icons/Ionicons";

class Index extends Component {
    constructor(props) {
        super(props);

        this.navigation = props.navigation;
        this.state = {
            username:'',
            password:''
        };
    }
    componentDidMount() {
        // 隐藏启动页，如果不设置消失时间，在组件加载完启动页自动隐藏

    }


    render() {
        const { actions, state, navigation } = this.props;
        return (
            <View style={styles.box}>
                <View style={[styles.boxList,styles.lineBottom,styles.lineRight]}>
                    <Ionicons
                        name={'subway-outline'}
                        size={70}
                        style={{color: '#bd4035'}}
                    />
                    <Text style={styles.textLine}>盲盘</Text>
                </View>
                <View style={styles.colorLine}></View>
                <View style={[styles.boxList,styles.lineBottom]}>
                    <Ionicons
                        name={'share-outline'}
                        size={70}
                        style={{color: '#147fea'}}
                    />
                    <Text style={styles.textLine}>下载</Text>
                </View>

                <View style={styles.boxList}>
                    <Ionicons
                        name={'bookmarks-outline'}
                        size={70}
                        style={{color: '#31c720'}}
                    />
                    <Text style={styles.textLine}>入库</Text>
                </View>
                <View style={styles.colorBottomLine}></View>
                <View style={styles.boxList}>
                    <Ionicons
                        name={'bookmark-outline'}
                        size={70}
                        style={{color: '#d07112'}}
                    />
                    <Text style={styles.textLine}>出库</Text>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    box:{
        width:'70%',
        marginLeft:'15%',
        paddingTop:'10%',
        fontSize:36,
        textAlign:'center',
        flexDirection:'row',
        justifyContent:'space-between',
        flexWrap:'wrap',

    },
    colorLine:{
        width:1,
        height:150,
        backgroundColor:'rgb(208,208,208)',
        marginTop:20,
    },
    colorBottomLine:{
        width:1,
        height:150,
        backgroundColor:'rgb(208,208,208)',

    },
    boxList:{
        paddingTop:15,
        marginTop:20,
        flexDirection:'column',
        alignItems:'center',
        textAlign:'center',
        width:'45%',
        height:150,
        // 边框颜色
        borderColor:'#000',

    },
    lineBottom: {
        borderBottomWidth: 1,
        borderColor: 'rgb(208,208,208)'
    },
    lineRight: {

    },
    textLine:{
        marginTop:20
    }
})

export default Index;

