import React from 'react';
import {createStackNavigator} from "react-navigation-stack";
import AppBottomNavigator from "../AppBottomNavigator";
import AppContentNavigator from '../AppContentNavigator';


export default createStackNavigator(
    {
        Homes: {
            screen: AppBottomNavigator,
        },
        ...AppContentNavigator
    },
    {
        defaultNavigationOptions: {
            initialRouteName: 'Homes',
            title:'移动盘点'
          /*  headerStyle: {
                backgroundColor: '#f4511e',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
            },*/
        },
    }
);
