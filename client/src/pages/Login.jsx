import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export const Login = () => {
  const navigate = useNavigate();

  const [login, setLogin] = useState({
    username: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState(""); // State variable for error message

  const handleInputChange = (e) => {
    setLogin((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // axios.defaults.withCredentials = true;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/login", login, {
        withCredentials: true,
      });
      navigate("/");
      console.log("User logged in");
    } catch (error) {
      setErrorMessage(error.response.data);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register">
        <div className="filter-div"></div>
        <form className="register-form" onSubmit={handleSubmit}>
          <h1>Login</h1>
          <input
            type="text"
            name="username"
            id="username"
            className="username-input"
            placeholder="Username"
            onChange={handleInputChange}
          />

          <input
            type="password"
            name="password"
            id="password"
            className="password-input"
            placeholder="Password"
            onChange={handleInputChange}
            autoComplete="false"
          />
          <button type="submit" className="standart-btn">
            Login
          </button>
          <Link
            style={{
              color: "white",
              textDecoration: "none",
              marginTop: "1rem",
            }}
            to={"/register"}
          >
            Create an account
          </Link>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </form>
      </div>
    </div>
  );
};
