import { apiDelete, apiGet, apiPost } from "../helpers/NetworkHelper";

export async function getLatestReview(groupUuid) {
  const response = await apiGet(`ratings_review/latest/${groupUuid}`);
  console.log(response);
  if (response.status === 200) {
    return response.data.latestReview;
  } else {
    console.log(response.data.error);
    return { error: response.data.error };
  }
}

export async function finishReview(reviewUuid) {
  const response = await apiPost(`ratings_review/finish/${reviewUuid}`);
  if (response.status === 200) {
    return response.data;
  } else {
    console.log(response.data.error);
    return { error: response.data.error };
  }
}

export async function getRatingsResult(reviewUuid) {
  const response = await apiGet(`ratings_review/result/${reviewUuid}`);
  if (response.status === 200) {
    return response.data;
  } else {
    console.log(response.data.error);
    return { error: response.data.error };
  }
}

export async function applyReviewResult(reviewUuid) {
  const response = await apiPost(`ratings_review/apply-result/${reviewUuid}`);
  if (response.status === 200) {
    return response.data;
  } else {
    console.log(response.data.error);
    return { error: response.data.error };
  }
}

export async function createNewReview(groupUuid) {
  const response = await apiPost(`ratings_review/create/${groupUuid}`);
  if (response.status === 200) {
    return response.data;
  } else {
    console.log(response.data.error);
    return { error: response.data.error };
  }
}

export async function getReviewToVote(reviewUuid) {
  const response = await apiGet(`ratings_review/vote/${reviewUuid}`);
  if (response.status === 200) {
    return response.data;
  } else {
    console.log(response.data.error);
    return { error: response.data.error };
  }
}

export async function vote(reviewUuid, votingAs, votes) {
  const body = {
    ratings_review_uuid: reviewUuid,
    voting_as_uuid: votingAs.uuid,
    votes,
  };
  const response = await apiPost(`ratings_review/vote/submit`, body);
  if (response.status === 200) {
    return response.data;
  } else {
    console.log(response.data.error);
    return { error: response.data.error };
  }
}
