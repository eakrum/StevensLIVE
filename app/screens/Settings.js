import React, { Component } from 'react';
import { ScrollView, StyleSheet, ImageBackground, Text, View } from 'react-native';
import { List, ListItem,Button, Input } from 'react-native-elements';
import {firebase, db} from '../../services/firebase'

const background = require('../../images/one.jpg')

class Settings extends Component {

  constructor(props) {
    super(props)
    this.state = {
      userID: firebase.auth().currentUser.uid,
      bio: '',
      new: 'test'
    }
  }

  done = () => {
    this.fetchChanges();
    this.props.navigation.navigate('Me')
  }

  fetchChanges = () => {
    db.collection('users').doc(this.state.userID).update({
      'bio': this.state.bio, 
  })
    
    
  }



  render() {
    return (
      <ImageBackground style = {styles.container}  source ={background}>
      <View style = {styles.buttonContainer}>
      
      <Input
        containerStyle={styles.input}
        autoCorrect = {true}
        placeholder='Add a bio!'
        color = '#FFF'
        placeholderTextColor = '#FFF'
        onChangeText={(text) => this.setState({bio: text})} 
        value = {this.state.bio}/>
        <Button 
          text="Done"
          raised
          large
          textStyle={{ fontWeight: "bold" }}
          buttonStyle={styles.loginButton} 
          onPress = {this.done}
          />

      
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
    fontWeight: '900', 
    color: '#909497', 
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

  }
});


export default Settings;
