import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getGroup } from "../api/groups";
import { ClipLoader } from "react-spinners";

export default function Group() {
  const { uuid } = useParams();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(false);

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
          <Link to={`/`} className="text-sm font-semibold text-gray-500">
            <i className="fa-solid fa-chevron-left"></i> Home
          </Link>
          <div>
            <h2 className="text-xl">Group</h2>
            <h2 className="text-3xl font-semibold text-green-500">
              {group?.name}
            </h2>
          </div>
          {group?.players?.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              <Link
                to={"team-picker"}
                className="rounded-lg border-2 border-solid border-green-500 bg-slate-900 py-3 text-center text-xl hover:bg-slate-800"
              >
                Team Picker
              </Link>
              <Link
                to={"players"}
                className="rounded-lg border-2 border-solid border-green-500 bg-slate-900 py-3 text-center text-xl hover:bg-slate-800"
              >
                Players
              </Link>
              {/* <Link className="rounded-lg border-2 border-solid border-green-500 bg-slate-900 py-3 text-center text-xl hover:bg-slate-800">
                Matches
              </Link> */}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <p>Your group needs players</p>
              <Link
                to={"players/add"}
                className="w-full rounded-lg border-2 border-solid border-green-500 bg-slate-900 p-3 text-center text-xl hover:bg-slate-800 sm:w-auto"
              >
                Add Players
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
