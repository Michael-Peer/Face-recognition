import React from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinKForm from './components/ImageLinKForm/ImageLinKForm';
import Rank from './components/Rank/Rank';
import Register from './components/Register/Register';
import Signin from './components/Signin/Signin';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';

import './App.css';

const particledOptions = {
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 100
      }
    }
  }
}

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends React.Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    })
  }

  // componentDidMount() {
  //   fetch('http://localhost:3000/')
  //   .then(res => res.json() )
  //   .then(console.log)
  // }

  calculateFaceLocation = (data) => {
    const clarifiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      //precent
      leftCol: clarifiFace.left_col * width,
      topRow: clarifiFace.top_row * height,
      rightCol: width - (clarifiFace.right_col * width),
      bottomRow: height - (clarifiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({ box: box })
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  }

  onSubmit = () => {
    this.setState({ imageUrl: this.state.input });
    fetch('http://localhost:3000/imageUrl', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: this.state.input,
      })
    })
      .then(response => response.json())
      .then(response => {
        if (response) {
          //increase entries
          fetch('http://localhost:3000/image', {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: this.state.user.id,
            })
          })
            .then(res => res.json())
            .then(cnt => {
              this.setState(Object.assign(this.state.user, {
                entries: cnt
              }))
            })
            .catch(console.log)
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      //clear state
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({ isSignedIn: true })
    }
    this.setState({ route: route });
  }

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        <Particles className='particles'
          params={particledOptions}
        />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        {
          route === 'home' ?
            <div>
              <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries} />
              <ImageLinKForm onInputChange={this.onInputChange} onSubmit={this.onSubmit} />
              <FaceRecognition imageUrl={imageUrl}
                box={box}
              />
            </div>
            : (
              route === 'signin'
                ? <Signin onRouteChange={this.onRouteChange}
                  loadUser={this.loadUser}
                />
                : <Register
                  onRouteChange={this.onRouteChange}
                  loadUser={this.loadUser} />
            )

        }
      </div>
    );
  }
}

export default App;
