import React from 'react';
import {createBottomTabNavigator} from "react-navigation-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import UserScreen from "../../pages/UserScreen";
import BlindScreen from "../../pages/BlindScreen";
import OutboundScreen from "../../pages/OutboundScreen";
import InBoundScreen from "../../pages/InBoundScreen";
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Remote debugger']);
export default createBottomTabNavigator(
    {
        Blind: {
            screen: BlindScreen,
            navigationOptions: {
                tabBarLabel: '盲盘',
                tabBarPosition: 'bottom',
                tabBarIcon: ({tintColor, focused}) => (
                    <Ionicons
                        name={focused ? 'ios-albums' : 'ios-albums-outline'}
                        size={26}
                        style={{color: tintColor}}
                    />
                ),
            }
        },
        User: {
            screen: UserScreen,
            navigationOptions: {
                tabBarLabel: '下载',
                tabBarPosition: 'bottom',
                tabBarIcon: ({tintColor, focused}) => (
                    <Ionicons
                        name={focused ? 'share-outline' : 'share-outline'}
                        size={26}
                        style={{color: tintColor}}
                    />
                ),
            }
        },
        InBound: {
            screen: InBoundScreen,
            navigationOptions: {
                tabBarLabel: '入库',
                tabBarPosition: 'bottom',
                tabBarIcon: ({tintColor, focused}) => (
                    <Ionicons
                        name={focused ? 'bookmarks-outline' : 'bookmarks-outline'}
                        size={26}
                        style={{color: tintColor}}
                    />
                ),
            }
        },
        Outbound: {
            screen: OutboundScreen,
            navigationOptions: {
                tabBarLabel: '出库',
                tabBarPosition: 'bottom',
                tabBarIcon: ({tintColor, focused}) => (
                    <Ionicons
                        name={focused ? 'bookmark-outline' : 'bookmark-outline'}
                        size={26}
                        style={{color: tintColor}}
                    />
                ),
            }
        }
    },
    {
        initialRouteName: 'Blind',
        tabBarOptions: {
            activeTintColor: '#0d11ec',
            labelStyle: {
                fontSize: 12,
            },
            style: {
                //backgroundColor: 'blue',
            },
        },
    }
);
