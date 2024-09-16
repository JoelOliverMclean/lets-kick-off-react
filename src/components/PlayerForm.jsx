import React from "react";

export default function PlayerForm(props) {
  const { handlePlayerForm, errors, apiError, player, adding } = props;
  return (
    <form
      id="playerForm"
      className="w-full sm:w-1/2 lg:w-1/4"
      onSubmit={handlePlayerForm}
    >
      <div className="flex flex-col gap-5 text-xl">
        <div className="grid w-full grid-cols-1 gap-4">
          <div className="flex flex-col">
            <label className="p-1 opacity-80 duration-300">Name</label>
            <input
              defaultValue={player?.name ?? ""}
              name="name"
              className="rounded-md border-2 border-solid border-transparent px-2 py-1 text-lg duration-300 focus:border-green-500 focus:outline-none focus:ring-0"
            />
            {errors.name.length > 0 && (
              <p className="px-2 pt-1 text-xs text-orange-400">{errors.name}</p>
            )}
          </div>
          <div className="flex">
            <div className="flex w-1/4 flex-col pe-1">
              <label className="p-1 opacity-80 duration-300">Rating</label>
              <select
                name="rating"
                defaultValue={player?.rating ?? 5}
                className="rounded-md border-2 border-solid border-transparent px-2 py-1 text-lg duration-300 focus:border-green-500 focus:outline-none focus:ring-0"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                  <option value={rating} key={rating}>
                    {rating}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex w-3/4 flex-col ps-1">
              <label className="p-1 opacity-80 duration-300">Play Style</label>
              <select
                name="playStyle"
                defaultValue={player?.play_style ?? 0}
                className="rounded-md border-2 border-solid border-transparent px-2 py-1 text-lg duration-300 focus:border-green-500 focus:outline-none focus:ring-0"
              >
                {[
                  "Deep Defender",
                  "Defensive",
                  "Mixed",
                  "Attacking",
                  "Goal Scorer",
                ].map((playStyle, index) => (
                  <option value={index - 2} key={index}>
                    {playStyle}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col">
            <label className="p-1 opacity-80 duration-300">Good in goal?</label>
            <label className="switch">
              <input
                type="checkbox"
                name="goodInGoal"
                defaultChecked={player?.good_in_goal === true}
              />
              <span className="slider rounded-md before:rounded-md"></span>
            </label>
          </div>
        </div>
        <p className="text-center text-base text-orange-400">{apiError}</p>
        {adding ? (
          <>
            <div className="px-1 duration-200 hover:px-0">
              <button
                className="w-full rounded-md bg-green-600 px-2 py-1 font-semibold shadow-lg shadow-black"
                type="submit"
                name="another"
              >
                Save & Add Another
              </button>
            </div>
            <div className="px-1 duration-200 hover:px-0">
              <button
                className="w-full rounded-md bg-green-600 px-2 py-1 font-semibold shadow-lg shadow-black"
                type="submit"
                name="finished"
              >
                Save & Exit
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="px-1 duration-200 hover:px-0">
              <button
                className="w-full rounded-md bg-green-600 px-2 py-1 font-semibold shadow-lg shadow-black"
                type="submit"
                name="save"
              >
                Save Changes
              </button>
            </div>
          </>
        )}
      </div>
    </form>
  );
}
