import React, { Component } from "react";
import { Grommet } from "grommet";
import LoginScreen from "./screens.js/LoginScreen";
import Dashboard from "./screens.js/Dashboard";
import Colors from "./Colors";
import api from "./api";

const theme = {
  global: {
    colors: {
      brand: Colors.primary,
      focus: Colors.accent
    }
  }
};

class App extends Component {
  state = {
    loginScreenActive: true
  };

  async componentDidMount() {
    try {
      const response = await api.get(document.cookie, "/verifyToken");
      if (response.status !== "success") throw Error(response.data);
      this.setState({ loginScreenActive: false });
    } catch (error) {}
  }

  render() {
    const { loginScreenActive } = this.state;

    return (
      <Grommet theme={theme}>
        {loginScreenActive ? (
          <LoginScreen
            setLoginActive={value =>
              this.setState({ loginScreenActive: value })
            }
          />
        ) : (
          <Dashboard
            setLoginActive={value =>
              this.setState({ loginScreenActive: value })
            }
          />
        )}
      </Grommet>
    );
  }
}

export default App;
