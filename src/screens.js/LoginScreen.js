import React from "react";
import { Box, Button, TextInput } from "grommet";
import api from "../api";

class LoginScreen extends React.Component {
  state = {
    username: "",
    password: "",
    error: ""
  };

  login = async () => {
    try {
      const response = await api.post(undefined, "/login", {
        username: this.state.username,
        password: this.state.password
      });
      if (response.status !== "success") throw Error(response.data);
      document.cookie = response.data;
      this.props.setLoginActive(false);
    } catch (error) {
      alert(error.message);
    }
  };

  render() {
    return (
      <Box align="center">
        <Box
          margin="medium"
          basis="medium"
          width="medium"
          pad="medium"
          //   round="medium"
          //   background="light-2"
          gap="medium"
          //   elevation="medium"
        >
          <h1>Login</h1>
          <TextInput
            value={this.state.username}
            color="brand"
            placeholder="username"
            onChange={e => this.setState({ username: e.target.value })}
          />
          <TextInput
            type="password"
            value={this.state.password}
            placeholder="password"
            onChange={e => this.setState({ password: e.target.value })}
          />
          <Button type="submit" primary label="Submit" onClick={this.login} />
        </Box>
      </Box>
    );
  }
}

export default LoginScreen;
