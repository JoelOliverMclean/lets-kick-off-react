import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getPlayerByName, postPlayer } from "../api/players";
import PlayerForm from "../components/PlayerForm";
import $ from "jquery";

export default function EditPlayer() {
  const { uuid, name } = useParams();

  const navigate = useNavigate();

  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
  });
  const [apiError, setApiError] = useState("");

  function handlePlayerForm(e) {
    e.preventDefault();
    var data = $(e.target)
      .serializeArray()
      .reduce((acc, curr) => ((acc[curr.name] = curr.value), acc), {});
    data = { ...data, goodInGoal: data.goodInGoal === "on" };

    var newErrors = { ...errors };

    if (data.name.length < 3) {
      newErrors.name = "Required field. Min 3 length.";
    } else {
      newErrors.name = "";
    }

    setErrors(newErrors);

    if (
      Object.keys(newErrors).filter((err) => newErrors[err].length > 0).length >
      0
    ) {
      return;
    }

    postPlayer(
      data.name,
      data.rating,
      data.playStyle,
      data.goodInGoal,
      uuid,
      player?.uuid,
    ).then(({ player, error }) => {
      if (player) {
        navigate(`/group/${uuid}/players/detail/${player.name}`);
      } else {
        console.log(error);
        setApiError(error);
      }
    });
  }

  useEffect(() => {
    setLoading(true);
    getPlayerByName(uuid, name).then((player) => {
      setPlayer(player);
      setLoading(false);
    });
  }, []);
  return (
    <>
      <div className="flex flex-col gap-4 px-4 sm:items-start">
        <Link
          to={`/group/${uuid}/players`}
          className="text-sm font-semibold text-gray-500"
        >
          <i className="fa-solid fa-chevron-left"></i> {player?.name}
        </Link>
        <div>
          <h1 className="text-3xl">
            Edit<span className="font-semibold text-green-500">Player</span>
          </h1>
        </div>
        {player && (
          <PlayerForm
            player={player}
            handlePlayerForm={handlePlayerForm}
            errors={errors}
            apiError={apiError}
          />
        )}
      </div>
    </>
  );
}
