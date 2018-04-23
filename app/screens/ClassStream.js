'use strict';
import React, { Component } from 'react';
import { SafeAreaView, KeyboardAvoidingView ,TextInput  ,AppRegistry, Picker, StyleSheet, Text, TouchableHighlight, View, Image, ImageBackground, ListView, Platform, Dimensions, TouchableOpacity, FlatList, ScrollView} from 'react-native';
import SocketIOClient from 'socket.io-client';
import { RTCPeerConnection, RTCMediaStream, RTCIceCandidate, RTCSessionDescription, RTCView, MediaStreamTrack, getUserMedia, } from 'react-native-webrtc';
//import FBSDK, { LoginManager, LoginButton } from 'react-native-fbsdk';
import { StackNavigator, TabNavigator, NavigationActions } from 'react-navigation';
import { SocialIcon, Icon, Button, Input, Avatar } from 'react-native-elements';
import InCallManager from 'react-native-incall-manager';
import {firebase, db} from '../../services/firebase';
import ReversedFlatList from 'react-native-reversed-flat-list';

const pcPeers = {};
const configuration = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
const socket = SocketIOClient.connect('https://ec2-13-58-75-207.us-east-2.compute.amazonaws.com:4443/', {transports: ['websocket']}); 
let container;
let localStream;
let mySelf;
let ableSwitchCam;
var temp = new Array();



const instructor = "Xy2Mzu9kM9cJrWxfqYIi1cG52Dk1";


