import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { getGroup } from "../api/groups";
import { ClipLoader } from "react-spinners";
import { generateTeamsApi } from "../api/teamPicker";
import TeamsPitchGraphic from "../components/TeamsPitchGraphic";
import { toPng } from "html-to-image";
import { toast } from "react-toastify";
import moment from "moment";

export default function TeamPicker() {
  const { uuid } = useParams();

  // const methodChoice = localStorage.getItem("methodChoice") ?? null;

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("players");
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [teams, setTeams] = useState(null);
  const [generating, setGenerating] = useState(false);
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
    console.log("boop");
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

  useEffect(() => {
    setLoading(true);
    getGroup(uuid).then((group) => {
      setGroup(group);
      setLoading(false);
    });
  }, []);

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
            <h2 className="text-3xl">
              Team<span className="font-semibold text-green-500">Picker</span>
            </h2>
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
                    Pick Teams
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
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
