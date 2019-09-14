import React, { Component } from 'react';
import { AppRegistry,
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  ImageBackground,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
  ScrollView,
  Dimensions, SafeAreaView, Keyboard, TouchableWithoutFeedback

  } from 'react-native';
  

import { Dropdown } from 'react-native-material-dropdown';
import GLOBALS from './global';


export default class HelloWorldApp extends Component {
  constructor(props) {
    super(props);
    this.state = {text: '', height: 0};
  }
  render() {
    GLOBALS.userInput = this.state.text;
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style= {{flex: 1, justifyContent: "center"}}>      
          <TextInput
            placeholder="Write something with multilines  here.."

            {...this.props}
            multiline={true}
            onChangeText={(text) => {
                this.setState({ text })
            }}
            onContentSizeChange={(event) => {
                this.setState({ height: event.nativeEvent.contentSize.height })
            }}
            style={[styles.default, {height: Math.max(35, this.state.height)}], styles.bioBlock}
            value={this.state.text}
          />
          <Text> {GLOBALS.userInput} </Text> 
          
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  bioBlock: {
      paddingHorizontal: '5%', 
      borderRadius: 10, 
      borderWidth: 1,
      borderColor: '#f0f8ff',
      justifyContent: 'flex-start',

    },
  submit:{
      width: '50%', 
      justifyContent: 'center', 
      borderRadius: 50, 
      margin: 20,
      backgroundColor: '#e1665c',
      fontWeight: 'bold',
      
  }

});
