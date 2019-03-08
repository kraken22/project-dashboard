const apiurl = "http://localhost:7001/dashboard";

const makeReqest = (token, url, body, method) =>
  fetch(`${apiurl}${url}`, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      "Content-Type": "application/json",
      "x-access-token": token || ""
    }
  })
    // .then(handleHTTPErrors)
    .then(response => response.json());

const get = (token, endpoint) => makeReqest(token, endpoint, undefined, "GET");

const post = (token, endpoint, body) =>
  makeReqest(token, endpoint, body, "POST");

const put = (token, endpoint, body) => makeReqest(token, endpoint, body, "PUT");

const del = (token, endpoint, body) =>
  makeReqest(token, endpoint, body, "DELETE");

const upload = (token, url, body, onProgress) =>
  new Promise((res, rej) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${apiurl}${url}`);
    xhr.setRequestHeader("x-access-token", token || "");
    xhr.responseType = "json";
    xhr.onload = () => {
      if (xhr.status === 200) {
        res(xhr.response);
      } else {
        const message = xhr.statusText
          ? xhr.statusText
          : "Undefined Error (BAD)";
        rej(new Error(message));
      }
    };
    xhr.onerror = rej;
    if (xhr.upload && onProgress) xhr.upload.onprogress = onProgress; // event.loaded / event.total * 100 ; //event.lengthComputable
    xhr.send(body);
  });

const api = {
  get,
  post,
  put,
  del,
  upload
};

export default api;
