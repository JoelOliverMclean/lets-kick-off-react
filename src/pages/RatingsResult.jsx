import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getGroup } from "../api/groups";
import { ClipLoader } from "react-spinners";
import {
  applyReviewResult,
  finishReview,
  getLatestReview,
  getRatingsResult,
} from "../api/ratingsReview";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import moment from "moment";

export default function RatingsResult() {
  const { uuid } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const ratings_review_uuid = searchParams.get("id");

  const [group, setGroup] = useState(null);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showApplyRatingsWarning, setShowApplyRatingsWarning] = useState(false);
  const [applyingRatings, setApplyingRatings] = useState(false);

  const applyRatings = async (reviewUuid) => {
    if (reviewUuid && !applyingRatings) {
      setApplyingRatings(true);
      applyReviewResult(reviewUuid).then((result) => {
        if (result.error) {
          toast.error("Something went wrong!", {
            theme: "dark",
            position: "bottom-center",
            autoClose: 2000,
            pauseOnFocusLoss: false,
          });
        } else {
          toast.success("Ratings applied!", {
            theme: "dark",
            position: "bottom-center",
            autoClose: 2000,
            pauseOnFocusLoss: false,
          });
        }
      });
    }
    setShowApplyRatingsWarning(false);
  };

  const confirmModal = (
    <Dialog
      open={showApplyRatingsWarning}
      onClose={setShowApplyRatingsWarning}
      className="relative z-10"
    >
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
                    Apply these ratings?
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-sm">
                      Are you sure you want to apply these ratings? This action
                      cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                onClick={() => applyRatings(review?.uuid)}
                className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
              >
                Apply Ratings
              </button>
              <button
                type="button"
                data-autofocus
                onClick={() => setShowApplyRatingsWarning(false)}
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

  useEffect(() => {
    setLoading(true);
    getGroup(uuid).then((group) => {
      setGroup(group);
      setLoading(false);
      getRatingsResult(ratings_review_uuid).then((review) => {
        if (review.error) {
          setReview(null);
          toast.error("Something went wrong!", {
            theme: "dark",
            position: "bottom-center",
            autoClose: 2000,
            pauseOnFocusLoss: false,
          });
        } else {
          console.log(review);
          setReview(review);
        }
      });
    });
  }, []);

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
          <Link
            to={`/group/${uuid}`}
            className="text-sm font-semibold text-gray-500"
          >
            <i className="fa-solid fa-chevron-left"></i> {group?.name}
          </Link>
          <div>
            <h2 className="text-xl">
              {moment(review?.review_date).format("Do MMM yyyy")}
            </h2>
            <h2 className="text-3xl font-semibold text-green-500">
              Review Results
            </h2>
            <p className="text-xs">
              The following players received no votes in any category:
              <br />
              <br />
              {review?.playersNotVotedFor.join(", ")}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {review?.result.map((player) => (
              <div
                key={player.player_uuid}
                className="flex flex-col rounded-md border-2 border-solid border-green-500 bg-slate-900 p-3"
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{player.name}</h3>
                    <p>{player.play_style_desc}</p>
                  </div>
                  <div className="flex gap-2">
                    <h2
                      className={`flex h-[32px] w-[32px] items-center justify-center rounded-lg text-center text-xl font-semibold shadow-md shadow-black ${player.good_in_goal === null ? "" : player.good_in_goal ? "rating-10" : "rating-1"}`}
                    >
                      <i className="fa-solid fa-hands"></i>
                    </h2>
                    <h2
                      className={
                        "flex h-[32px] w-[32px] items-center justify-center rounded-lg text-center text-xl font-semibold shadow-md shadow-black " +
                        `rating-${player.rating}`
                      }
                    >
                      {player.rating ?? "-"}
                    </h2>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => setShowApplyRatingsWarning(true)}
              className="rounded-md bg-green-600 px-4 py-2 text-xl shadow-lg shadow-black"
            >
              Apply Ratings
            </button>
          </div>
        </div>
      )}
      {confirmModal}
    </div>
  );
}
