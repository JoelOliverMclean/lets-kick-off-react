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
  // const [method, setMethod] = useState(methodChoice);

  const teamsGraphicRef = useRef(null);

  const sharePng = async (pngBlob, filename, title, text) => {
    try {
      const shareData = {
        files: [
          new File([pngBlob], filename, {
            type: "image/png",
          }),
        ],
        title,
        text,
      };
      if (navigator.canShare(shareData)) {
        console.log("Attempting to share");
        await navigator.share(shareData);
      } else {
        toast.error("Can't share, tap me to download", {
          autoClose: 2500,
          pauseOnFocusLoss: false,
          theme: "dark",
          onClick: async () => {
            await navigator.clipboard.write([
              new ClipboardItem({
                [pngBlob.type]: pngBlob,
              }),
            ]);
          },
        });
      }
    } catch (error) {
      console.error(error);
    }
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
    var dataUrl = await buildPng(teamsGraphicRef.current);
    var img = await fetch(dataUrl);
    var blob = await img.blob();
    sharePng(
      blob,
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

  useEffect(() => {
    setLoading(true);
    getGroup(uuid, accessToken).then((group) => {
      setGroup(group);
      setLoading(false);
    });
  }, []);

  const bibsTotalRating = Number(
    teams?.team2?.reduce(
      (acc, player) => {
        acc += player.rating;
        return acc;
      },
      0,
    ),
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
                <h3 className="text-xl font-semibold">Who's available?</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {group?.players?.map((player, index) => (
                    <div
                      onClick={() => togglePlayerAvailable(player.uuid)}
                      className={
                        "rounded-lg border-2 border-solid bg-gradient-to-r from-slate-800 to-[#121212] px-3 py-2 " +
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
                    className="rounded-md bg-green-600 px-4 py-2 text-xl font-semibold shadow-md shadow-black"
                  >
                    Pick Teams{" "}
                    {selectedPlayers.length > 0 &&
                      `(${selectedPlayers.length})`}
                  </button>
                </div>
              </div>
            )}
            {/* {step === "method" && (
              <div
                className={
                  "fadeInOut absolute bottom-0 left-0 right-0 top-0 flex flex-col gap-3 " +
                  `${step === "method" ? "visible" : "hide"}`
                }
              >
                <h3 className="text-xl font-semibold">
                  How do you prefer to pick?
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <button
                    onClick={() => pickMethod("total")}
                    className="rounded-lg border-2 border-solid border-green-500 px-3 py-2 hover:bg-slate-900"
                  >
                    Total Rating
                  </button>
                  <button
                    onClick={() => pickMethod("average")}
                    className="rounded-lg border-2 border-solid border-green-500 px-3 py-2 hover:bg-slate-900"
                  >
                    Average Rating
                  </button>
                  <button
                    onClick={() => pickMethod("combination")}
                    className="rounded-lg border-2 border-solid border-green-500 px-3 py-2 hover:bg-slate-900"
                  >
                    Combination
                  </button>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <label className="text-sm">Remember my choice?</label>
                  <label className="switch switch-sm">
                    <input type="checkbox" id="rememberMethodChoice" />
                    <span className="slider-sm rounded-md before:rounded-md"></span>
                  </label>
                </div>
              </div>
            )} */}
            {(step === "generating" || step === "teams") && (
              <>
                <div
                  className={
                    "fadeInOut startHidden absolute bottom-0 left-0 right-0 top-0 -z-10 flex flex-col " +
                    `${step === "generating" ? "visible" : "hide"}`
                  }
                >
                  <div className="flex flex-col items-center gap-5 py-10">
                    <p className="text-2xl text-green-500">
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
                          onPlayerClick={() => {}}
                          small={false}
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
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {teamsInfoModal}
    </div>
  );
}
