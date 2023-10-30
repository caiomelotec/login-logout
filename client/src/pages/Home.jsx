import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const navigate = useNavigate();

  const [auth, setAuth] = useState(false);

  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        const response = await axios.get("http://localhost:8080/", {
          withCredentials: true,
        });
        if (response.data.message === "success") {
          setAuth(true);
        } else {
          setAuth(false);
        }
      } catch (e) {
        console.log(e);
      }
    };

    fetchAuthData();
  }, []);

  const logout = async () => {
    try {
      axios.post("http://localhost:8080/logout", null, {
        withCredentials: true,
      });
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="home-container">
      {auth ? (
        <div>
          <h3 className="hello-msg">Hello Welcome</h3>
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      ) : (
        <div>
          <h3 className="hello-msg">Try to login in</h3>
          <button className="standart-btn" onClick={() => navigate("login")}>
            Login in
          </button>
        </div>
      )}
    </div>
  );
};
