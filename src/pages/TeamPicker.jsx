import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getGroup } from "../api/groups";
import { ClipLoader } from "react-spinners";
import { generateTeamsApi } from "../api/teamPicker";
import TeamsPitchGraphic from "../components/TeamsPitchGraphic";
import { toPng } from "html-to-image";
import { toast } from "react-toastify";
import moment from "moment";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

export default function TeamPicker() {
  const { uuid } = useParams();

  const [searchParams, setSearchParams] = useSearchParams();
  const accessToken = searchParams.get("accessToken");

  // const methodChoice = localStorage.getItem("methodChoice") ?? null;

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("players");
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [teams, setTeams] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [makingChanges, setMakingChanges] = useState(false);
  // Fallback state for browsers (Firefox) that can't share files via the
  // Web Share API. Holds { dataUrl, blob, filename } so we can render the
  // image for long-press/right-click copy, or offer a plain download.
  const [shareImage, setShareImage] = useState(null);
  // const [method, setMethod] = useState(methodChoice);

  const teamsGraphicRef = useRef(null);

  // Triggers a standard browser file download from a Blob. Works
  // everywhere (no exotic clipboard/share APIs required), so this is
  // our universal fallback action.
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  const sharePng = async (blob, dataUrl, filename, title, text) => {
    const file = new File([blob], filename, { type: "image/png" });
    const shareData = { files: [file], title, text };

    // typeof-checking canShare (rather than just truthiness) makes sure
    // it's actually callable before we call it - some browsers expose
    // navigator.canShare as undefined, which would throw otherwise.
    const canShareFiles =
      typeof navigator.share === "function" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare(shareData);

    if (canShareFiles) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error.name === "AbortError") {
          // User closed the native share sheet themselves - not an error.
          return;
        }
        console.error(error);
        // Fall through to the manual fallback below.
      }
    }

    // Browsers without file-sharing support (e.g. Firefox, desktop and
    // Android) land here. Rather than fight the missing API, show the
    // image itself - long-press/right-click "Copy/Save Image" is a
    // native browser feature that works on any real <img>, no JS
    // clipboard or share API required.
    setShareImage({ dataUrl, blob, filename });
  };

  const buildPng = async (element) => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    let dataUrl = "";
    let loops = isSafari ? 4 : 1;
    for (var i = 0; i < loops; i++) {
      dataUrl = await toPng(element, {
        fetchRequestInit: {
          cache: "no-cache",
        },
        skipFonts: true,
        includeQueryParams: true,
        quality: 1,
        pixelRatio: 3,
      });
    }
    return dataUrl;
  };

  const copyTeamsText = useCallback(() => {
    var text = `👕 Shirts 👕\n${teams?.team1
      .map((p, index) => `${index + 1}. ${p.name}`)
      .join("\n")}\n\n🦺 Bibs 🦺\n${teams?.team2
      .map((p, index) => `${index + 1}. ${p.name}`)
      .join("\n")}`;
    copyTextToClipboard(text);
  }, [teams]);

  const shareTeamGraphic = useCallback(async () => {
    const dataUrl = await buildPng(teamsGraphicRef.current);
    const img = await fetch(dataUrl);
    const blob = await img.blob();
    await sharePng(
      blob,
      dataUrl,
      `teams_${moment().format("YYYY-MM-DD")}.png`,
      "Teams",
      "Here are today's teams!",
    );
  }, [teamsGraphicRef]);

  async function copyTextToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Teams Copied!", {
        theme: "dark",
        position: "bottom-center",
        autoClose: 2000,
        pauseOnFocusLoss: false,
      });
    } catch (error) {
      console.error(error);
    }
  }

  // function pickMethod(method) {
  //   const remember = $("#rememberMethodChoice").val() === "on";
  //   if (!remember) {
  //     localStorage.removeItem("methodChoice");
  //   } else {
  //     localStorage.setItem("methodChoice", method);
  //   }
  //   setMethod(method);
  //   generateTeams();
  // }

  function togglePlayerAvailable(playerUuid) {
    if (selectedPlayers.includes(playerUuid)) {
      setSelectedPlayers(selectedPlayers.filter((uuid) => uuid !== playerUuid));
    } else {
      setSelectedPlayers([...selectedPlayers, playerUuid]);
    }
  }

  // function toMethodPick() {
  //   if (methodChoice == null) {
  //     setStep("method");
  //   } else {
  //     generateTeams();
  //   }
  // }

  const generateTeams = useCallback(() => {
    setStep("generating");
    setGenerating(true);
    setTimeout(() => {
      generateTeamsApi(selectedPlayers, "", uuid).then((teams) => {
        setTeams(teams);
        setStep("teams");
      });
    }, 1000);
  }, [generating, selectedPlayers, setStep, setTeams, teams, setGenerating]);

  const backToPlayerPick = useCallback(() => {
    setStep("players");
  }, [setStep]);

  // Moves a player from the team they're currently on to the other one.
  // fromTeamIndex is 0 for team1 (Shirts/home) or 1 for team2 (Bibs/away),
  // matching the `index` TeamsPitchGraphic already uses internally.
  //
  // We use the functional setState form (prevTeams => ...) rather than
  // reading `teams` directly, so this always operates on the freshest
  // state even if multiple updates were queued in the same tick - and it
  // does the remove + add as one atomic state change instead of two.
  const movePlayerToOppositeTeam = useCallback((player, fromTeamIndex) => {
    if (!makingChanges) return;
    setTeams((prevTeams) => {
      if (!prevTeams) return prevTeams;

      const fromKey = fromTeamIndex === 0 ? "team1" : "team2";
      const toKey = fromTeamIndex === 0 ? "team2" : "team1";

      // Matching on name because that's what the rest of this component
      // already treats as the unique identifier for a player within a
      // team (see the `key={p.name}` usage in TeamsPitchGraphic). If two
      // players can share a name, this should be switched to a uuid.
      return {
        ...prevTeams,
        [fromKey]: prevTeams[fromKey].filter((p) => p.name !== player.name),
        [toKey]: [...prevTeams[toKey], player],
      };
    });
  }, [makingChanges]);

  useEffect(() => {
    setLoading(true);
    getGroup(uuid, accessToken).then((group) => {
      setGroup(group);
      setLoading(false);
    });
  }, []);

  const bibsTotalRating = Number(
    teams?.team2?.reduce((acc, player) => {
      acc += player.rating;
      return acc;
    }, 0),
  );

  const bibsAvgRating = Number(
    teams?.team2?.reduce((acc, player, index, array) => {
      acc += player.rating;
      if (index === array.length - 1) {
        return acc / array.length;
      }
      return acc;
    }, 0),
  );

  const shirtsTotalRating = Number(
    teams?.team1?.reduce((acc, player) => {
      acc += player.rating;
      return acc;
    }, 0),
  );

  const shirtsAvgRating = Number(
    teams?.team1?.length
      ? teams.team1.reduce(
      (acc, player) => acc + Number(player.rating || 0),
      0,
    ) / teams.team1.length
      : 0,
  );

  const teamsInfoModal = (
    <Dialog open={showDialog} onClose={setShowDialog} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative w-full transform overflow-hidden rounded-lg border-solid bg-gradient-to-b from-slate-800 to-[#121212] px-3 py-4 text-left shadow-xl ring-2 ring-green-500 transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:pb-4 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className="">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <DialogTitle
                    as="h3"
                    className="text-xl font-semibold leading-6 text-green-500"
                  >
                    Team Information
                  </DialogTitle>
                  <div className="mt-2 flex justify-center">
                    <table className="w-[75%]">
                      <tbody>
                      <tr>
                        <td className="text-start">Shirts Avg. Rating</td>
                        <td className="text-end">
                          {shirtsAvgRating % 1 === 0
                            ? shirtsAvgRating
                            : shirtsAvgRating.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-start">Bibs Avg. Rating</td>
                        <td className="text-end">
                          {bibsAvgRating % 1 === 0
                            ? bibsAvgRating
                            : bibsAvgRating.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-start">Shirts Total Rating</td>
                        <td className="text-end">
                          {shirtsTotalRating % 1 === 0
                            ? shirtsTotalRating
                            : shirtsTotalRating.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-start">Bibs Total Rating</td>
                        <td className="text-end">
                          {bibsTotalRating % 1 === 0
                            ? bibsTotalRating
                            : bibsTotalRating.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-start">Avg. Rating Diff:</td>
                        <td className="text-end">{teams?.avgDiff}</td>
                      </tr>
                      <tr>
                        <td className="text-start">Total Rating Diff:</td>
                        <td className="text-end">{teams?.totalDiff}</td>
                      </tr>
                      <tr>
                        <td className="text-start">Goalie Diff:</td>
                        <td className="text-end">{teams?.gkDiff}</td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                data-autofocus
                onClick={() => setShowDialog(false)}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-slate-700 px-3 py-2 text-sm font-semibold shadow-sm ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                OK
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );

  // Fallback modal shown when the Web Share API can't share files
  // (notably Firefox, which has never implemented the `files` part of
  // navigator.share/canShare). Displays the actual PNG in an <img> so
  // the browser's own native long-press (mobile) or right-click
  // (desktop) "Copy/Save Image" works, plus a manual download button
  // for a route that works regardless of browser.
  const shareImageModal = (
    <Dialog
      open={!!shareImage}
      onClose={() => setShareImage(null)}
      className="relative z-10"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <DialogPanel
            transition
            className="relative w-full max-w-sm transform overflow-hidden rounded-lg border-solid bg-gradient-to-b from-slate-800 to-[#121212] px-4 py-4 text-left shadow-xl ring-2 ring-green-500 transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
          >
            <DialogTitle
              as="h3"
              className="text-xl font-semibold leading-6 text-green-500"
            >
              Save your teams
            </DialogTitle>
            <p className="mt-2 text-sm text-gray-400">
              Your browser can't share this directly. Press and hold the image
              to copy or save it, or download it below.
            </p>
            {shareImage && (
              <img
                src={shareImage.dataUrl}
                alt="Teams graphic"
                className="mt-4 w-full rounded-lg"
              />
            )}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  downloadBlob(shareImage.blob, shareImage.filename)
                }
                className="rounded-md bg-green-600 px-3 py-2 shadow-md shadow-black"
              >
                Download
              </button>
              <button
                onClick={() => setShareImage(null)}
                className="rounded-md border-2 border-green-600 bg-transparent px-3 py-2 shadow-md shadow-black"
              >
                Close
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
          <div className="flex items-end justify-between">
            <h2 className="text-3xl">
              Team<span className="font-semibold text-green-500">Picker</span>
            </h2>
            {teams && step === "teams" && !accessToken && (
              <div
                className="text-xl text-green-500"
                onClick={() => setShowDialog(true)}
              >
                <i className="fa-solid fa-circle-info"></i>
              </div>
            )}
          </div>
          <div className="relative">
            {step === "players" && (
              <div
                className={
                  "fadeInOut absolute bottom-0 left-0 right-0 top-0 flex flex-col gap-2" +
                  `${step === "players" ? "visible" : "hide"}`
                }
              >
                <h3 className="text-xl font-semibold">{"Who's available?"}</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {group?.players
                    ?.sort((a, b) => String(a.name).localeCompare(b.name))
                    ?.map((player, index) => (
                      <div
                        onClick={() => togglePlayerAvailable(player.uuid)}
                        className={
                          "select-none rounded-lg border-2 border-solid bg-gradient-to-r from-slate-800 to-[#121212] px-3 py-2 " +
                          `${selectedPlayers.includes(player.uuid) ? "border-green-500" : "border-[#121212]"}`
                        }
                        key={index}
                      >
                        {player.name}
                      </div>
                    ))}
                </div>
                <div className="sticky bottom-0 flex flex-col items-center justify-center gap-4 p-2">
                  <button
                    onClick={generateTeams}
                    className="select-none rounded-md bg-green-600 px-4 py-2 text-xl font-semibold shadow-md shadow-black"
                  >
                    Pick Teams{" "}
                    {selectedPlayers.length > 0 &&
                      `(${selectedPlayers.length})`}
                  </button>
                </div>
              </div>
            )}
            {(step === "generating" || step === "teams") && (
              <>
                <div
                  className={
                    "fadeInOut startHidden absolute bottom-0 left-0 right-0 top-0 -z-10 flex flex-col " +
                    `${step === "generating" ? "visible" : "hide"}`
                  }
                >
                  <div className="flex flex-col items-center gap-5 py-10">
                    <p className="text-2xl text-green-500 select-none">
                      Generating Teams...
                    </p>
                    <div>
                      <ClipLoader
                        color="#22c55e"
                        size={64}
                        loading={true}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                      />
                    </div>
                  </div>
                </div>
                <div
                  className={
                    "fadeInOut startHidden absolute bottom-0 left-0 right-0 top-0 flex flex-col gap-3 " +
                    `${step === "teams" ? "visible" : "hide"}`
                  }
                >
                  <div className="flex w-auto flex-col gap-3 sm:w-[360px] sm:items-start">
                    <div className="w-full" ref={teamsGraphicRef}>
                      {teams && (
                        <TeamsPitchGraphic
                          team1={teams?.team1}
                          team2={teams?.team2}
                          onPlayerClick={movePlayerToOppositeTeam}
                          small={false}
                          makingChanges={makingChanges}
                        />
                      )}
                    </div>
                    <div className="grid w-full grid-cols-2 gap-3">
                      <button
                        onClick={() => shareTeamGraphic()}
                        className="rounded-md bg-green-600 px-3 py-2 shadow-md shadow-black"
                      >
                        Share Graphic
                      </button>
                      <button
                        onClick={() => copyTeamsText()}
                        className="rounded-md bg-green-600 px-3 py-2 shadow-md shadow-black"
                      >
                        {" "}
                        Share Text
                      </button>
                    </div>
                    <p className="text-center">Not quite right?</p>
                    <div className="grid w-full grid-cols-2 gap-3">
                      <button
                        onClick={() => backToPlayerPick()}
                        className="rounded-md border-2 border-green-600 bg-transparent px-3 py-2 shadow-md shadow-black"
                      >
                        Change players
                      </button>
                      <button
                        onClick={() => generateTeams()}
                        className="rounded-md border-2 border-green-600 bg-transparent px-3 py-2 shadow-md shadow-black"
                      >
                        {" "}
                        Regenerate
                      </button>
                    </div>
                    <button
                      onClick={() => setMakingChanges(!makingChanges)}
                      className="w-full rounded-md border-2 border-green-600 bg-transparent px-3 py-2 shadow-md shadow-black"
                    >
                      {makingChanges ? "Finish Tinkering" : "Tinker"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {teamsInfoModal}
      {shareImageModal}
    </div>
  );
}