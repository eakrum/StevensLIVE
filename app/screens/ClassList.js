'use strict';


import React, { Component } from 'react';
import {
  Text,
  View,
  ScrollView,
  ImageBackground,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Card,List, ListItem, Button, Icon, Avatar} from 'react-native-elements';
import {firebase, db} from '../../services/firebase';

const background = require('../../images/one.jpg')

const SCREEN_WIDTH = 375; // Width for standard iphones 6,7,8

let container;
let localStream;
let _firstName;
let _lastName;
let _proPic;
let _user;

var items = new Array();

class ClassList extends Component {


  constructor(props){
    super(props)
    this.state = {
      classes: [],
      isLoading: true,
      videoURL: null,
      isFront: true,
      info: 'Initializing',
      status: 'init',
      roomID: 'BIO281A',
      selfViewSrc: null,
      remoteList: {},
      user: '',
      userUID: firebase.auth().currentUser.uid,
    }

  }

  classQuery = () => {
    var docRef = db.collection("users").doc(this.state.userUID);

    docRef.get().then(function(doc){
      _firstName = doc.data().firstName;
      _lastName = doc.data().lastName;
      _proPic = doc.data().proPic
   
      _user = _firstName + ' ' + _lastName; 
   
      this.setState({

        user: _user
       });
   
       
     }.bind(this))
    
    
    db.collection("classes").where('streaming', '==', true).get()
    .then(function(querySnapshot) {
        
        querySnapshot.forEach(function(doc) {
            const {title, caption, photo, roomID} = doc.data();
            items.push({
                key: doc.id,
                doc, // DocumentSnapshot
                title,
                caption,
                photo,
                roomID
              });
        });
        
        this.setState({
            classes: items,
            isLoading: false
        });
    }.bind(this))

    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });
}


renderItem = ({item}) => {
  return (
    <Card 
    containerStyle={{ width: SCREEN_WIDTH * 0.90 }}
    title={item.title}
    titleStyle = {{color: '#FFF'}}
    image={{uri: item.photo}}>
    <Text style={{marginBottom: 10, color: '#FFF'}}>
    {item.caption}
    </Text>
    <Button 
    icon={
      <Icon
      name='ios-play'
      type = 'ionicon'
      size={15}
      color='white'
      />
    }
    text = 'View Now!'
    backgroundColor = '#FFF'
    textStyle = {{fontWeight: 'bold'}}
    onPress = {() => {
      this.props.navigation.navigate('ClassStream',  
        { roomID: item.roomID, 
          remoteList: this.state.remoteList, 
          videoURL: this.state.videoURL, 
          isFront: this.state.isFront, 
          info: this.state.info, 
          selfViewSrc: this.state.selfViewSrc,
          status: this.state.status,
          user: this.state.user
        });
      }
        
}
    buttonStyle={styles.loginButton} /> 

  </Card>
  );
}

componentWillMount() {
  this.classQuery();
}


  render() {
    if (this.state.isLoading) {
      return <ImageBackground style = {styles.container} source = {background}><ActivityIndicator size="large" color="#FFF" /></ImageBackground>;
    }
    return (
      <ImageBackground style = {styles.container} source = {background}>
      <ScrollView style = {styles.contentContainer}>
      <FlatList
        data = {this.state.classes}
        renderItem = {this.renderItem}
      />
      
      </ScrollView>
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
    
  },

  contentContainer: {
    flex: 1,

  },
  
  loginContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },


  
  loginButton: {
    //justifyContent: 'flex-start',
    backgroundColor: "#3BA9FF",
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
    marginRight: 225,
    marginTop: 85,
    paddingBottom: 5

  },

  header: {

    fontWeight: '900', 
    color: '#FFF', 
    fontSize: 35,
    marginRight: 60,
    paddingBottom: 10,

  },

  avatar: {
    position: 'absolute',
    top: 15,
    left: -150,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    zIndex: 5

  },

  contentContainer: {
    flex: 1,
  }
});

export default ClassList;

