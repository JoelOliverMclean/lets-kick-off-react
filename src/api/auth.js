import { apiGet, apiPost } from "../helpers/NetworkHelper";

export async function login(username, password) {
  var response = await apiPost("auth/login", {
    username,
    password,
  });
  if (response.status === 200) {
    return response.data;
  } else {
    console.log(response.error);
    return null;
  }
}

export async function logout() {
  var response = await apiPost("auth/logout");
  if (response.status === 200) {
    return true;
  } else {
    console.log(response.error);
    return false;
  }
}

export async function register(name, username, password, groupName) {
  var response = await apiPost("auth/", {
    name,
    username,
    password,
    groupName,
  });
  if (response.status === 200) {
    return response.data;
  } else {
    console.log(response);
    return null;
  }
}

export async function helloWorld() {
  var response = await apiGet("/0.1");
  console.log(response);
}

export async function getLoggedInUser() {
  var response = await apiGet("auth/validate");
  if (response.status === 200) {
    return response.data;
  } else {
    Cookies.remove("loggedIn");
    return null;
  }
}
