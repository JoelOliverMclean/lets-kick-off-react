import React from "react";
import LoginForm from "./LoginForm";
import { Link } from "react-router-dom";
import pitchBg from "../assets/pitch-bg.jpg";

function MaintenanceScreen() {
  return (
    <div
      style={{
        backgroundImage: `url(${pitchBg})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
      className={`flex min-h-screen flex-1 flex-col items-center justify-start gap-5 p-4 sm:justify-center sm:p-4`}
    >
      <div
        id="getStarted"
        className="w-full rounded-xl bg-[#121212] bg-opacity-70 p-4 shadow-lg shadow-black backdrop-blur-sm sm:w-auto"
      >
        <div className="pb-3 text-7xl">
          <h1 className="">Lets</h1>
          <h1 className="font-semibold text-green-500">KickOff</h1>
        </div>
        <div className="flex flex-col gap-5 rounded-lg bg-yellow-400 p-4 text-center text-xl text-black">
          <h1 className="text-3xl font-bold">Service unavailable</h1>
          <p className="text-2xl">Currently undergoing maintenance</p>
          <p className="text-2xl">Estimated restoration time:</p>
          <div>
            <p className="text-2xl">9th March 2025</p>
            <p className="text-2xl">12:00am</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MaintenanceScreen;
