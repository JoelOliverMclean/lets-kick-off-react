import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import NoPage from "./pages/NoPage";
import { AuthContext } from "./helpers/AuthContext";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { getLoggedInUser } from "./api/auth";
import { getCsrfToken } from "./helpers/NetworkHelper";
import Group from "./pages/Group";
import Account from "./pages/Account";
import Login from "./pages/Login";

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    getCsrfToken();
    if (Cookies.get("loggedIn")) {
      getLoggedInUser().then((user) => {
        setLoggedInUser(user);
        if (user) {
          console.log("Logged in");
        } else {
          console.log("Logged out");
        }
      });
    }
  }, []);

  return (
    <div className="App">
      <AuthContext.Provider
        value={{
          loggedInUser,
          setLoggedInUser,
        }}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="/account" element={<Account />} />
              <Route path="/login" element={<Login />} />
              <Route path="/group/:uuid" element={<Group />} />
              <Route path="*" element={<NoPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthContext.Provider>
    </div>
  );
}

export default App;
