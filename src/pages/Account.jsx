import React, { useContext } from "react";
import { AuthContext } from "../helpers/AuthContext";
import { logout } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Account() {
  const { loggedInUser, setLoggedInUser } = useContext(AuthContext);

  const navigate = useNavigate();

  async function handleLogout() {
    logout().then((loggedOut) => {
      if (loggedOut) {
        setLoggedInUser(null);
        navigate("/");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-4xl">
        My<span className="font-semibold text-green-500">Account</span>
      </h1>
      <button
        onClick={handleLogout}
        className="rounded-lg border-2 border-solid border-green-500 bg-slate-900 p-3 text-xl hover:bg-slate-800"
      >
        Logout
      </button>
    </div>
  );
}
