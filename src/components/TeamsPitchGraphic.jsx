import { useContext } from "react";
import { AuthContext } from "../helpers/AuthContext";
import shirt from "../assets/img/shirt.png";
import bib from "../assets/img/bib.png";
import boxGraphic from "../assets/img/box.png";
import bottomBoxGraphic from "../assets/img/box_bottom.png";
import centerCircleGraphic from "../assets/img/center-circle.png";
import bottomCenterCircleGraphic from "../assets/img/center-circle-bottom.png";

const topGoalStyle = {
  borderRadius: "10px 10px 0px 0px",
  backgroundImage: `url(${boxGraphic})`,
};
const bottomGoalStyle = {
  borderRadius: "0px 0px 10px 10px",
  backgroundImage: `url(${bottomBoxGraphic})`,
};
const centerCircleTop = {
  backgroundImage: `url(${centerCircleGraphic})`,
};
const centerCircleBottom = {
  backgroundImage: `url(${bottomCenterCircleGraphic})`,
};
const awayStyle = {
  backgroundImage: `url(${bib})`,
};
const homeStyle = {
  backgroundImage: `url(${shirt})`,
};

export default function TeamsPitchGraphic({
  team1,
  team2,
  onPlayerClick,
  small,
  showPlayerList = true,
}) {
  const { breakpoint } = useContext(AuthContext);

  const teamRows = (team, index) => {
    let rowCount = Math.ceil(Math.max(3, team.length / 3));
    let maxPlayersPerRow = 3;
    let def = [];
    let mid = [];
    let extra = [];
    let att = [];
    let rows = [];
    team.forEach((p) => {
      var player = (
        <div key={p.name} className="pitch-player">
          <div
            style={index === 0 ? homeStyle : awayStyle}
            className={`pitch-player-indicator`}
          ></div>
          <div className="pitch-player-name text-sm font-medium">{p.name}</div>
        </div>
      );
      if (
        def.length < maxPlayersPerRow &&
        (p.play_style < 0 ||
          (p.play_style === 0 &&
            mid.length >= maxPlayersPerRow &&
            def.length <= att.length))
      ) {
        def.push(player);
      } else if (
        mid.length < maxPlayersPerRow &&
        (p.play_style === 0 ||
          (p.play_style < 0 && def.length >= maxPlayersPerRow) ||
          (p.play_style > 0 && att.length >= maxPlayersPerRow))
      ) {
        mid.push(player);
      } else if (att.length < maxPlayersPerRow) {
        att.push(player);
      } else {
        extra.push(player);
      }
    });
    for (let i = 0; i < rowCount; i++) {
      rows.push(
        <div
          style={
            i == 0
              ? index === 1
                ? bottomGoalStyle
                : topGoalStyle
              : i === rowCount - 1
                ? index === 1
                  ? centerCircleBottom
                  : centerCircleTop
                : {}
          }
          key={`team${index + 1}_row${i}`}
          className={`pitch-row flex items-center justify-evenly ${
            rowCount > 2 ? "three" : ""
          } ${showPlayerList ? "show-player-list" : ""} ${
            i % 2 === 0
              ? index == 0
                ? "primary"
                : "secondary"
              : index == 0
                ? "secondary"
                : "primary"
          }`}
        >
          {i === 0
            ? def
            : i === 1
              ? mid
              : i == 2
                ? extra.length > 0
                  ? extra
                  : att
                : att}
        </div>,
      );
    }

    return rows;
  };

  return (
    <div className={"pitch-wrapper-wrapper rounded-xl py-1"}>
      {showPlayerList && (
        <div className="team-list flex flex-col pe-1 ps-2 text-end">
          <div className="team-list-name text-lg font-semibold">Shirts</div>
          {team1.map((p) => (
            <div
              key={`list_${p.name}`}
              className="team-list-player-name text-xs"
            >
              {p.name}
            </div>
          ))}
        </div>
      )}
      <div className={`pitch-new ${showPlayerList ? "show-player-list" : ""}`}>
        <div className="pitch-side top">{teamRows(team1, 0)}</div>
        <div className="pitch-side bottom">{teamRows(team2, 1)}</div>
      </div>
      {showPlayerList && (
        <div className="team-list flex flex-col-reverse pe-2 ps-1">
          <div className="team-list-name text-lg font-semibold">Bibs</div>
          {team2.map((p) => (
            <div
              key={`list_${p.name}`}
              className="team-list-player-name text-xs"
            >
              {p.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
