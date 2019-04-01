import React from "react";
import { Box, Button, Anchor, TextInput } from "grommet";
import * as Icons from "grommet-icons";
import api from "../api";

class Dashboard extends React.Component {
  state = {
    projects: [],
    newName: "",
    newEndpoint: "",
    newVisible: false
  };

  async componentDidMount() {
    try {
      const response = await api.get(document.cookie, "/projects");
      if (response.status !== "success") throw Error(response.data);
      this.setState({ projects: response.data || [] });
    } catch (error) {
      alert(error.message);
    }
  }

  deleteProject = async project => {
    try {
      // eslint-disable-next-line no-restricted-globals
      const isSure = confirm("Are you sure you want to delete " + project.name);
      if (!isSure) return;
      const response = await api.post(document.cookie, "/projects/delete", {
        endpoint: project.endpoint
      });
      if (response.status !== "success") throw Error(response.data);
      this.setState({ projects: response.data || [] });
    } catch (error) {
      alert(error.message);
    }
  };

  newProject = async () => {
    try {
      // eslint-disable-next-line no-restricted-globals
      const response = await api.post(document.cookie, "/projects/new", {
        endpoint: this.state.newEndpoint,
        name: this.state.newName
      });
      if (response.status !== "success") throw Error(response.data);
      this.setState({
        projects: response.data || [],
        newEndpoint: "",
        newName: "",
        newVisible: false
      });
    } catch (error) {
      alert(error.message);
    }
  };

  uploadNewVersion = async project => {
    try {
      const fileInput = document.getElementById("fileInput");
      fileInput.click();
      await new Promise((res, rej) => {
        fileInput.onchange = async () => {
          const formData = new FormData();
          if (fileInput.files.length !== 1)
            rej("You must select exactly one zip file");
          formData.append("file", fileInput.files[0]);
          this.setUploadInfo({ uploading: true }, project.endpoint);
          const response = await api.upload(
            document.cookie,
            `/projects/${project.endpoint}/newVersion`,
            formData,
            e => {
              const percentage = e.loaded / e.total;
              this.setUploadInfo(
                { uploadPercentage: percentage },
                project.endpoint
              );
            }
          );
          this.setUploadInfo({ uploading: false }, project.endpoint);
          if (response.status !== "success") rej(new Error(response.data));
          res();
        };
      });
    } catch (error) {
      alert(error.message);
    }
  };

  setUploadInfo = (uploadInfo, endpoint) => {
    this.setState({
      projects: this.state.projects.map(p =>
        p.endpoint === endpoint ? { ...p, ...uploadInfo } : p
      )
    });
  };

  render() {
    return (
      <Box height="100vh">
        <Box pad="small" justify="between" direction="row">
          <h2>Project Dashboard</h2>

          <Button
            onClick={() => this.setState({ newVisible: true })}
            primary
            label="New Project"
            icon={<Icons.Add />}
          />
          <Button
            onClick={() => {
              document.cookie = undefined;
              this.props.setLoginActive(true);
            }}
            primary
            label="Log Out"
            color="#ff0000"
            icon={<Icons.Logout />}
          />
        </Box>

        <input
          id="fileInput"
          type="file"
          style={{ display: "none" }}
          accept=".zip"
        />

        {this.state.projects.map((project, i) => (
          <Box
            key={i.toString()}
            background="light-2"
            round="xsmall"
            margin="small"
            pad="small"
            justify="between"
            direction="row"
          >
            <Box>
              <h3>{project.name}</h3>
              <Anchor
                href={
                  "/projects/" + project.endpoint + "/"
                }
                label={
                  "http://jantschulev.ddns.net/projects/" + project.endpoint + "/"
                }
                target="_blank"
              />
            </Box>
            <Box direction="row" gap="small">
              {project.uploading ? (
                <Box width="small" round="small" height="xxsmall">
                  <Box
                    width={`${project.uploadProgress * 100}%`}
                    height="100%"
                    background="brand"
                    round="small"
                  />
                </Box>
              ) : (
                <Button
                  label="New Version"
                  icon={<Icons.Upload />}
                  onClick={() => this.uploadNewVersion(project)}
                />
              )}
              <Button
                color="#f00"
                label="Delete"
                icon={<Icons.Trash color="#f00" />}
                onClick={() => this.deleteProject(project)}
              />
            </Box>
          </Box>
        ))}
        {this.state.newVisible && (
          <Box
            style={{ position: "absolute", top: 0, left: 0 }}
            height="100%"
            width="100%"
            background="#00000088"
            align="center"
            justify="center"
          >
            <Box
              margin="medium"
              basis="medium"
              width="medium"
              pad="medium"
              gap="medium"
              background="light-2"
              round="medium"
            >
              <h1>New Project</h1>
              <TextInput
                value={this.state.newName}
                placeholder="Project Name"
                onChange={e => this.setState({ newName: e.target.value })}
              />
              <TextInput
                value={this.state.newEndpoint}
                placeholder="End point"
                onChange={e => this.setState({ newEndpoint: e.target.value })}
              />
              <Button
                type="submit"
                primary
                label="Submit"
                onClick={this.newProject}
              />
              <Button
                label="cancel"
                onClick={() => this.setState({ newVisible: false })}
              />
            </Box>
          </Box>
        )}
      </Box>
    );
  }
}

export default Dashboard;
