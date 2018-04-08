'use strict';
import React, { Component } from 'react';
import { SafeAreaView, KeyboardAvoidingView ,TextInput  ,AppRegistry, Picker, StyleSheet, Text, TouchableHighlight, View, Image, ImageBackground, ListView, Platform, Dimensions, TouchableOpacity} from 'react-native';
import SocketIOClient from 'socket.io-client';
import { RTCPeerConnection, RTCMediaStream, RTCIceCandidate, RTCSessionDescription, RTCView, MediaStreamTrack, getUserMedia, } from 'react-native-webrtc';
//import FBSDK, { LoginManager, LoginButton } from 'react-native-fbsdk';
import { StackNavigator, TabNavigator, NavigationActions } from 'react-navigation';
import { SocialIcon, Icon, Button, Input } from 'react-native-elements';
import InCallManager from 'react-native-incall-manager';
import {firebase} from '../../services/firebase';

//const socket = SocketIOClient.connect('https://ec2-13-58-75-207.us-east-2.compute.amazonaws.com:4443/', {transports: ['websocket']}); 
const pcPeers = {};
const configuration = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
const socket = SocketIOClient.connect('https://ec2-13-58-75-207.us-east-2.compute.amazonaws.com:4443/', {transports: ['websocket']}); 
let container;
let localStream;
let mySelf;
let ableSwitchCam;
let user;
const instructor = "Xy2Mzu9kM9cJrWxfqYIi1cG52Dk1";

