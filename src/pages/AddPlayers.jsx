import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getGroup } from "../api/groups";
import $, { error } from "jquery";
import { postPlayer } from "../api/players";
import PlayerForm from "../components/PlayerForm";

export default function AddPlayers() {
  const navigate = useNavigate();
  const { uuid } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
  });
  const [apiError, setApiError] = useState("");

  function clearForm() {
    $("#playerForm")[0].reset();
  }

  function handlePlayerForm(e) {
    e.preventDefault();
    const addAnother = e.nativeEvent.submitter.name === "another";
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
    ).then((player, error) => {
      if (player) {
        setApiError("");
        if (addAnother) {
          clearForm();
        } else {
          if (!location.key || location.key !== "default") {
            navigate(-1);
          } else {
            navigate(`/group/${uuid}/players`);
          }
        }
      } else {
        setApiError(error);
      }
    });
  }

  useEffect(() => {
    setLoading(true);
    getGroup(uuid).then((group) => {
      setGroup(group);
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h3
          onClick={() => navigate(`/group/${uuid}`)}
          className="cursor-pointer text-xl"
        >
          {group?.name}
        </h3>
        <h1 className="text-3xl">
          Add<span className="font-semibold text-green-500">Player</span>
        </h1>
      </div>
      <div className="flex">
        <PlayerForm
          handlePlayerForm={handlePlayerForm}
          errors={errors}
          apiError={apiError}
        />
      </div>
    </div>
  );
}
