import React, { useContext, useEffect, useState } from "react";
import $ from "jquery";
import { Tooltip } from "react-tooltip";
import { AuthContext } from "../helpers/AuthContext";
import { register } from "../api/auth";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import pitchBg from "../assets/pitch-bg.jpg";
import RegistrationForm from "../components/RegistrationForm";

export default function Registration() {
  const navigate = useNavigate();

  async function registerNewUser(userInfo) {
    await register(
      userInfo.name,
      userInfo.username,
      userInfo.password,
      userInfo.groupName,
    );
    navigate(0);
  }

  useEffect(() => {
    if (Cookies.get("loggedIn")) {
      navigate("/");
    }
  }, []);

  return (
    <div
      className="flex min-h-screen flex-1 flex-col items-center justify-start gap-5 p-10 sm:justify-center sm:p-4"
      style={{
        backgroundImage: `url(${pitchBg})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div
        id="getStarted"
        className="w-full rounded-xl bg-[#121212] bg-opacity-70 p-4 shadow-lg shadow-black backdrop-blur-sm sm:w-auto"
      >
        <div className="pb-3 text-7xl">
          <h1 className="">Lets</h1>
          <h1 className="font-semibold text-green-500">KickOff</h1>
        </div>
        <RegistrationForm registerNewUser={registerNewUser} />
        <div className="flex flex-col items-center pt-3">
          <Link
            to={"/login"}
            className="underline-offset-3 p-2 text-base hover:underline"
          >
            Already registered?{" "}
            <span className="font-semibold text-green-500 hover:underline">
              Login
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