function join(roomID) {
    socket.emit('join', roomID, function(socketIds){
      for (const i in socketIds) {
        const socketId = socketIds[i];
        if (instructor == firebase.auth().currentUser.uid){
          createPC(socketId, true);
        }
        else {
          createPC(socketId, false);
        } 
      }
    });
    //socket.emit('getUser', roomID);
    socket.emit('counter', roomID);
    socket.emit('matchUser', container.state.user);
 
  }
  
  function getLocalStream(isFront, callback) {
  
    let videoSourceId;
    
      // on android, you don't have to specify sourceId manually, just use facingMode
      // uncomment it if you want to specify
      if (Platform.OS === 'ios') {
        MediaStreamTrack.getSources(sourceInfos => {
    
          for (const i = 0; i < sourceInfos.length; i++) {
            const sourceInfo = sourceInfos[i];
            if(sourceInfo.kind == "video" && sourceInfo.facing == (isFront ? "front" : "back")) {
              videoSourceId = sourceInfo.id;
            }
          }
        });
      }
      getUserMedia({
        
        audio: true,
        video: {
          mandatory: {
            minWidth: 640, // Provide your own width, height and frame rate here
            minHeight: 360,
            minFrameRate: 30,
          },
          facingMode: (isFront ? "user" : "environment"),
          optional: (videoSourceId ? [{sourceId: videoSourceId}] : []),
        }
      }, function (stream) {
        callback(stream);
      }, logError);
      
    }
  
    function createPC(socketId, isOffer) {
      const pc = new RTCPeerConnection(configuration);
      pcPeers[socketId] = pc;
    
      pc.onicecandidate = function (event) {
        if (event.candidate) {
          socket.emit('exchange', {'to': socketId, 'candidate': event.candidate });
        }
      };
    
      function createOffer() {
        pc.createOffer(function(desc) {
          pc.setLocalDescription(desc, function () {
            socket.emit('exchange', {'to': socketId, 'sdp': pc.localDescription });
          }, logError);
        }, logError);
      }
    
      pc.onnegotiationneeded = function () {
        if (isOffer) {
          createOffer();
        }
      }
    
      pc.oniceconnectionstatechange = function(event) {
        if (event.target.iceConnectionState === 'completed') {
          setTimeout(() => {
            getStats();
          }, 1000);
        }
        if (event.target.iceConnectionState === 'connected') {
          //createDataChannel();
        }
      };
      pc.onsignalingstatechange = function(event) {
      };
    
      pc.onaddstream = function (event) {
        
        
        container.setState({info: 'One peer join!'});
    
        const remoteList = container.state.remoteList;
        remoteList[socketId] = event.stream.toURL();
        container.setState({ remoteList: remoteList });
      };
      pc.onremovestream = function (event) {
      };

      if(instructor == firebase.auth().currentUser.uid){
        socket.emit('log', "yes");
        socket.emit('log', firebase.auth().currentUser.uid);
        pc.addStream(localStream);
      } else {
        socket.emit('log', "nope");
        socket.emit('exchange', {'to': socketId, 'setup': "??" });
      }
   
      return pc;
    }
  
    function exchange(data) {
      const fromId = data.from;
      let pc;
      if (fromId in pcPeers) {
        pc = pcPeers[fromId];
      } 
      else if (instructor == firebase.auth().currentUser.uid){
        pc = createPC(fromId, true);
      }
      else {
        pc = createPC(fromId, false);
      }
    
      if (data.sdp) {
        pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
          if (pc.remoteDescription.type == "offer")
            pc.createAnswer(function(desc) {
              pc.setLocalDescription(desc, function () {
                socket.emit('exchange', {'to': fromId, 'sdp': pc.localDescription });
              }, logError);
            }, logError);
        }, logError);
      } else if (data.setup) {
        // do nothing
      } else {
        pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    }
  
    //TODO : Get rid of this, old leave sucks
    function leave(roomID) {
      //container.setState({leftRoom: true});
      socket.emit('leave', roomID, function(socketIds){
        let numConnections = 0;
        for (const i in socketIds) {
          numConnections = numConnections + 1;
        }
        numConnections = numConnections - 1;
       
          for (const i in socketIds){
            if (numConnections > 0){
            const socketId = socketIds[i];
            const pc = pcPeers[socketId];
          //const viewIndex = pc.viewIndex;
            pc.close();
            delete pcPeers[socketId];
        
            const remoteList = container.state.remoteList;
            delete remoteList[socketId]
            container.setState({ remoteList: remoteList });
            numConnections = numConnections - 1;

          } 
        }
        
    });
    socket.emit('log', 'leaving');
  }

  // (1) Emit Leave event to server
  function leaveToServer2(){
    socket.emit('leave2', function(){
    });
  }

  // (4) New Leave using server logic
  function leaveEveryone(socketId){
    
    //Check to see if socketId is in the list
    var foundSocketId = socketId in pcPeers;
    if (foundSocketId){

      //If it is in list, we can close the RCTPeerConnection and delete it in peers
      const pc = pcPeers[socketId];
      pc.close();
      delete pcPeers[socketId];

      //Update the remoteList
      const remoteList = container.state.remoteList;
      delete remoteList[socketId];
      container.setState( {remoteList: remoteList});


    }
    else {
      //If it isn't in the peers list, continue normally
    }
    const roomID = container.state.roomID;
    socket.emit('counter', roomID);
  }

  
  //Event Listeners
    socket.on('exchange', function(data){
      exchange(data);
    });
    socket.on('leave', function(socketId){
      leave(socketId);
    });

    // (3) Spawns leaveEveryone on each client in room
    socket.on('leaveEveryone', function(socketId){
      leaveEveryone(socketId);
    })

    socket.on('viewers', function(viewers){
      counter(viewers);
    });

    socket.on('message', function([message]){
      sendMessage([message]);

    });

    socket.on('displayUser', function(userID){
      container.setState(prevState => ({
        roomMessages: [...prevState.roomMessages, {userItem: userID + ' joined!'}]
      }))

    });
    


    function sendMessage([message]){
      console.log('client side emit message details:', [message])
      const {messageItem, userItem, pictureItem} = ''
      container.setState(prevState => ({
        roomMessages: [...prevState.roomMessages, {messageItem: message.chatMessage, userItem: message.user, pictureItem: message.proPic}]
      }))
      console.log('roomMessages details: ', container.state.roomMessages)
    
    }
    

    function counter(viewers){
      container.setState({viewerNumber:viewers});  
    }
  

  
    socket.on('connect', function(data) {
      getLocalStream(true, function(stream) {
        localStream = stream;
        mySelf = stream.toURL();
        //container.setState({selfViewSrc: stream.toURL()});
        container.setState({status: 'ready', info: 'Please enter or create room ID'});
      });
    });
  
    function logError(error) {
      console.log("logError", error);
    }
  
    function mapHash(hash, func) {
      const array = [];
      for (const key in hash) {
        const obj = hash[key];
        array.push(func(obj, key));
      }
      return array;
    }
  
    function getStats() {
      const pc = pcPeers[Object.keys(pcPeers)[0]];
      if (pc.getRemoteStreams()[0] && pc.getRemoteStreams()[0].getAudioTracks()[0]) {
        const track = pc.getRemoteStreams()[0].getAudioTracks()[0];
        pc.getStats(track, function(report) {
        }, logError);
      }
    }

    function cameraSwitch(){
      localStream.getVideoTracks().forEach(track => { track._switchCamera();});
    }

    

    

    
     
    
export default class ClassStream extends Component { 

  

 
  constructor(props){
    super(props)

    this.state = {
      videoURL: this.props.navigation.state.params.videoURL,
      isFront: this.props.navigation.state.params.isFront,
      roomID: this.props.navigation.state.params.roomID,
      selfViewSrc: mySelf,
      remoteList: this.props.navigation.state.params.remoteList,
      user: this.props.navigation.state.params.user,
      chatMessage: '',
      proPic: this.props.navigation.state.params.proPic,
      viewerNumber: '0',
      roomMessages: [],
      
    }

  }

  
  switcher = () => {
    cameraSwitch(); 
  }

  streamConfig = () => {
    join(this.state.roomID);
    InCallManager.start({media: 'audio'}); // audio/video, default: audio
    InCallManager.setForceSpeakerphoneOn( true );

  }

