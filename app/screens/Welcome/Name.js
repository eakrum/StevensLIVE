import * as React from 'react';
import {Input ,FormInput, Button} from 'react-native-elements';
import  {StatusBar,ImageBackground, SafeAreaView, Text, View, StyleSheet, TouchableOpacity, Image, LinearGradient, ScrollView, Modal } from 'react-native';
import {firebase, db} from '../../../services/firebase';



const background = require('../../../images/one.jpg')

export default class Name extends React.Component {

   constructor(props) {
       super(props)
       this.state = {
           firstName: '',
           lastName: '',
           loading: false,
       }

       
    }
    setNewUser = () => {
      const userID = firebase.auth().currentUser.uid
      
      db.collection("users").doc(userID).set({
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        email: firebase.auth().currentUser.email,
        followers: 0,
        uid: firebase.auth().currentUser.uid,        

    })
    .then(function() {
        console.log("Document successfully written!");
    })
    .catch(function(error) {
        console.error("Error writing document: ", error);
    });


    }

    next = () => {
      try {
        if (this.state.firstName === "") {
            throw new Error("Please provide your first name.");
        }
        if (this.state.lastName === "") {
            throw new Error("Please provide your last name.");
        }
        else {
          this.setNewUser();
          this.props.navigation.navigate('ClassList');    
        }
    } 
    catch(e) 
    {
        alert(e);
    }
     
    }

    back = () => {
      this.props.navigation.goBack();
    }

   



    render() {
        return(
            <ImageBackground style = {styles.container} source = {background}>
            <StatusBar barStyle="light-content"/>
                <View style = {styles.buttonContainer}>
                    <Text style = {styles.miniHeader}>
                      WHO ARE YOU

                    </Text>

                    <Text style = {styles.header}>
                      Your Name

                    </Text>
                    
                    <Input
                    containerStyle={styles.input}
                    autoCorrect = {false}
                    color = '#FFF'
                    placeholder='First Name'
                    placeholderTextColor = '#FFF'
                    onChangeText= {(text) => this.setState({firstName: text})}
                    value = {this.state.firstName}
                    />

                    <Input
                    containerStyle = {styles.input}
                    autoCorrect = {false}
                    color = '#FFF'
                    placeholder='Last Name'
                    placeholderTextColor = '#FFF'
                    onChangeText={(text) => this.setState({lastName: text})} 
                    value = {this.state.lastName}
                    />

                    <Button 
                    title = 'Next'
                    raised
                    backgroundColor = '#FFF'
                    small
                    titleStyle = {{fontWeight: 'bold'}}
                    onPress = {this.next}
                    buttonStyle={styles.loginButton} /> 

                    <Button 
                    title = 'Back'
                    clear
                    //backgroundColor = '#3BA9FF'
                    small
                    titleStyle = {{fontWeight: 'bold', color: '#909497', fontSize: 15}}
                    onPress = {this.back} />

                </View>
                


            </ImageBackground>
        );
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      //flexDirection: 'row',
      
    },
    

    backgroundVideo: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      backgroundColor: '#9A9EA0',
      
      
    },
    loginContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center'
      //justifyContent: 'space-between'
    },
    buttonText: {
      fontSize: 20,
      fontFamily: 'Gill Sans',
      textAlign: 'center',
      color: '#ffffff',
      margin: 10,
      opacity: 0.8,
    },
    aboutButtonText: {
      fontSize: 18,
      fontFamily: 'Gill Sans',
      textAlign: 'center',
      margin: 10,
      color: '#efefef',
      opacity: 0.8,
    },
    contentContainer: {
      position: 'absolute',
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      backgroundColor: 'transparent',
    },
    profilePicture: {
      width: 50,
      height: 50,
      borderRadius: 25,
      alignItems: 'center',
      alignSelf: 'center',
    },
    name: {
      fontSize: 20,
      color: '#000000',
      fontWeight: 'bold',
      backgroundColor: 'transparent',
      marginTop: 15,
      alignSelf: 'center',
    },
    footer: {
      position: 'absolute',
      bottom: 10,
      backgroundColor: 'transparent',
      left: 0,
      right: 0,
    },
    aboutTitle: {
      fontSize: 20,
      marginBottom: 10,
    },

    
    loginButton: {
      //justifyContent: 'flex-start',
      backgroundColor: "#349186",
      width: 300,
      height: 45,
      borderColor: "transparent",
      borderWidth: 0,

    }, 
    socialButton: {
      alignItems: 'center',
      position: 'absolute',
      width: 200,
      height: 40,
      bottom: 120,

    },

    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      flexDirection: 'row'
      //backgroundColor: 'grey',
    },

    innerContainer: {
     padding: 10

    },
    
    textinputStyle: {
      alignItems: 'center',
      //position: 'absolute',
      width: 200,
      height: 40,
      borderColor: '#3BFF91',
      paddingBottom: 10,
      top: 250
    },

    modalButton: {
      justifyContent: 'flex-start',
      top: 275,
      alignItems: 'center',
      //backgroundColor: '#DDDDDD',
     // padding: 10
    

    },

    buttonContainer: {
      alignItems: 'center',
      flexDirection: 'column',
      top: 35
    },

    input: {
      borderWidth: 1,
      width: 300,
      borderColor: '#F2F3F4',
      margin: 10,
      height: 50,
      paddingLeft: 10,
      
    },

    miniHeader: {
      fontWeight: '900', 
      color: '#909497', 
      fontSize: 15,
      justifyContent: 'flex-start',
      marginRight: 195,
      marginTop: 75,
      paddingBottom: 5

    },

    header: {

      fontWeight: '900', 
      color: '#FFF', 
      fontSize: 32,
      marginRight: 140,
      paddingBottom: 10,

    }
  });