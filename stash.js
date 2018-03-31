import React, { Component } from 'react';
import { 
  ScrollView, 
  StyleSheet, 
  ImageBackground, 
  Text, 
  View,
  Dimensions,
  TouchableHighlight,
  Modal,
  CameraRoll,
  Image,
  Button,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import RNFetchBlob from 'react-native-fetch-blob'
import CameraRollPicker from 'react-native-camera-roll-picker'
import { List, ListItem, Input, Avatar, Divider, Header } from 'react-native-elements';
import {firebase, db} from '../../services/firebase';
import ImagePicker from 'react-native-image-picker';

const background = require('../../images/one.jpg');
var profPic = 'https://firebasestorage.googleapis.com/v0/b/livelecture-2dceb.appspot.com/o/posts%2Ftest.jpg?alt=media&token=535c7ab6-4d31-44d2-9ce3-db6f9650ac83'
var download;

const storage = firebase.storage()

// Prepare Blob support
const Blob = RNFetchBlob.polyfill.Blob
const fs = RNFetchBlob.fs
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
window.Blob = Blob

const uploadImage = (uri, mime = 'application/octet-stream') => {
  return new Promise((resolve, reject) => {
    const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
    const sessionId = new Date().getTime()
    let uploadBlob = null
    const imageRef = storage.ref('images').child(`${sessionId}`)

    fs.readFile(uploadUri, 'base64')
      .then((data) => {
        return Blob.build(data, { type: `${mime};BASE64` })
      })
      .then((blob) => {
        uploadBlob = blob
        return imageRef.put(blob, { contentType: mime })
      })
      .then(() => {
        uploadBlob.close()
        return imageRef.getDownloadURL()
      })
      .then((url) => {
        resolve(url)
      })
      .catch((error) => {
        reject(error)
    })
  })
}

const { width } = Dimensions.get('window')

class Settings extends Component {

  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: 'Settings',
      headerRight: (
        <Button onPress={params.done} title="Done" color="#fff" />
      ),
      headerLeft: (
        <Button onPress={params.cancel} title="Cancel" color="#fff" />
      ),
    };
  };

  componentWillMount() {
    this.props.navigation.setParams(
      { 
        done: this.done,
        cancel: this.cancel,

      });
  }
  constructor(props) {
    super(props)
    this.state = {
      userID: firebase.auth().currentUser.uid,
      firstName: '',
      lastName:'',
      office: '',
      bio: '',
      photos: [],
      index: null, 
      modalVisible: false,
      profPic: this.props.navigation.state.params.profPic
      
    }
  }

  // getSelectedImages = (selectedImages, currentImage) => {
    
  //   const image = currentImage.uri
 
  //   const Blob = RNFetchBlob.polyfill.Blob
  //   const fs = RNFetchBlob.fs
  //   window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
  //   window.Blob = Blob
 
   
  //   let uploadBlob = null;
  //   const imageRef = firebase.storage().ref('profile-Photos').child(firebase.auth().currentUser.email + '.jpg');
  //   let mime = 'image/jpg';
    
    

  //   //THIS ADDS IMAGE TO FIRE STORAGE AND PULLS URL
  //   fs.readFile(image, 'base64')
  //     .then((data) => {
  //       return Blob.build(data, { type: `${mime};BASE64` })
  //   })
  //   .then((blob) => {
  //       uploadBlob = blob
  //       return imageRef.put(blob, { contentType: mime })
  //     })
  //     .then(() => {
  //       uploadBlob.close()
  //       return imageRef.getDownloadURL()
  //     })
  //     .then((url) => {
  //       // URL of the image uploaded on Firebase storage
  //       console.log('my url is' , url);
  //       this.setState({profPic: url})
  //       console.log('new prof pic:', this.state.profPic)
        
        
  //     })
  //     .catch((error) => {
  //       console.log(error);
 
  //     })  
 
  // }

  _pickImage() {
    this.setState({ uploadURL: '' })

    ImagePicker.launchImageLibrary({}, response  => {
      uploadImage(response.uri)
        .then(url => this.setState({ uploadURL: url }))
        .catch(error => console.log(error))
    })
  }
  
  newPic = () => {
    console.log('i want to put this', this.state.profPic)
    console.log(typeof this.state.profPic)
    db.collection('users').doc(this.state.userID).set({
      'proPic': this.state.profPic,
  })
    
    
  }
  
  toggleModal = () => {
    this.setState({ modalVisible: !this.state.modalVisible });
  }
  
  closeModal = () => {
    this.setState({ modalVisible: false });
  }

  done = () => {
    this.fetchChanges();
    this.props.navigation.navigate('Me')
  }

  cancel = () => {
    this.props.navigation.goBack();
    
  }


  //this queries the specific users document and updates fields, the state is properly passed
  //the state is also a string
  fetchChanges = () => {
    console.log('i want to put this', this.state.profPic)
    console.log(typeof this.state.profPic)
    db.collection('users').doc(this.state.userID).set({
      'firstName': this.state.firstName,
      'lastName': this.state.lastName,
      'office': this.state.office,
      'bio': this.state.bio,
  })
    
    
  }



  render() {
    return (
      <View style={ styles.container }>
        {
          (() => {
            switch (this.state.uploadURL) {
              case null:
                return null
              case '':
                return <ActivityIndicator />
              default:
                return (
                  <View>
                    <Image
                      source={{ uri: this.state.uploadURL }}
                      style={ styles.image }
                    />
                    <Text>{ this.state.uploadURL }</Text>
                  </View>
                )
            }
          })()
        }
        <TouchableOpacity onPress={ () => this._pickImage() }>
          <Text style={ styles.upload }>
            Upload
          </Text>
        </TouchableOpacity>
      </View>
    )
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',  
  },
  
  loginContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
    //justifyContent: 'space-between'
  },
  
  loginButton: {
    backgroundColor: "#3BA9FF",
    width: 300,
    height: 45,
    borderColor: "transparent",
    borderWidth: 0,

  }, 
 
  buttonContainer: {
    alignItems: 'center',
    flexDirection: 'column',
    top: 40
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
    fontWeight: '500', 
    color: "#3BA9FF", 
    fontSize: 15,
    justifyContent: 'flex-start',
    marginRight: 195,
    marginTop: 15,
    paddingBottom: 5,
    

  },

  header: {
    fontWeight: '900', 
    color: '#FFF', 
    fontSize: 40,
    marginRight: 195,
    paddingBottom: 10,

  },

  avatar: {
    marginTop: 10,
    //alignItems: 'center',
  },
});


export default Settings;
