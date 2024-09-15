import Registration from "../components/Registration";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../helpers/AuthContext";
import { helloWorld, register } from "../api/auth";
import { getMyGroups } from "../api/groups";
import { Link } from "react-router-dom";
import { ClipLoader } from "react-spinners";

const Home = () => {
  const { loggedInUser } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  async function registerNewUser(userInfo) {
    var newUser = await register(
      userInfo.name,
      userInfo.username,
      userInfo.password,
      userInfo.groupName,
    );
    console.log(newUser);
  }

  useEffect(() => {
    setLoadingGroups(true);
    getMyGroups().then((groups) => {
      setGroups(groups);
      setLoadingGroups(false);
    });
  }, [loggedInUser]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5">
      {loggedInUser ? (
        <>
          <div className="flex w-full flex-1 flex-col gap-4 p-4 duration-200">
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
        </>
      ) : (
        <div id="getStarted">
          <div className="text-7xl">
            <h1 className="">Lets</h1>
            <h1 className="font-semibold text-green-500">KickOff</h1>
          </div>
          <Registration registerNewUser={registerNewUser} />
        </div>
      )}
    </div>
  );
};

export default Home;
