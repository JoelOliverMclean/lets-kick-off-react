import { apiDelete, apiGet, apiPost } from "../helpers/NetworkHelper";

export async function postPlayer(
  name,
  rating,
  playStyle,
  goodInGoal,
  groupUuid,
  uuid,
) {
  const response = await apiPost("players", {
    uuid,
    name,
    rating,
    play_style: playStyle,
    good_in_goal: goodInGoal,
    groupUuid,
  });
  if (response.status === 200) {
    return { player: response.data };
  } else {
    console.log(response.error);
    return { error: response.data.error };
  }
}

export async function getPlayerByName(group, name) {
  const response = await apiGet(`players/name?group=${group}&name=${name}`);
  if (response.status === 200) {
    return response.data;
  } else {
    console.log(response.data.error);
    return { error: response.data.error };
  }
}

export async function deletePlayer(uuid) {
  const response = await apiDelete(`players/${uuid}`);
  if (response.status === 200) {
    return true;
  } else {
    console.log(response.data.error);
    return false;
  }
}
