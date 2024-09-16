import Registration from "../components/Registration";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../helpers/AuthContext";
import { register } from "../api/auth";
import { getMyGroups } from "../api/groups";
import { Link, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import pitchBg from "../assets/pitch-bg.jpg";

const Home = () => {
  const { loggedInUser } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const navigate = useNavigate();

  async function registerNewUser(userInfo) {
    var newUser = await register(
      userInfo.name,
      userInfo.username,
      userInfo.password,
      userInfo.groupName,
    );
    navigate(0);
  }

  useEffect(() => {
    if (loggedInUser) {
      setLoadingGroups(true);
      getMyGroups().then((groups) => {
        setGroups(groups);
        setLoadingGroups(false);
      });
    }
  }, [loggedInUser]);

  return (
    <div
      style={
        !loggedInUser
          ? {
              backgroundImage: `url(${pitchBg})`,
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
            }
          : {}
      }
      className={`flex flex-1 flex-col items-center justify-start gap-5 p-4 sm:justify-center sm:p-4`}
    >
      {loggedInUser ? (
        <div className="flex w-full flex-1 flex-col gap-4 duration-200">
          <h2 className="text-3xl">
            My<span className="font-semibold text-green-500">Groups</span>
          </h2>
          <div className="flex justify-center duration-200">
            {loadingGroups ? (
              <ClipLoader
                color="#f0f0f0"
                loading={loadingGroups}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            ) : (
              <div className="grid flex-1 grid-cols-1 sm:grid-cols-2">
                {groups.map((group, index) => (
                  <Link
                    to={{
                      pathname: `/group/${group.uuid}`,
                    }}
                    key={index}
                    className="rounded-lg border-2 border-solid border-green-500 bg-slate-900 p-3 text-center text-xl duration-200 hover:bg-slate-800"
                  >
                    {group.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <h2 className="text-3xl">
            My<span className="font-semibold text-green-500">Player</span>
          </h2>
          <div className="flex flex-col gap-2 rounded-lg border-2 border-solid border-green-500 bg-slate-900 p-3 text-xl duration-200 sm:self-start">
            <h3 className="text-center text-2xl font-semibold">
              {loggedInUser.name ?? loggedInUser.username}
            </h3>
            <hr />
            <p className="text-center opacity-50">Coming soon...</p>
          </div>
        </div>
      ) : (
        <div className="w-full p-6 sm:w-auto">
          <div
            id="getStarted"
            className="w-full rounded-xl bg-[#121212] bg-opacity-70 p-4 shadow-lg shadow-black backdrop-blur-sm sm:w-auto"
          >
            <div className="pb-3 text-7xl">
              <h1 className="">Lets</h1>
              <h1 className="font-semibold text-green-500">KickOff</h1>
            </div>
            <Registration registerNewUser={registerNewUser} />
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
      )}
    </div>
  );
};

export default Home;
