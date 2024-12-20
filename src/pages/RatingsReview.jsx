import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { getGroup } from "../api/groups";
import { ClipLoader } from "react-spinners";
import {
  createNewReview,
  finishReview,
  getLatestReview,
} from "../api/ratingsReview";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import moment from "moment";

export default function RatingsReview() {
  const { uuid } = useParams();

  const [group, setGroup] = useState(null);
  const [latestReview, setLatestReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [currentDialog, setCurrentDialog] = useState({});
  const [finishingReview, setFinishingReview] = useState(false);
  const [startingNewReview, setStartingNewReview] = useState(false);

  const notEnoughVotesDialogContent = {
    title: "Need more votes!",
    body: "You need at least 6 votes to finish this review!",
  };

  const finishReviewDialogContent = {
    title: "Finish latest review?",
    body: "Are you sure you want to finish the review? No further votes will be allowed. This action cannot be undone.",
    acceptButton: "Finish Review",
    acceptAction: () => confirmFinishReview(),
  };

  const startNewReviewDialogContent = {
    title: "Start new review?",
    body: "Are you sure you want to start a new review? Any current review will be concluded. This action cannot be undone.",
    acceptButton: "Start New Review",
    acceptAction: () => startNewReview(),
  };

  async function copyTextToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Voting link Copied!", {
        theme: "dark",
        position: "bottom-center",
        autoClose: 2000,
        pauseOnFocusLoss: false,
      });
    } catch (error) {
      console.error(error);
    }
  }

  const shareVotingLink = async (id) => {
    const siteUrl = import.meta.env.VITE_SITE_URL;
    const votingLink = `${siteUrl}/ratings-review/vote?id=${id}`;
    copyTextToClipboard(votingLink);
  };

  useEffect(() => {
    setLoading(true);
    getGroup(uuid).then((group) => {
      setGroup(group);
      setLoading(false);
      getLatestReview(uuid).then((result) => {
        if (!result || result.error) {
          setLatestReview(null);
        } else {
          setLatestReview(result);
        }
      });
    });
  }, []);

  const startNewReview = () => {
    if (!startingNewReview) {
      setStartingNewReview(true);
      createNewReview(uuid).then((result) => {
        if (result.error) {
          toast.error("Something went wrong!", {
            theme: "dark",
            position: "bottom-center",
            autoClose: 2000,
            pauseOnFocusLoss: false,
          });
        } else {
          setLatestReview(result);
        }
      });
    }
    setShowDialog(false);
  };

  const confirmFinishReview = () => {
    if (!finishingReview) {
      setFinishingReview(true);
      finishReview(latestReview?.uuid).then((result) => {
        if (result.error) {
          toast.error("Something went wrong!", {
            theme: "dark",
            position: "bottom-center",
            autoClose: 2000,
            pauseOnFocusLoss: false,
          });
        } else {
          toast.success("Review finished!", {
            theme: "dark",
            position: "bottom-center",
            autoClose: 2000,
            pauseOnFocusLoss: false,
          });
          getLatestReview(uuid).then((result) => {
            if (!result || result.error) {
              setLatestReview(null);
            } else {
              setLatestReview(result);
            }
          });
        }
        setFinishingReview(false);
        setShowDialog(false);
      });
    }
  };

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
    <div className="px-4">
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
          <Link
            to={`/group/${uuid}`}
            className="text-sm font-semibold text-gray-500"
          >
            <i className="fa-solid fa-chevron-left"></i> {group?.name}
          </Link>
          <div>
            <h2 className="text-xl">{group?.name}</h2>
            <h2 className="text-3xl font-semibold text-green-500">
              Ratings Review
            </h2>
          </div>
          {/* Boop */}
          {latestReview ? (
            <>
              <div className="flex flex-col gap-1 rounded-md border-2 border-solid border-green-500 bg-slate-900 p-3">
                <div>
                  <h3 className="text-xl font-semibold">
                    {latestReview.concluded ? (
                      <>
                        <span>
                          <i className="fa-solid fa-flag-checkered"></i>
                        </span>
                        &nbsp; Review concluded
                      </>
                    ) : (
                      <>
                        <span>
                          <i className="fa-solid fa-hourglass-half"></i>
                        </span>
                        &nbsp; Review in progress
                      </>
                    )}
                  </h3>
                  <div className="px-1 py-1">
                    <p>
                      {moment(latestReview.review_date).format("Do MMM yyyy")}
                    </p>
                    <p>
                      Players voted: {latestReview.votes_counted}/
                      {latestReview.player_count}
                    </p>
                  </div>
                </div>
                <div className="flex flex-row gap-3">
                  {latestReview.concluded ? (
                    <Link
                      to={`result?id=${latestReview.uuid}`}
                      className="flex-grow rounded-md bg-green-600 px-3 py-1 text-center text-lg"
                    >
                      View Result
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={() => shareVotingLink(latestReview.uuid)}
                        className="flex-grow rounded-md bg-blue-500 px-3 py-1 text-center text-lg"
                      >
                        Share Link
                      </button>
                      <button
                        onClick={() => {
                          setCurrentDialog(
                            latestReview.votes_counted >= 6
                              ? finishReviewDialogContent
                              : notEnoughVotesDialogContent,
                          );
                          setShowDialog(true);
                        }}
                        className={`flex-grow rounded-md ${latestReview.votes_counted < 6 ? "bg-green-900" : "bg-green-600"} px-3 py-1 text-center text-lg`}
                      >
                        Finish Review
                      </button>
                    </>
                  )}
                </div>
              </div>
              <hr />
            </>
          ) : (
            <div>
              <h1 className="text-center text-2xl text-gray-500">
                No ratings review yet
              </h1>
            </div>
          )}
          <div className="flex justify-center">
            <button
              onClick={() => {
                setCurrentDialog(startNewReviewDialogContent);
                setShowDialog(true);
              }}
              className="rounded-md bg-green-600 px-4 py-2 text-xl shadow-lg shadow-black"
            >
              Start New Review
            </button>
          </div>
          {confirmModal}
        </div>
      )}
    </div>
  );
}
