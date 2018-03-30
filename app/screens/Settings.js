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
import { List, ListItem, Input, Avatar, Divider, Header } from 'react-native-elements';
import {firebase, db} from '../../services/firebase'

const background = require('../../images/one.jpg');
const profPic = require('../../images/bw_logo.png')
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
  setIndex = (index) => {
    if (index === this.state.index) {
      index = null
    }
    this.setState({ index })
  }
  
  getPhotos = () => {
    CameraRoll.getPhotos({
      first: 20,
      assetType: 'All'
    })
    .then(r => this.setState({ photos: r.edges }))
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
    this.props.navigation.navigate('Me')
  }


  fetchChanges = () => {
    db.collection('users').doc(this.state.userID).update({
      'firstName': this.state.firstName,
      'lastName': this.state.lastName,
      'office': this.state.office,
      'bio': this.state.bio, 
  })
    
    
  }



  render() {
    return (
      
      
      <ImageBackground style = {styles.container}  source ={background}>
      <Avatar style = {styles.avatar}
        rounded
        large
        title="CR"
        source={profPic}
        activeOpacity={0.7}
        
      />

      <TouchableHighlight onPress={() => { this.toggleModal(); this.getPhotos() }} style = {styles.avatar}>
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
              {
                this.state.photos.map((p, i) => {
                  return (
                    <TouchableHighlight
                      style={{opacity: i === this.state.index ? 0.5 : 1}}
                      key={i}
                      underlayColor='transparent'
                      onPress={() => this.setIndex(i)}
                    >
                      <Image
                        style={{
                          width: width/3,
                          height: width/3
                        }}
                        source={{uri: p.node.image.uri}}
                      />
                    </TouchableHighlight>
                  )
                })
              }
              <Button
              title='Close'
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
