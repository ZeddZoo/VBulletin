import React from 'react';
import { AppRegistry,
  StyleSheet,
  Text,
  View,
  FlatList,
  AsyncStorage,
  Button,
  TextInput,
  Keyboard,
  Platform,
  ImageBackground,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,

  } from 'react-native';

  import {
    createStackNavigator, 
    createAppContainer, 
    createBottomTabNavigator, 
    createSwitchNavigator,
    createDrawerNavigator,

    
    } from 'react-navigation';

  import { Ionicons } from '@expo/vector-icons'; // 6.2.2
  import MapView from 'react-native-maps';

  import Customize from './components/Customize';
  import Camera from './components/Camera';


const TabNavigator = createBottomTabNavigator({
  Customize: { screen: Customize, navigationOptions:{
    tabBarIcon: ({tintColor}) => (
      <Ionicons name="ios-build" color={tintColor} size={25} />
    )
  }},


  Camera: { screen: Camera,
  navigationOptions:{
    tabBarIcon: ({tintColor}) => (
      <Ionicons name= "ios-camera" color={tintColor} size={25} />
    )
  }},


},{
  navigationOptions: ({navigation}) => {
    const {routeName} = navigation.state.routes[navigation.state.index];
    return {
      headerTitle: routeName
    };
  },
  tabBarOptions: {
    activeTintColor: '#e1665c',
    inactiveTintColor: 'gray',
  },
});

export default createAppContainer(TabNavigator);



  const styles = StyleSheet.create({
    rectangle1: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '10%',
      borderColor: '#707070',
      borderStyle: 'solid',
      borderWidth: 1,
      backgroundColor: '#e1665c',
      justifyContent: 'center',
      
    },

    signUp: {
      position: 'absolute',
      color: '#ffffff',
      fontFamily: 'Book Antiqua',
      fontSize: 25,
      fontWeight: 'bold',
      paddingHorizontal: '5%',
    },

    textInput: {
      width: '90%', 
      borderBottomWidth: 2, 
      borderBottomColor: 'gray', 
      fontFamily: 'SF Pro Text',
      fontSize: 20,
      padding: '2%'
    },

    continueButton:{
      width: '50%', 
      justifyContent: 'flex-end', 
      borderRadius: 50, 
      margin: 30,
      backgroundColor: '#e1665c',
      fontWeight: 'bold',
    }


  });