  componentDidMount(){
   

    container = this;
    this.streamConfig();
    //alert(socket.id);

  }

  static navigationOptions = {
    title: 'ClassStream'
  }

  switchCameraButton(){
    if (instructor == firebase.auth().currentUser.uid){
      ableSwitchCam = true;
    } else {
      ableSwitchCam = false;
    }
  }

  leaveRoom = () => {
    InCallManager.stop();
    leaveToServer2();
    this.props.navigation.goBack();
    socket.emit('log', 'leaving');
  }

  emitMessage = (event) => {
    socket.emit('sendMessage', [{chatMessage :this.state.chatMessage, user: this.state.user, proPic: this.state.proPic}]);
    this.setState({chatMessage: ''});
  }


  renderItem({item}) {
    return (
      <View style={styles.row}>
        <Avatar 
        rounded 
        small
        style = {styles.avatar} source = {{uri: item.pictureItem}} /> 
        <Text style={styles.message}>{item.userItem}</Text>
        <View style = {styles.column}>
        <Text style={styles.message}>{item.messageItem}</Text>
        </View>
        
      </View>
    );
  }

 



    render() {
      this.switchCameraButton();
      const localView = <RTCView streamURL={this.state.selfViewSrc} style = {styles.selfView}/>
      const camSwitchButton = <Icon iconStyle = {styles.switchCam} name="ios-reverse-camera-outline" size={30} type = 'ionicon' color= '#FFF' onPress = {this.switcher}/>

       return (
        <View style = {styles.container}>
        <View style = {styles.buttonContainer}>
        <Icon iconStyle = {styles.leave} name="ios-close-circle-outline" size={27} type = 'ionicon' color= '#FFF' onPress = {this.leaveRoom}/>
        <Icon iconStyle = {styles.viewer} name="ios-eye-outline" size={30} type = 'ionicon' color= '#FFF'/>
        <Text style = {styles.callButton}> {this.state.viewerNumber} </Text>
        </View>
        <ScrollView style = {styles.chatBox}> 
        <ReversedFlatList 
          data={this.state.roomMessages} 
          renderItem={this.renderItem} 
        />

        </ScrollView>
        <View style = {styles.buttonContainer2}>
        
        <Input
          containerStyle = {styles.input}
          placeholder='enter text'
          placeholderTextColor = '#FFF'
          onChangeText={(text) => this.setState({chatMessage: text})} 
          value = {this.state.chatMessage}
          color = '#FFF'
          returnKeyType = 'send'
          onSubmitEditing={(event) => this.emitMessage(event)}
          //style={[newStyle]}
          />
        {ableSwitchCam ? camSwitchButton : null}
        </View>
        
          <View style = {styles.videoContainer}>
          {ableSwitchCam ? localView : null}

             {
          mapHash(this.state.remoteList, function(remote, index) {
            return <RTCView key={index} streamURL={remote} style={styles.remoteView}/>})
          }
            
          </View>
          </View>
       );
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    //flexDirection: 'row',
   
    
  },

  row: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },

  row: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },

  column: {
    flexDirection: 'column'

  },
  message: {
    color: '#FFF',
    left: 27,
  },

  chatBox: {
    flexDirection: 'row',
    borderWidth: 1,
    width: 350,
    borderRadius: 10,
    height: 200,
    position: 'absolute',
    bottom: 70,
    left: 20,
    zIndex: 5,
    borderColor: 'transparent'

  },

  videoContainer: {
    flex: 1,
    alignSelf: 'stretch',
  },
  buttonContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    left: 0,
    right: 0,
    top: 40,
    zIndex: 5
    
  },

  buttonContainer2: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5
    
  },

  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  backgroundImage1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

  },
  selfView: {
    flex: 1,
    //resizeMode: 'cover'
  },
  remoteView: {
    flex: 1,
   
    resizeMode: 'cover',

  },

  titleText: {
    fontSize: 30,
    fontWeight: "bold",
    backgroundColor: 'transparent',
    color: '#F0FFFF',
  },

  viewer: {
    position: 'absolute',
    top: 15,
    right: -120,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    zIndex: 5
    
  },

  callButton: {
    position: 'absolute',
    top: 20,
    right: 33,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    color: '#FFF',
    fontSize: 15,
  },

  leave: {
    position: 'absolute',
    top: 15,
    left: -150,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    zIndex: 5

  },

  switchCam: {
    position: 'absolute',
    left: 120,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    bottom: 20,
    zIndex: 5
  },
  input: {
    borderWidth: 1,
    width: 250,
    borderRadius: 10,
    height: 35,
    borderColor: '#F2F3F4',
    position: 'absolute',
    bottom: 20,
    left: -165,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    zIndex: 5
    
  },

  avatar: {
    top: 15,
    left: 8,
    //alignItems: 'center',
  },


});