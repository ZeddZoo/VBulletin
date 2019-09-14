import { StyleSheet, Dimensions } from 'react-native';


const { width: winWidth, height: winHeight } = Dimensions.get('window');

export default StyleSheet.create({
    preview: {
        height: winHeight,
        width: winWidth,
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
    },
    alignCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cameraIcon:{
       flex: 1, 
       justifyContent: "flex-end", 
       alignItems: "flex-end" 
    },
    
});