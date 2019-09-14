import React, { Component } from 'react';
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
  Dimensions,
  TouchableWithoutFeedback,
  SafeAreaView,

  } from 'react-native';
import { Camera, Permissions } from 'expo';
import { Ionicons } from '@expo/vector-icons';

import styles from './styles';

export default class CameraPage extends React.Component {
    camera = null;

    state = {
        hasCameraPermission: null,
    };

    async componentDidMount() {
        const camera = await Permissions.askAsync(Permissions.CAMERA);
        const audio = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
        const hasCameraPermission = (camera.status === 'granted' && audio.status === 'granted');

        this.setState({ hasCameraPermission }) ;
    }

    constructor(props) {
      super(props);
      this.state = {
        cameraType: 'back',
        mirrorMode: false
      };
    }

    render() {
        const { hasCameraPermission } = this.state;

        if (hasCameraPermission === null) {
            return <SafeAreaView />;
        } else if (hasCameraPermission === false) {
            return <Text>Access to camera has been denied.</Text>;
        }

        return (
            <SafeAreaView style={{flex: 1}}>

                <Camera
                    style={styles.preview}
                    ref={camera => this.camera = camera}
                >
                  <Ionicons
                      name="md-reverse-camera"
                      color="white"
                      size={40}
                      style={styles.cameraIcon} onPress={this.changeCameraType.bind(this)}
                    />
                </Camera>
            </SafeAreaView>
        );
    }

    changeCameraType() {
      if (this.state.cameraType === 'back') {
        this.setState({
          cameraType: 'front',
          mirrorMode: true
        });
      } else {
        this.setState({
          cameraType: 'back',
          mirrorMode: false
        });
      }
    }
}
