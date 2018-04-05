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
} from 'react-native';

import RNFetchBlob from 'react-native-fetch-blob';
import CameraRollPicker from 'react-native-camera-roll-picker';
import { List, ListItem, Avatar, Divider, Header, Icon } from 'react-native-elements';
import {firebase, db} from '../../services/firebase';
import {
  ActionsContainer,
  FieldsContainer,
  Fieldset,
  Form,
  FormGroup,
  Input,
  Label,
  Switch
} from 'react-native-clean-form';

 
const background = require('../../images/one.jpg');
var profPic;
var name;

const { width } = Dimensions.get('window')

class Settings extends Component {

  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: 'Settings',
      headerRight: (
        <Icon iconStyle = {styles.done} name= 'md-checkmark' size={30} type = 'ionicon' color= '#FFF' onPress = {params.done}/>
      ),
      headerLeft: (
        <Icon iconStyle = {styles.exit} name="ios-arrow-back" size={30} type = 'ionicon' color= '#FFF' onPress = {params.cancel}/>
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
      email: '',
      bio: '',
      photos: [],
      index: null, 
      modalVisible: false
      
    }
  }

  getSelectedImages = (selectedImages, currentImage) => {
    
    const image = currentImage.uri
 
    const Blob = RNFetchBlob.polyfill.Blob;
    window.Blob = Blob;
    const tempWindowXMLHttpRequest = window.XMLHttpRequest;
    window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
    const fs = RNFetchBlob.fs
 
   
    let uploadBlob = null
    const imageRef = firebase.storage().ref('profile-photos').child(firebase.auth().currentUser.email)
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
        // URL of the image uploaded on cloud storage
        console.log(url);
        profPic = url;
        window.XMLHttpRequest = tempWindowXMLHttpRequest;
        
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

  save = () => {
    alert(this.state.firstName)
  }



  render() {
    return (
      <View style = {styles.formCont}>
      <View style = {styles.profileContainer}>
      <Avatar style = {styles.avatar}
        rounded
        large
        title="CR"
        source={{uri: profPic}}
        activeOpacity={0.7}
        
      />
      <TouchableHighlight onPress={() => { this.toggleModal()}} style = {styles.avatar}>
        <Text style = {styles.profileButton}> Change Profile Photo </Text>
      </TouchableHighlight>
      </View>
      <Form>
      <FieldsContainer>
        <Fieldset label="Profile details">
          <FormGroup>
            <Label>First name</Label>
            <Input placeholder="Enter your first name" onChangeText={(text) => this.setState({firstName: text})} />
          </FormGroup>
          <FormGroup>
            <Label>Last name</Label>
            <Input placeholder="Enter your last name" onChangeText={(text) => this.setState({lastName: text})} />
          </FormGroup>
          <FormGroup>
            <Label>Email</Label>
            <Input placeholder="Enter your email address" onChangeText={(text) => this.setState({email: text})} />
          </FormGroup>
          <FormGroup>
            <Label>Bio</Label>
            <Input placeholder="Enter a short bio" onChangeText={(text) => this.setState({bio: text})} />
          </FormGroup>
        </Fieldset>
        <Fieldset label="Personal Details" last>
          <FormGroup>
            <Label>Office Location</Label>
            <Input placeholder="BC 211" onChangeText={this.onPasswordChange} />
          </FormGroup>
          <FormGroup>
            <Label>Phone Number</Label>
            <Input placeholder="Enter your phone number" onChangeText={this.onRepeatPasswordChange} />
          </FormGroup>
          <FormGroup border={false}>
            <Label>Instructor</Label>
            <Switch onValueChange={this.toggle} />
          </FormGroup>     
        </Fieldset>
      </FieldsContainer>
    </Form>

      <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => console.log('closed')}>
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
      </View>  
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

  profileContainer: {
    alignItems: 'center', 
    marginTop: 5,
    

  },

  exit: {
    marginLeft: 20,
  },

  done: {
    marginRight: 20,
  },

  profileButton: {
    color: "#3BA9FF", 
    fontSize: 15,

  },

  avatar: {
    marginTop: 50,
    //alignItems: 'center',
  },
  formCont: {
    flex: 1,  
  },

});


export default Settings;
