import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import sharevideo from "../assets/share.mp4";
import logo from "../assets/logowhite.png";

import { client } from "../client";

const decodeJwtPayload = (token) => {
  const payload = token.split(".")[1];
  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const json = decodeURIComponent(
    atob(base64)
      .split("")
      .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
      .join("")
  );

  return JSON.parse(json);
};

const Login = () => {
  const navigate = useNavigate();
  const [loginError, setLoginError] = React.useState("");

  const responseGoogle = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setLoginError("Google sign in did not return a valid account.");
      return;
    }

    let profile;

    try {
      profile = decodeJwtPayload(credentialResponse.credential);
    } catch (error) {
      console.error("Failed to read Google profile", error);
      setLoginError("Could not read your Google account. Please try again.");
      return;
    }

    const user = {
      _id: profile.sub,
      _type: "user",
      userName: profile.name,
      name: profile.name,
      email: profile.email,
      image: profile.picture,
    };

    localStorage.setItem("user", JSON.stringify(user));

    try {
      await client.createIfNotExists({
        _id: user._id,
        _type: user._type,
        userName: user.userName,
        image: user.image,
      });
    } catch (error) {
      console.error("Failed to save user in Sanity", error);
      setLoginError("Google login worked, but backend user save failed.");
      return;
    }

    navigate("/");
  };

  return (
    <div className="login-page">
      <div className="login-media">

        <video
          src={sharevideo}
          loop
          controls={false}
          muted
          autoPlay
          className="login-video"
        />

        <div className="login-overlay">

          <div className="login-logo-wrap">
            <img className="login-logo" src={logo} alt="ShareMe logo" />
          </div>

          <div>
            <GoogleLogin
              onSuccess={responseGoogle}
              onError={() => {
                setLoginError("Google sign in failed. Please try again.");
              }}
            />
            {loginError && <p className="login-error">{loginError}</p>}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
