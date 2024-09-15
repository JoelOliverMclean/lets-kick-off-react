import axios from "axios";

const api = axios.create({
  baseURL: "/api/",
  withCredentials: true,
  headers: {
    "Content-type": "application/json",
  },
});

const apiGet = (action, params = {}) => {
  return api.get(action, {
    validateStatus: (status) => {
      return true;
    },
    params: params ?? {},
  });
};

const apiDelete = (action, id) => {
  return api.delete(action, {
    params: {
      id: id,
    },
    validateStatus: (status) => {
      return true;
    },
  });
};

const apiPost = (action, body) => {
  return api.post(action, body, {
    validateStatus: (status) => {
      return true;
    },
    headers: {
      "Content-type": "application/json",
    },
  });
};

const apiPostFormData = (action, body) => {
  return api.post(action, body, {
    validateStatus: (status) => {
      return true;
    },
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

const getCsrfToken = async () => {
  apiGet("csrf").then((response) => {
    if (response.status === 200) {
      console.log(response.data.csrfToken);
      api.defaults.headers = {
        "x-csrf-token": response.data.csrfToken,
      };
    }
  });
};

export { apiGet, apiPost, getCsrfToken, apiDelete, apiPostFormData };
