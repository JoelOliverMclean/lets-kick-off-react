import React, { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getReviewToVote, vote } from "../api/ratingsReview";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import $ from "jquery";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

export default function RatingsReviewVote() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState(null);
  const [voter, setVoter] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [currentDialog, setCurrentDialog] = useState({});
  const [votes, setVotes] = useState([]);
  const [concluded, setConcluded] = useState(false);

  const [currentStep, setCurrentStep] = useState(-1);
  const [fade, setFade] = useState("");

  const finishVotingDialogContent = {
    title: "Finished voting?",
    body: "Are you sure you want to submit your votes? You won't be able to vote again, any votes are final and you can't go back to vote for any you missed.",
    acceptButton: "Submit votes",
    acceptAction: () => {
      setSubmitting(true);
      vote(searchParams.get("id"), voter, votes).then((result) => {
        setShowDialog(false);
        if (result.error) {
          toast.error("Something went wrong!", {
            theme: "dark",
            position: "bottom-center",
            autoClose: 2000,
            pauseOnFocusLoss: false,
          });
        } else {
          setSubmitted(true);
          setSubmitting(false);
          Cookies.set(`voted_${searchParams.get("id")}`, true);
          goToStep(2);
        }
      });
    },
  };

  const playerPickStep = (
    <div className="flex flex-col">
      <h3 className="text-3xl font-bold">Who are you?</h3>
      <p className="p-2 text-xs">
        Your vote is totally anonymous, this is just to keep a count of how many
        players have voted and also to prevent double voting
      </p>
      <div className="grid grid-cols-2 gap-2 pb-4 pt-2">
        {review?.players_available?.map((player) => (
          <div
            onClick={() => voterChosen(player)}
            key={player.uuid}
            className={`rounded-md border border-green-500 p-2 text-center text-xl duration-500 ${player === voter ? "bg-green-700" : "bg-gradient-to-b from-gray-800 to-black hover:from-black hover:to-gray-800"}`}
          >
            <div>
              {player.name}
              {player === voter && (
                <i className="fa-solid fa-circle-check ps-2" />
              )}
            </div>
          </div>
        ))}
      </div>
      <button
        disabled={!voter}
        onClick={() => {
          if (voter) goToNextStep();
        }}
        className={`rounded-md ${voter ? "bg-green-600 shadow-lg shadow-black hover:bg-green-500" : "bg-green-800"} px-4 py-2 text-xl`}
      >
        {voter ? `Vote as ${voter.name}` : "Pick a player"}
      </button>
    </div>
  );

  const handleVotingForm = useCallback(
    (e) => {
      e.preventDefault();

      var data = $(e.target)
        .serializeArray()
        .reduce((acc, curr) => ((acc[curr.name] = curr.value), acc), {});

      function convertPlayerData(dataObj) {
        // Group properties by UUID
        const result = Object.entries(dataObj).reduce((acc, [key, value]) => {
          if (value === "-") return acc;
          const match = key.match(/^(rating|playstyle|goodInGoal)_(.+)$/);
          if (match) {
            const [_, property, uuid] = match;
            if (!acc[uuid]) acc[uuid] = { uuid };
            acc[uuid][property] = value;
          }
          return acc;
        }, {});

        return Object.values(result);
      }

      const voteData = convertPlayerData(data);

      setVotes(voteData);

      setCurrentDialog(finishVotingDialogContent);
      setShowDialog(true);
    },
    [voter, setVoter],
  );

  const voterChosen = useCallback(
    (player) => {
      console.log(player);
      Cookies.set(`votingAs_${searchParams.get("id")}`, player.uuid);
      setVoter(player);
    },
    [setVoter],
  );

  const voteStep = (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-2xl font-bold">
          Alright {voter?.name}, time to vote!
        </h3>
        <p className="text-xs">
          For each player, give them a score out of 10 for ability, pick a play
          style you think suits them and say whether or not they are especially
          good in goal!
          <br />
          <br />
          (If you are not sure or don't know the player, you can leave any field
          blank "-" and it won't be counted towards that player.)
        </p>
      </div>
      <form
        id="playerForm"
        className="w-full sm:w-1/2 lg:w-1/4"
        onSubmit={handleVotingForm}
      >
        <div className="flex flex-col gap-2">
          {review?.players
            ?.filter((p) => p.uuid !== voter?.uuid)
            ?.map((player) => (
              <div key={player.uuid} className={`flex flex-col rounded-md`}>
                <div className="text-xl font-semibold">
                  <div className="px-2 pb-1">{player.name}</div>
                  {/* <div className="border border-green-500"></div> */}
                </div>
                <div className="flex justify-between rounded-lg bg-green-800 px-2 py-3 text-center text-sm shadow shadow-black">
                  <div className="flex flex-col gap-1 px-1">
                    <div>Rating</div>
                    <select
                      name={`rating_${player.uuid}`}
                      className="rounded-md border-0 border-solid border-transparent px-1 py-1 duration-300 focus:border-green-500 focus:outline-none focus:ring-0"
                    >
                      <option value={null}>-</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                        <option value={rating} key={rating}>
                          {rating}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1 px-1">
                    <div>Playstyle</div>
                    <select
                      name={`playstyle_${player.uuid}`}
                      className="rounded-md border-0 border-solid border-transparent px-1 py-1 duration-300 focus:border-green-500 focus:outline-none focus:ring-0"
                    >
                      <option value={null}>-</option>
                      {[
                        "Deep Defender",
                        "Defensive",
                        "Mixed",
                        "Attacking",
                        "Goal Scorer",
                      ].map((playStyle, index) => (
                        <option value={index - 2} key={index}>
                          {playStyle}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1 px-1">
                    <div>Good in goal?</div>
                    <select
                      name={`goodInGoal_${player.uuid}`}
                      className="rounded-md border-0 border-solid border-transparent px-1 py-1 duration-300 focus:border-green-500 focus:outline-none focus:ring-0"
                    >
                      <option value={null}>-</option>
                      {["Yes", "No"].map((goodInGoalOption, index) => (
                        <option value={goodInGoalOption === "Yes"} key={index}>
                          {goodInGoalOption}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div className="px-1 pt-5 duration-200 hover:px-0">
          <button
            className="w-full rounded-md bg-green-600 px-4 py-2 text-xl font-semibold shadow-lg shadow-black"
            type="submit"
            name="finished"
          >
            Submit votes
          </button>
        </div>
      </form>
    </div>
  );

  const votedStep = (
    <div className="flex flex-col gap-3">
      <h1 className="text-2xl">Thanks for your vote</h1>
      <p>Your submission will remain anonymous even to the group owner</p>
    </div>
  );

  const steps = [playerPickStep, voteStep, votedStep];

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      if (currentStep === 0 && !voter) return;
      if (
        currentStep === 1 &&
        (!submitted || !Cookies.get(`voted_${searchParams.get("id")}`))
      )
        return;
      setFade("fade-out");
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setFade("fade-in");
      }, 500);
    }
  };

  const goToStep = (step, voter) => {
    var stepToChangeTo = step;
    if (step < steps.length) {
      if (step === 1 && !voter) {
        stepToChangeTo = 0;
      } else if (
        step === 2 &&
        !submitted &&
        !Cookies.get(`voted_${searchParams.get("id")}`)
      ) {
        if (!voter) stepToChangeTo = 0;
        else stepToChangeTo = 1;
      }
      setFade("fade-out");
      setTimeout(() => {
        setCurrentStep(stepToChangeTo);
        setFade("fade-in");
      }, 500);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setFade("fade-out");
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setFade("fade-in");
      }, 300);
    }
  };

  function fetchReview() {
    getReviewToVote(searchParams.get("id")).then((result) => {
      if (result.error) {
        setConcluded(true);
      } else {
        setReview(result);
        const voted = Cookies.get(`voted_${searchParams.get("id")}`);
        if (voted) {
          goToStep(2);
        } else {
          const votingAsUuid = Cookies.get(
            `votingAs_${searchParams.get("id")}`,
          );
          if (
            votingAsUuid &&
            result.players.some((p) => p.uuid === votingAsUuid)
          ) {
            const votingAs = result.players.find(
              (p) => p.uuid === votingAsUuid,
            );
            if (result.players_available.some((p) => p.uuid === votingAsUuid)) {
              setVoter(votingAs);
              goToStep(1, votingAs);
            } else {
              Cookies.set(`voted_${searchParams.get("id")}`, true);
              goToStep(2);
            }
          } else {
            goToStep(0);
          }
        }
      }
    });
  }

  useEffect(fetchReview, []);

  const confirmModal = (
    <Dialog open={showDialog} onClose={setShowDialog} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg border-solid bg-gradient-to-b from-slate-800 to-[#121212] px-3 py-4 text-left shadow-xl ring-2 ring-green-500 transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:pb-4 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className="">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <DialogTitle
                    as="h3"
                    className="text-base font-semibold leading-6 text-green-500"
                  >
                    {currentDialog.title}
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-sm">{currentDialog.body}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              {currentDialog.acceptButton && (
                <button
                  type="button"
                  onClick={currentDialog.acceptAction}
                  className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
                >
                  {currentDialog.acceptButton}
                </button>
              )}
              <button
                type="button"
                data-autofocus
                onClick={() => setShowDialog(false)}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-slate-700 px-3 py-2 text-sm font-semibold shadow-sm ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );

  return (
    <div className="px-4 pb-6">
      {loading ? (
        <div className="text-center">
          <ClipLoader
            color="#f0f0f0"
            loading={loading}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl">{review?.groupName}</h2>
            <h2 className="text-3xl font-semibold text-green-500">
              Ratings Review
            </h2>
          </div>
          <div>
            {concluded ? (
              <div>
                <h2 className="text-xl">
                  This review does not exist or has concluded
                </h2>
              </div>
            ) : (
              <div className="step-container">
                <div className={`step ${fade}`}>{steps[currentStep]}</div>
              </div>
            )}
          </div>
        </div>
      )}
      {confirmModal}
    </div>
  );
}
