import Registration from "../components/Registration";
import { useContext } from "react";
import { AuthContext } from "../helpers/AuthContext";
import { helloWorld, register } from "../api/auth";

const Home = () => {
  const { loggedInUser } = useContext(AuthContext);

  async function registerNewUser(userInfo) {
    // var newUser = register(
    //   userInfo.name,
    //   userInfo.username,
    //   userInfo.password,
    //   userInfo.groupName,
    // );
    helloWorld();
  }

  return (
    <div
      id="getStarted"
      className="flex flex-1 flex-col items-center justify-center gap-5"
    >
      {loggedInUser ? (
        <></>
      ) : (
        <>
          <div className="text-7xl">
            <h1 className="">Lets</h1>
            <h1 className="font-semibold text-green-500">KickOff</h1>
          </div>
          <Registration registerNewUser={registerNewUser} />
        </>
      )}
    </div>
  );
};

export default Home;
