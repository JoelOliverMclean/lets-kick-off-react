import React, { useState } from "react";
import $ from "jquery";
import { Tooltip } from "react-tooltip";

export default function Registration(props) {
  const { registerNewUser } = props;

  const [errors, setErrors] = useState({
    name: "",
    username: "",
    password: "",
    groupName: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  function validateForm(e) {
    e.preventDefault();
    const data = $(e.target)
      .serializeArray()
      .reduce((acc, curr) => ((acc[curr.name] = curr.value), acc), {});

    var newErrors = { ...errors };

    if (data.name.trim().length < 3) {
      newErrors.name = "Name required. Min length 3.";
    } else {
      newErrors.name = "";
    }

    if (data.username.trim().length < 3) {
      newErrors.username = "Username required. Min length 3.";
    } else {
      newErrors.username = "";
    }

    if (data.password.trim().length < 3) {
      newErrors.password = "Password required. Min length 3.";
    } else {
      newErrors.password = "";
    }

    if (data.groupName.trim().length > 0 && data.groupName.trim().length < 3) {
      newErrors.groupName = "Min length 3.";
    } else {
      newErrors.groupName = "";
    }

    setErrors(newErrors);

    const errorCount = Object.keys(newErrors).filter(
      (key) => newErrors[key].length > 0,
    ).length;

    if (errorCount === 0) {
      registerNewUser(data);
    }
  }

  return (
    <form className="" onSubmit={validateForm}>
      <div className="flex flex-col gap-5 text-xl">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col">
            <label className="p-1 opacity-80 duration-300">Name</label>
            <input
              name="name"
              className="rounded-md border-2 border-solid border-transparent px-2 py-1 text-lg duration-300 focus:border-green-500 focus:outline-none focus:ring-0"
            />
            {errors.name.length > 0 && (
              <p className="px-2 pt-1 text-xs text-red-700">{errors.name}</p>
            )}
          </div>
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
          <div className="flex flex-col">
            <label className="p-1 opacity-80 duration-300">
              Group Name{" "}
              <span className="my-anchor-element text-base opacity-50">
                (optional)
              </span>
              {/* <Tooltip anchorSelect=".my-anchor-element" place="bottom">
                Group Owners: Enter name of group you run
              </Tooltip> */}
            </label>
            <input
              name="groupName"
              className="rounded-md border-2 border-solid border-transparent px-2 py-1 text-lg duration-300 focus:border-green-500 focus:outline-none focus:ring-0"
            />
            {errors.groupName.length > 0 && (
              <p className="px-2 pt-1 text-xs text-red-700">
                {errors.groupName}
              </p>
            )}
          </div>
        </div>
        <div className="px-1 pt-5 duration-200 hover:px-0">
          <button
            className="w-full rounded-md bg-green-500 px-2 py-1 font-semibold shadow-lg shadow-black"
            type="submit"
          >
            Get Started
          </button>
        </div>
      </div>
    </form>
  );
}
