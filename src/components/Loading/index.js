import React, { Component } from 'react';
import {
    View,
    Text,
    ProgressBarAndroid,
    Modal,
} from 'react-native';

import styles from './styles';

export default class Loading extends Component {
    // 构造
    constructor(props) {
        super(props);
        // 初始状态
        this.state = {};
    }

    render() {

        const { title='加载中',transparent = true } = this.props;

        return(
            <Modal
                transparent={transparent}
                onRequestClose={()=> this.onRequestClose()}
            >
                <View style={styles.loadingBox}>
                    <ProgressBarAndroid styleAttr='Inverse' color='#0d11ec' />
                    <Text>{title}</Text>
                </View>
            </Modal>
        );
    }

}
