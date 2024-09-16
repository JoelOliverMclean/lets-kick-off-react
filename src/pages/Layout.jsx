import { useContext } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";

const Layout = () => {
  const { loggedInUser } = useContext(AuthContext);
  const location = useLocation();

  return (
    <>
      <div className="">
        {(loggedInUser ||
          (location.pathname !== "/" && location.pathname !== "/login")) && (
          <div className="sticky top-0">
            <div className="flex items-start justify-between bg-gradient-to-b from-slate-800 to-[#121212] p-4">
              <Link to="/" className="flex flex-col">
                <h1 className="text-3xl text-white">Lets</h1>
                <h1 className="text-4xl font-bold text-green-500">KickOff</h1>
              </Link>
              {loggedInUser && location.pathname !== "/account" && (
                <Link
                  to={"/account"}
                  className="flex h-[64px] w-[64px] flex-col items-center justify-center rounded-full"
                >
                  <img
                    className="w-[48px] rounded-full duration-200 hover:w-[58px]"
                    src="https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
                    alt="Profile Image"
                  />
                </Link>
              )}
            </div>
          </div>
        )}
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
