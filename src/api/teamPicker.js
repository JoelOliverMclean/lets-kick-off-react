import { apiPost } from "../helpers/NetworkHelper";

export async function generateTeamsApi(player_uuids, method, groupUuid) {
  var response = await apiPost("team-picker", {
    player_uuids,
    method,
    groupUuid,
  });
  var teams;
  if (response.status === 200) {
    teams = response.data;
  } else {
    console.log(`Error ${response.status}:\n${response.data.error}`);
  }
  return teams;
}
