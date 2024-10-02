import React, { useContext, useEffect, useState } from "react";
import $ from "jquery";
import { Tooltip } from "react-tooltip";
import { AuthContext } from "../helpers/AuthContext";
import { login } from "../api/auth";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import pitchBg from "../assets/pitch-bg.jpg";

export default function Login() {
  const navigate = useNavigate();

  const { setLoggedInUser, loggedInUser } = useContext(AuthContext);

  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  async function loginUser(data) {
    var user = await login(data.username, data.password);
    setLoggedInUser(user);
    if (user) {
      navigate("/");
    }
  }

  function validateForm(e) {
    e.preventDefault();
    const data = $(e.target)
      .serializeArray()
      .reduce((acc, curr) => ((acc[curr.name] = curr.value), acc), {});

    var newErrors = { ...errors };

    if (data.username.trim().length < 1) {
      newErrors.username = "Username required.";
    } else {
      newErrors.username = "";
    }

    if (data.password.trim().length < 1) {
      newErrors.password = "Password required.";
    } else {
      newErrors.password = "";
    }

    setErrors(newErrors);

    const errorCount = Object.keys(newErrors).filter(
      (key) => newErrors[key].length > 0,
    ).length;

    if (errorCount === 0) {
      loginUser(data);
    }
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
        <form className="" onSubmit={validateForm}>
          <div className="flex flex-col gap-5 text-xl">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col">
                <label className="p-1 opacity-80 duration-300">Username</label>
                <input
                  name="username"
                  className="rounded-md border-2 border-solid border-transparent px-2 py-1 text-lg duration-300 focus:border-green-500 focus:outline-none focus:ring-0"
                />
                {errors.username.length > 0 && (
                  <p className="px-2 pt-1 text-xs text-orange-400">
                    {errors.username}
                  </p>
                )}
              </div>
              <div className="flex flex-col">
                <label className="p-1 opacity-80 duration-300">
                  Password
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="ms-3 cursor-pointer text-base"
                  >
                    {showPassword ? (
                      <i className="fa-solid fa-eye"></i>
                    ) : (
                      <i className="fa-solid fa-eye-slash"></i>
                    )}
                  </span>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="rounded-md border-2 border-solid border-transparent px-2 py-1 text-lg duration-300 focus:border-green-500 focus:outline-none focus:ring-0"
                />
                {errors.password.length > 0 && (
                  <p className="px-2 pt-1 text-xs text-orange-400">
                    {errors.password}asds
                  </p>
                )}
              </div>
            </div>
            <div className="px-1 pt-2 duration-200 hover:px-0">
              <button
                className="w-full rounded-md bg-green-500 px-2 py-1 font-semibold shadow-lg shadow-black"
                type="submit"
              >
                Login
              </button>
            </div>
          </div>
        </form>
        <div className="flex flex-col items-center pt-3">
          <Link
            to={"/"}
            className="underline-offset-3 p-2 text-base hover:underline"
          >
            No account?{" "}
            <span className="font-semibold text-green-500 hover:underline">
              Sign up here
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
