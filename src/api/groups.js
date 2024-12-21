import { apiGet, apiPost } from "../helpers/NetworkHelper";

export async function getMyGroups() {
  var response = await apiGet("groups/");
  if (response.status === 200) {
    return response.data;
  } else {
    console.log(response.data.error);
    return [];
  }
}

export async function getGroup(uuid) {
  var response = await apiGet(`groups/${uuid}`);
  if (response.status === 200) {
    return response.data;
  } else {
    console.log(response.data.error);
    return null;
  }
}

export async function postGroup(uuid, name) {
  var response = await apiPost(`groups`, {
    uuid,
    name,
  });
  if (response.status === 200) {
    return response.data;
  } else {
    console.log(response.data.error);
    return null;
  }
}
