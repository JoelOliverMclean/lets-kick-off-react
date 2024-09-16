import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getGroup } from "../api/groups";
import { ClipLoader } from "react-spinners";

export default function Players() {
  const navigate = useNavigate();
  const { uuid } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getGroup(uuid).then((group) => {
      setGroup({
        ...group,
        players: group.players.sort((a, b) =>
          String(a.name).localeCompare(b.name),
        ),
      });
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col gap-4 px-4">
      <Link
        to={`/group/${uuid}`}
        className="text-sm font-semibold text-gray-500"
      >
        <i className="fa-solid fa-chevron-left"></i> {group?.name}
      </Link>
      <div>
        <h3 className="text-xl">{group?.name}</h3>
        <h1 className="text-3xl">
          <span className="font-semibold text-green-500">Players</span>
        </h1>
      </div>
      {group?.players?.length > 0 ? (
        <div className="grid grid-cols-1 gap-2">
          {group?.players?.map((player, index) => (
            <Link
              to={"detail/" + player.name}
              key={index}
              className="flex flex-col rounded-md border-2 border-solid border-green-500 bg-slate-900 p-3"
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{player.name}</h3>
                  <p>{player.play_style_desc}</p>
                </div>
                <div className="flex gap-2">
                  {player.good_in_goal && (
                    <h2
                      className={
                        "flex h-[32px] w-[32px] items-center justify-center rounded-lg text-center text-xl font-semibold shadow-md shadow-black " +
                        `rating-10`
                      }
                    >
                      <i className="fa-solid fa-hands"></i>
                    </h2>
                  )}
                  <h2
                    className={
                      "flex h-[32px] w-[32px] items-center justify-center rounded-lg text-center text-xl font-semibold shadow-md shadow-black " +
                      `rating-${player.rating}`
                    }
                  >
                    {player.rating}
                  </h2>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : loading ? (
        <div className="text-center">
          <ClipLoader
            color="#f0f0f0"
            loading={loading}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <p>Your group needs players</p>
        </div>
      )}
      <div className="sticky bottom-0 flex justify-center p-2">
        <Link
          to={"add"}
          className="rounded-md bg-green-600 px-4 py-2 text-xl shadow-lg shadow-black"
        >
          Add Players
        </Link>
      </div>
    </div>
  );
}
