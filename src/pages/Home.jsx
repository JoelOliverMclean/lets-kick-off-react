import Registration from "../components/RegistrationForm";
import { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "../helpers/AuthContext";
import { register } from "../api/auth";
import { getMyGroups, postGroup } from "../api/groups";
import { Link, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import pitchBg from "../assets/pitch-bg.jpg";
import Login from "../components/LoginForm";
import LoginForm from "../components/LoginForm";
import ConfirmModal from "../components/ConfirmModal";
import MaintenanceScreen from "../components/MaintenanceScreen";

const Home = () => {
  return <MaintenanceScreen />;

  const { loggedInUser } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  async function loginUser(data) {
    var user = await login(data.username, data.password);
    setLoggedInUser(user);
    if (user) {
      navigate("/");
    }
  }

  const createGroup = () => {
    postGroup(null, newGroupName).then((result) => {
      if (result.error) {
      } else {
        setNewGroupName("");
        setShowDialog(false);
        fetchGroups();
      }
    });
  };

  const newGroupNameChanged = (e) => {
    setNewGroupName(e.target.value);
  };

  const showCreateNewGroupDialog = () => {
    setShowDialog(true);
  };

  const fetchGroups = () => {
    getMyGroups().then((groups) => {
      setGroups(groups);
      setLoadingGroups(false);
    });
  };

  useEffect(() => {
    if (loggedInUser) {
      setLoadingGroups(true);
      fetchGroups();
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
      className={`flex min-h-screen flex-1 flex-col items-center justify-start gap-5 p-4 sm:justify-center sm:p-4`}
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
              <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                {groups?.length > 0 ? (
                  groups.map((group, index) => (
                    <Link
                      to={{
                        pathname: `/group/${group.uuid}`,
                      }}
                      key={index}
                      className="rounded-lg border-2 border-solid border-green-500 bg-slate-900 p-3 text-center text-xl duration-200 hover:bg-slate-800"
                    >
                      {group.name}
                    </Link>
                  ))
                ) : (
                  <p className="pb-4 text-center text-xl text-gray-500">
                    No groups yet
                  </p>
                )}
                <div className="flex w-full justify-center">
                  <button
                    className="text-md rounded-md bg-green-600 px-2.5 py-1.5 font-semibold shadow-lg shadow-black"
                    onClick={() => showCreateNewGroupDialog()}
                  >
                    Create new group
                  </button>
                </div>
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
            <LoginForm loginUser={loginUser} />
            <div className="flex flex-col items-center pt-3">
              <Link
                to={"/register"}
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
      )}
      <ConfirmModal
        setShowDialog={setShowDialog}
        showDialog={showDialog}
        title={"Name your group"}
        body={
          <div className="p-2">
            <input
              defaultValue={newGroupName}
              onChange={newGroupNameChanged}
              className="rounded-md border-2 border-solid border-transparent px-2 py-1 text-lg duration-300 focus:border-green-500 focus:outline-none focus:ring-0"
            />
          </div>
        }
        acceptAction={createGroup}
        acceptButton={"Create"}
      />
    </div>
  );
};

export default Home;