function join(roomID) {
    socket.emit('join', roomID, function(socketIds){
      console.log('join', socketIds);
      for (const i in socketIds) {
        console.log('hi');
        const socketId = socketIds[i];
        if (instructor == firebase.auth().currentUser.uid){
          createPC(socketId, true);
        }
        else {
          createPC(socketId, false);
        } 
      }
    });
    socket.emit('getUser', roomID);
    socket.emit('counter', roomID);
 
  }
  
  function getLocalStream(isFront, callback) {
  
    let videoSourceId;
    
      // on android, you don't have to specify sourceId manually, just use facingMode
      // uncomment it if you want to specify
      if (Platform.OS === 'ios') {
        MediaStreamTrack.getSources(sourceInfos => {
          console.log("sourceInfos: ", sourceInfos);
    
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
        console.log('getUserMedia success', stream);
        console.log('HELLO: ', stream._tracks[1]);
        callback(stream);
      }, logError);
      
    }
  
    function createPC(socketId, isOffer) {
      const pc = new RTCPeerConnection(configuration);
      pcPeers[socketId] = pc;
      console.log("PCPEERS1: ", pcPeers);
      console.log('PCpeersSocketID: ', pcPeers[socketId]);
    
      pc.onicecandidate = function (event) {
        //console.log('onicecandidate', event.candidate);
        if (event.candidate) {
          socket.emit('exchange', {'to': socketId, 'candidate': event.candidate });
        }
      };
    
      function createOffer() {
        pc.createOffer(function(desc) {
          //console.log('createOffer', desc);
          pc.setLocalDescription(desc, function () {
            //console.log('setLocalDescription', pc.localDescription);
            socket.emit('exchange', {'to': socketId, 'sdp': pc.localDescription });
          }, logError);
        }, logError);
      }
    
      pc.onnegotiationneeded = function () {
        //console.log('onnegotiationneeded');
        if (isOffer) {
          createOffer();
        }
      }
    
      pc.oniceconnectionstatechange = function(event) {
        //console.log('oniceconnectionstatechange', event.target.iceConnectionState);
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
        //console.log('onsignalingstatechange', event.target.signalingState);
      };
    
      pc.onaddstream = function (event) {
        
        
        console.log('onaddstream', event.stream);
        container.setState({info: 'One peer join!'});
    
        const remoteList = container.state.remoteList;
        remoteList[socketId] = event.stream.toURL();
        container.setState({ remoteList: remoteList });
      };
      pc.onremovestream = function (event) {
        console.log('onremovestream', event.stream);
      };

      if(instructor == firebase.auth().currentUser.uid){
        socket.emit('log', "yes");
        socket.emit('log', firebase.auth().currentUser.uid);
        pc.addStream(localStream);
      } else {
        socket.emit('log', "nope");
        socket.emit('exchange', {'to': socketId, 'setup': "??" });
      }
      
      /*function createDataChannel() {
        if (pc.textDataChannel) {
          return;
        }
        const dataChannel = pc.createDataChannel("text");
    
        dataChannel.onerror = function (error) {
          //console.log("dataChannel.onerror", error);
        };
    
        dataChannel.onmessage = function (event) {
          //console.log("dataChannel.onmessage:", event.data);
          container.receiveTextData({user: socketId, message: event.data});
        };
    
        dataChannel.onopen = function () {
          //console.log('dataChannel.onopen');
          container.setState({textRoomConnected: true});
        };
    
        dataChannel.onclose = function () {
          //console.log("dataChannel.onclose");
        };
    
        pc.textDataChannel = dataChannel;
      }*/
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
        //console.log('exchange sdp', data);
        pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
          if (pc.remoteDescription.type == "offer")
            pc.createAnswer(function(desc) {
              //console.log('createAnswer', desc);
              pc.setLocalDescription(desc, function () {
                //console.log('setLocalDescription', pc.localDescription);
                socket.emit('exchange', {'to': fromId, 'sdp': pc.localDescription });
              }, logError);
            }, logError);
        }, logError);
      } else if (data.setup) {
        // do nothing
      } else {
        //console.log('exchange candidate', data);
        pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    }
  

    function leave(roomID) {
      //container.setState({leftRoom: true});
      socket.emit('leave', roomID, function(socketIds){
        let numConnections = 0;
        for (const i in socketIds) {
          numConnections = numConnections + 1;
        }
        numConnections = numConnections - 1;
        console.log(numConnections);
       
          for (const i in socketIds){
            if (numConnections > 0){
            const socketId = socketIds[i];
            console.log('leave0', socketIds[i]);
            console.log('leave1', socketIds);
            console.log('leave2', socketId);
            const pc = pcPeers[socketId];
            console.log('leave3', pcPeers);
            console.log('leave4', pcPeers[socketId]);
          //const viewIndex = pc.viewIndex;
            pc.close();
            delete pcPeers[socketId];
        
            const remoteList = container.state.remoteList;
            delete remoteList[socketId]
            container.setState({ remoteList: remoteList });
            numConnections = numConnections - 1;

          } else {
            console.log('leaving', socketIds);
            console.log('done');
          }
        }
        
    });
    socket.emit('log', 'leaving');
  }
  
    socket.on('exchange', function(data){
      exchange(data);
    });
    socket.on('leave', function(socketId){
      leave(socketId);
    });

    socket.on('viewers', function(viewers){
      counter(viewers);
    });

    function counter(viewers){
      console.log('viewers', viewers)
      container.setState({viewerNumber:viewers});  
    }

    function getUser(viewers){
      console.log('user: ', viewers);
    }
  
    socket.on('connect', function(data) {
      console.log('connect');
      getLocalStream(true, function(stream) {
        localStream = stream;
        console.log('LOCALSTREAM: ', localStream._tracks);
        mySelf = stream.toURL();
        console.log('myself video', mySelf._tracks)
        console.log('Myself: ', mySelf);
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
        console.log('track', track);
        pc.getStats(track, function(report) {
          console.log('getStats report', report);
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
      viewerNumber: '0'
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
   
    console.log('i am: ', mySelf);
    console.log('u are:' ,localStream)

    container = this;
    this.streamConfig();
    
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

  backAlert = () => {
    InCallManager.stop();
    leave(this.state.roomID);
    this.props.navigation.goBack();
    socket.emit('log', 'leaving');
    // getLocalStream(true, function(stream) {
    //   if (localStream) {
    //     for (const id in pcPeers) {
    //       const pc = pcPeers[id];
          
    //       pc && pc.removeStream(localStream);
          
          
    //     }
        
    //     localStream.release();
    //   }

    // });
    
  }
    render() {
      this.switchCameraButton();
      console.log("Peers: ", pcPeers);
      const localView = <RTCView streamURL={this.state.selfViewSrc} style = {styles.selfView}/>
      const camSwitchButton = <Icon iconStyle = {styles.switchCam} name="ios-reverse-camera-outline" size={30} type = 'ionicon' color= '#FFF' onPress = {this.switcher}/>

       return (
        <View style = {styles.container}>
        <View style = {styles.buttonContainer}>
        <Icon iconStyle = {styles.leave} name="ios-close-circle-outline" size={27} type = 'ionicon' color= '#FFF' onPress = {this.backAlert}/>
        <Icon iconStyle = {styles.viewer} name="ios-eye-outline" size={30} type = 'ionicon' color= '#FFF' onPress = {this.backAlert}/>
        <Text style = {styles.callButton}> {this.state.viewerNumber} </Text>

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
    backgroundColor: '#43474f',
    //flexDirection: 'row',
   
    
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
    bottom: 40,
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
    top: -730,
    right: -120,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    zIndex: 5
    
  },

  callButton: {
    position: 'absolute',
    alignItems: 'flex-start',
    fontSize: 15,
    top: -724,
    right: 30,
    color: '#FFF',
    justifyContent: 'flex-start',
    zIndex: 5
  },

  leave: {
    position: 'absolute',
    top: -730,
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
    zIndex: 5

  }


});