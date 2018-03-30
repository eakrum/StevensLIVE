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
  Button
} from 'react-native';
import RNFetchBlob from 'react-native-fetch-blob'
import CameraRollPicker from 'react-native-camera-roll-picker'
import { List, ListItem, Input, Avatar, Divider, Header } from 'react-native-elements';
import {firebase, db} from '../../services/firebase'

const background = require('../../images/one.jpg');
var profPic = 'https://firebasestorage.googleapis.com/v0/b/livelecture-2dceb.appspot.com/o/posts%2Ftest.jpg?alt=media&token=535c7ab6-4d31-44d2-9ce3-db6f9650ac83'
var name;

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
      modalVisible: false
      
    }
  }

  getSelectedImages = (selectedImages, currentImage) => {
    
    const image = currentImage.uri
 
    const Blob = RNFetchBlob.polyfill.Blob
    const fs = RNFetchBlob.fs
    window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
    window.Blob = Blob
 
   
    let uploadBlob = null
    const imageRef = firebase.storage().ref('posts').child("test.jpg")
    let mime = 'image/jpg'
    fs.readFile(image, 'base64')
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
        // URL of the image uploaded on Firebase storage
        console.log(url);
        profPic = url;
        
      })
      .catch((error) => {
        console.log(error);
 
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
    //this.props.navigation.navigate('Me')
    this.props.navigation.goBack();
    
  }


  fetchChanges = () => {
    console.log(profPic);
    console.log(this.state.firstName);
    db.collection('users').doc(this.state.userID).update({
      'firstName': this.state.firstName,
      'lastName': this.state.lastName,
      'office': this.state.office,
      'bio': this.state.bio,
      'proPic': profPic,
  })
    
    
  }



  render() {
    return (
      
      
      <ImageBackground style = {styles.container}  source ={background}>
      <Avatar style = {styles.avatar}
        rounded
        large
        title="CR"
        source={{uri: profPic}}
        activeOpacity={0.7}
        
      />

      <TouchableHighlight onPress={() => { this.toggleModal()}} style = {styles.avatar}>
        <Text style = {styles.miniHeader}> Change Profile Photo </Text>
      </TouchableHighlight>
      <View style = {styles.buttonContainer}>
      

      
      <Input
        autoCorrect = {true}
        placeholder='First Name'
        color = '#FFF'
        placeholderTextColor = '#FFF'
        onChangeText={(text) => this.setState({firstName: text})} 
        value = {this.state.firstName}/>
        <Input
        autoCorrect = {true}
        placeholder='Last Name'
        color = '#FFF'
        placeholderTextColor = '#FFF'
        onChangeText={(text) => this.setState({lastName: text})} 
        value = {this.state.lastName}/>
        <Input
        autoCorrect = {true}
        placeholder='Office Location'
        color = '#FFF'
        placeholderTextColor = '#FFF'
        onChangeText={(text) => this.setState({office: text})} 
        value = {this.state.office}/>
        <Input
        autoCorrect = {true}
        placeholder='Add a bio!'
        color = '#FFF'
        placeholderTextColor = '#FFF'
        onChangeText={(text) => this.setState({bio: text})} 
        value = {this.state.bio}/>
        <Divider style={{ backgroundColor: 'blue' }} />
      

      
      </View>

      <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => console.log('closed')}
        >
          <View style={styles.modalContainer}>
            
            <ScrollView
              contentContainerStyle={styles.scrollView}>
              <CameraRollPicker selected={[]} maximum={1} callback={this.getSelectedImages} />
              <Button
              title='Done'
              onPress={this.closeModal}
            />
            </ScrollView>
          </View>
        </Modal>
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
