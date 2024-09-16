import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deletePlayer, getPlayerByName } from "../api/players";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

export default function PlayerDetail() {
  const { uuid, name } = useParams();

  const navigate = useNavigate();

  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function confirmDeletePlayer(confirmed) {
    if (!deleting) {
      if (confirmed) {
        setDeleting(true);
        deletePlayer(player?.uuid).then((deleted) => {
          if (deleted) {
            navigate(`/group/${uuid}/players`);
          } else {
          }
          setDeleting(false);
        });
      } else {
        setShowDeleteWarning(false);
      }
    }
  }

  useEffect(() => {
    setLoading(true);
    getPlayerByName(uuid, name).then((player) => {
      setPlayer(player);
      setLoading(false);
    });
  }, []);

  const confirmModal = (
    <Dialog
      open={showDeleteWarning}
      onClose={setShowDeleteWarning}
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
                    Delete Player?
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-sm">
                      Are you sure you want to delete this player? This action
                      cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                onClick={() => confirmDeletePlayer(true)}
                className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
              >
                Delete
              </button>
              <button
                type="button"
                data-autofocus
                onClick={() => confirmDeletePlayer(false)}
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
    <>
      <div className="flex flex-col gap-4 px-4 sm:items-start">
        <Link
          to={`/group/${uuid}/players`}
          className="text-sm font-semibold text-gray-500"
        >
          <i className="fa-solid fa-chevron-left"></i> Players
        </Link>
        <div>
          <h3
            onClick={() => navigate(`/group/${uuid}`)}
            className="cursor-pointer text-xl"
          >
            Player
          </h3>
          <h1 className="text-3xl">
            <span className="font-semibold text-green-500">{player?.name}</span>
          </h1>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center justify-center gap-2">
            <h2
              className={
                "flex h-[32px] w-[32px] items-center justify-center rounded-lg text-center text-xl font-semibold shadow-md shadow-black " +
                `rating-${player?.rating}`
              }
            >
              {player?.rating}
            </h2>
          </div>
          <div className="h-100 flex flex-col items-center justify-center">
            {player?.play_style_desc?.split(" ").map((word) => (
              <div className="text-center text-base font-semibold text-green-500">
                {word}
              </div>
            ))}
          </div>
          <div className="flex flex-col justify-center text-center">
            {player?.good_in_goal ? (
              <i className="fa-solid fa-thumbs-up fa-xl text-green-500"></i>
            ) : (
              <i className="fa-solid fa-thumbs-down fa-xl text-red-600"></i>
            )}
          </div>
          <p className="text-center">Rating</p>
          <p className="text-center">Play Style</p>
          <p className="text-center">Good in Goal</p>
        </div>
        <div className="sticky bottom-0 flex flex-col items-center justify-center gap-4 p-2">
          <Link
            to={"edit"}
            className="rounded-md bg-green-600 px-4 py-2 text-xl shadow-lg shadow-black"
          >
            Edit Details
          </Link>
          <button
            onClick={() => setShowDeleteWarning(true)}
            className="rounded-md bg-red-600 px-4 py-2 text-xl shadow-lg shadow-black"
          >
            Delete Player
          </button>
        </div>
        {confirmModal}
      </div>
    </>
  );
}
