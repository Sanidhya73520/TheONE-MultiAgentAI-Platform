import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../utils/firebase.js";
import api from "../../utils/axios.js";
import { FcGoogle } from "react-icons/fc";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice.js";
import ChatArea from "../components/ChatArea.jsx";
import SideBar from "../components/SideBar.jsx";
import Artifact from "../components/Artifact.jsx";

function Home() {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (token) => {
    try {
      const { data } = await api.post("/api/auth/login", { token });
      dispatch(setUserData(data));
      setErrorMessage("");
    } catch (error) {
      console.error("Backend login error:", error);
      const serverMessage =
        error.response?.data?.message ||
        (error.code === "ERR_NETWORK"
          ? "Cannot connect to server. Please ensure the backend is running."
          : error.message) ||
        "Login verification failed.";
      setErrorMessage(serverMessage);
    }
  };

  const googleLogin = async () => {
    try {
      setErrorMessage("");
      setIsLoading(true);
      const data = await signInWithPopup(auth, googleProvider);
      const token = await data.user.getIdToken();
      await handleLogin(token);
    } catch (error) {
      console.error("Firebase Google login error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        setErrorMessage("Sign-in window closed before completing.");
      } else if (error.code === "auth/popup-blocked") {
        setErrorMessage("Pop-up was blocked by your browser. Please allow popups for this site.");
      } else if (error.code === "auth/unauthorized-domain") {
        setErrorMessage("This domain is not authorized in Firebase Console (Authentication > Settings > Authorized domains).");
      } else {
        setErrorMessage(error.message || "Failed to sign in with Google.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-[#0d0f14] text-white overflow-hidden">
      <SideBar />
      <ChatArea />
      <Artifact />

      {!userData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur">
          <div className="w-85 bg-[#13151c] border border-white/8 rounded-2xl p-7 flex flex-col gap-5">
            <div className="flex flex-col gap-1 text-center">
              <h2 className="text-[17px] font-semibold text-slate-100 tracking-tight">
                Welcome to The ONE
              </h2>
              <p className="text-[13px] text-slate-500">
                Please login to continue using the app
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center leading-relaxed">
                {errorMessage}
              </div>
            )}

            <button
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-3 py-2.75 rounded-xl text-sm font-medium text-black/90 bg-white hover:bg-gray-200 transition-all duration-150 ${
                isLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
              }`}
              onClick={googleLogin}
            >
              {!isLoading && <FcGoogle size={18} />}
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                  <span>Signing in...</span>
                </div>
              ) : (
                <span>Continue with Google</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;