import React, { useContext, useState } from "react";
import $ from "jquery";
import { Tooltip } from "react-tooltip";
import { AuthContext } from "../helpers/AuthContext";
import { login } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const { setLoggedInUser } = useContext(AuthContext);

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

  return (
    <div className="flex flex-col p-4">
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
                <p className="px-2 pt-1 text-xs text-red-700">
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
                <p className="px-2 pt-1 text-xs text-red-700">
                  {errors.password}
                </p>
              )}
            </div>
          </div>
          <div className="px-1 pt-5 duration-200 hover:px-0">
            <button
              className="w-full rounded-md bg-green-500 px-2 py-1 font-semibold shadow-lg shadow-black"
              type="submit"
            >
              Login
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
