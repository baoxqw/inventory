import { VirtualizedList, Platform, ScrollView, StyleSheet, Text, View,FlatList } from 'react-native';
import React, { useRef } from 'react';
/**
 * 注释: 双向锁定表格
 * 时间: 2020/7/21 0021 14:06
 * @author 郭翰林
 * @param props
 * @constructor
 */
export default function LockTableView(props) {
    const border_width = Platform.OS === 'ios' ? StyleSheet.hairlineWidth : StyleSheet.hairlineWidth * 2;
    let columnMaxWidth = [];
    let firstColumnData = [];
    const { keyStr='code',titleCode } = props;
    //计算每列最大宽度、分割数据
    let scale = props.textSize;
    props.titleData.map((value, i) => {
        if (value.length * scale < props.cellMaxWidth) {
            columnMaxWidth[i] = value.length * scale;
        }
        else {
            columnMaxWidth[i] = props.cellMaxWidth;
        }
    });
    props.tableData.map((item) => {
        const arrValue = [];
        Object.keys(item).sort((a,b)=>titleCode.indexOf(a) - titleCode.indexOf(b)).map((key, i) => {
            arrValue.push(item[key])
        });
        arrValue.map((value,j) =>{
            if (j == 0 && props.isLockTable) {
                firstColumnData.push(value);
            }
            if (columnMaxWidth[j] < value.length * scale) {
                if (value.length * scale < props.cellMaxWidth) {
                    columnMaxWidth[j] = value.length * scale;
                }
                else {
                    columnMaxWidth[j] = props.cellMaxWidth;
                }
            }
            if (props.isLockTable) {
                //删除对象第一个属性数据
                delete item[Object.keys(item)[0]];
            }
        })
    });
    /**
     * 注释: 绘制每行数据
     * 时间: 2020/7/23 0023 9:14
     * @author 郭翰林
     */
    function renderRowCell(data, index) {
        const rowData = data[index];
        let childrenViews = [];
        Object.keys(rowData).filter(item=>item !== 'key').sort((a,b)=>titleCode.indexOf(a) - titleCode.indexOf(b)).map((item, i) => {
            const value = rowData[item];
            childrenViews.push(<Text key={item} style={{
                fontSize: props.textSize,
                color: props.textColor,
                width: props.isLockTable ? columnMaxWidth[i + 1] + props.textSize : columnMaxWidth[i] + props.textSize,
                height: props.cellHeight,
                textAlign: 'center',
                textAlignVertical: 'center',
                borderWidth: border_width,
                borderColor: '#e7e7e7',
                //backgroundColor: !props.isLockTable && i === 0 ? props.firstColumnBackGroundColor : 'transparent',
            }}>
                {value}
            </Text>);
        });
        return <View style={{ flexDirection: 'row', alignItems: 'center' }}>{childrenViews}</View>;
    }
    /**
     * 注释: 绘制第一行行数据
     * 时间: 2020/8/5 0005 17:33
     * @author 郭翰林
     * @param rowData
     * @returns {any}
     */
    function renderFirstRowCell(rowData) {
        let childrenViews = [];
        Object.keys(rowData).filter(item=>item !== 'key').sort((a,b)=>titleCode.indexOf(a) - titleCode.indexOf(b)).map((item, i) => {
            const value = rowData[item];
            childrenViews.push(<Text key={item} style={{
                fontSize: props.textSize,
                color: props.tableHeadTextColor,
                width: props.isLockTable ? columnMaxWidth[i + 1] + props.textSize : columnMaxWidth[i] + props.textSize,
                height: props.cellHeight,
                textAlign: 'center',
                textAlignVertical: 'center',
                borderWidth: border_width,
                borderColor: '#e7e7e7',
                backgroundColor: props.isLockTable ? 'transparent' : props.firstRowBackGroundColor,
            }}>
                {value}
            </Text>);
        });
        return <View style={{ flexDirection: 'row', alignItems: 'center' }}>{childrenViews}</View>;
    }
    /**
     * 注释: 绘制表格头
     * 时间: 2020/8/5 0005 17:36
     * @author 郭翰林
     * @returns {any}
     */
    function renderHeaderView() {
        let first = props.titleData.shift();
        return (<View style={{ flexDirection: 'row', backgroundColor: props.firstRowBackGroundColor }}>
            <View style={{
                width: columnMaxWidth[0] + props.textSize,
                height: props.cellHeight,
                borderWidth: border_width,
                borderColor: '#e7e7e7',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Text style={{
                    fontSize: props.textSize,
                    color: props.tableHeadTextColor,
                    textAlign: 'center',
                    textAlignVertical: 'center',
                }}>
                    {first}
                </Text>
            </View>
            <ScrollView ref={headScrollView} style={{ borderRightWidth: border_width, borderColor: '#e7e7e7' }} horizontal={true} removeClippedSubviews={true} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} bounces={false} scrollEnabled={false} keyboardShouldPersistTaps={'handled'}>
                {renderFirstRowCell(props.titleData,index)}
            </ScrollView>
        </View>);
    }
    /**
     * 注释: 绘制第一列锁定数据
     * 时间: 2020/8/5 0005 15:21
     * @author 郭翰林
     * @param rowData
     * @param index
     * @returns {any}
     */
    function renderFirstCell(rowData, index) {
        return (<View style={{
            alignItems: 'center',
            justifyContent: 'center',
            borderColor: '#e7e7e7',
            height: props.cellHeight,
            borderWidth: border_width,
        }}>
            <Text style={{
                fontSize: props.textSize,
                color: props.textColor,
                textAlign: 'center',
                textAlignVertical: 'center',
            }}>
                {rowData}
            </Text>
        </View>);
    }
    let lockList = useRef(null);
    let headScrollView = useRef(null);
    /**
     * 注释: 绘制锁定表格
     * 时间: 2020/8/7 0007 20:29
     * @author 郭翰林
     */
    function renderLockTable() {
        return (<View style={{ flex: 1, backgroundColor: '#fff' }}>
            {renderHeaderView()}
            <View style={{ flex: 1, flexDirection: 'row' }}>

                <View style={{ width: columnMaxWidth[0] + props.textSize }}>
                    <FlatList ref={lockList} contentContainerStyle={{
                        backgroundColor: props.firstColumnBackGroundColor,
                    }} scrollEnabled={false} data={firstColumnData} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} renderItem={rowData => {
                        return renderFirstCell(rowData.item, rowData.index);
                    }}/>
                </View>

                <ScrollView style={{ borderRightWidth: border_width, borderColor: '#e7e7e7' }} horizontal={true} bounces={false} onScroll={event => {
                    headScrollView.current.scrollTo({ x: event.nativeEvent.contentOffset.x });
                }} keyboardShouldPersistTaps={'handled'}>
                    <VirtualizedList
                        data={props.tableData}
                        keyExtractor={(item, index) => item[index][keyStr] + index}
                        getItemCount={(data) => data.length}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        onScroll={event => {
                        lockList.current.scrollToOffset({
                            animated: false,
                            offset: event.nativeEvent.contentOffset.y,
                        });
                    }}
                        getItem={(data,index)=> {
                            return {
                                ...data,
                                index
                            }
                        }}
                        renderItem={rowData => {
                        return renderRowCell(rowData.item, rowData.index);
                    }}/>
                </ScrollView>
            </View>
        </View>);
    }
    /**
     * 注释: 绘制不锁定表格
     * 时间: 2020/8/7 0007 20:54
     * @author 郭翰林
     * @returns {any}
     */
    function renderUnLockTable() {
        return (<View style={{ flex: 1, backgroundColor: '#fff' }}>
            <ScrollView style={{ borderRightWidth: border_width, borderColor: '#e7e7e7' }} horizontal={true} bounces={false} keyboardShouldPersistTaps={'handled'}>
                <VirtualizedList
                    refreshing={true}
                    data={props.tableData}
                    onEndReached={props.onEndReached}
                    onRefresh={props.onRefresh}
                    onEndReachedThreshold={props.onEndReachedThreshold}
                    keyExtractor={(item, index) => item[index][keyStr] + index}
                    getItemCount={(data) => data.length}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={renderFirstRowCell(props.titleData)}
                    getItem={(data,index)=> {
                        return {
                            ...data,
                            index
                        }
                    }}
                    renderItem={rowData => {
                        return renderRowCell(rowData.item, rowData.index);
                }}/>
            </ScrollView>
        </View>);
    }
    return props.isLockTable ? renderLockTable() : renderUnLockTable();
}
LockTableView.defaultProps = {
    isLockTable: false,
    textSize: 15,
    textColor: '#666',
    tableHeadTextColor: '#666',
    cellMaxWidth: 150,
    cellHeight: 35,
    firstRowBackGroundColor: '#F0F9FF',
    firstColumnBackGroundColor: '#FFF9F7',
};
