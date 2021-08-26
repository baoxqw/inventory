import React from 'react';
import DetailsScreen from '../../pages/DetailsScreen';
import CargoScreen from '../../pages/CargoScanCode';
import MaterialScreen from '../../pages/MaterialScanCode';
import OutScreen from '../../pages/OutCargoScreen';
import InScreen from '../../pages/InCargoScreen';
import InPicScreen from '../../pages/InPicCargoScreen';


export default {
    Details: {
        screen: DetailsScreen
    },
    Cargo:{
        screen: CargoScreen,
        navigationOptions:{
            title: '盲盘扫码'
        }
    },
    Material:{
        screen: MaterialScreen,
        navigationOptions:{
            title: '下载扫码'
        }
    },
    InCargo:{
        screen: InScreen,
        navigationOptions:{
            title: '离线扫码'
        }
    },
    InPicCargo:{
        screen: InPicScreen,
        navigationOptions:{
            title: '实物扫码'
        }
    },
    OutCargo:{
        screen: OutScreen,
        navigationOptions:{
            title: '出库扫码'
        }
    }
}
