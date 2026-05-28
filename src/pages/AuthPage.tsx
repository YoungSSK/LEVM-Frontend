import { useState } from "react";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import logo from "@/assets/logo.png";
import googleLogo from "@/assets/google.svg";
import type { AuthTab } from "@/types/auth";

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState<AuthTab>("login");

  return (
    <div className="flex min-h-screen flex-col lg:flex-row w-full bg-[#131315] text-[#e5e1e4] overflow-x-hidden antialiased">
      <div className="relative hidden lg:flex lg:w-1/2 bg-[#09090b] items-center justify-center overflow-hidden border-r border-[#1d1d20]">
        <div className="absolute inset-0 z-0">
          <div
            className="particle w-32 h-32 top-[10%] left-[20%] animate-float"
            style={{ animationDelay: "0s" }}
          ></div>
          <div
            className="particle w-16 h-16 top-[60%] left-[10%] animate-float"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="particle w-48 h-48 top-[70%] left-[70%] animate-float"
            style={{
              animationDelay: "2s",
              borderRadius: "0px",
              transform: "rotate(45deg)",
            }}
          ></div>
          <div
            className="particle w-24 h-24 top-[20%] right-[10%] animate-float"
            style={{ animationDelay: "1.5s", borderRadius: "4px" }}
          ></div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
          <img
            alt="LEWM Logo"
            className="w-48 h-48 mb-8 object-contain drop-shadow-2xl"
            src={logo}
          />
          <h1 className="text-4xl lg:text-5xl font-extrabold font-heading text-white mb-4 leading-tight">
            LEWM
            <br />
            <span className="text-primary bg-clip-text">
              Learn English With Me
            </span>
          </h1>
          <p className="text-base lg:text-lg text-[#cbc3d7] max-w-md">
            Một nền tảng thân thiện giúp bạn tiến bộ mỗi ngày và tự tin giao
            tiếp ngay từ những bước đầu tiên.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between items-center p-6 lg:p-10 lg:py-12 bg-[#131315] relative min-h-screen">
        <div className="absolute top-6 left-6 lg:hidden flex items-center gap-3">
          <img alt="Logo" className="w-8 h-8 object-contain" src={logo} />
          <span className="text-lg font-bold font-heading text-primary">
            LEWM
          </span>
        </div>

        <div className="w-full max-w-md bg-[#1c1b1d]/85 backdrop-blur-md border border-[#1d1d20] rounded-xl p-8 shadow-2xl relative z-10">
          <div className="mb-6">
            <div className="flex p-1 bg-[#0e0e10] rounded-lg border border-[#494454]/30">
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className={`flex-1 py-2 text-center text-xs font-semibold rounded-md transition-all duration-200 uppercase tracking-wider
                  ${
                    activeTab === "login"
                      ? "bg-[#353437] text-white shadow-sm"
                      : "text-[#cbc3d7] hover:text-white"
                  }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("register")}
                className={`flex-1 py-2 text-center text-xs font-semibold rounded-md transition-all duration-200 uppercase tracking-wider
                  ${
                    activeTab === "register"
                      ? "bg-[#353437] text-white shadow-sm"
                      : "text-[#cbc3d7] hover:text-white"
                  }`}
              >
                Register
              </button>
            </div>
          </div>

          {activeTab === "login" ? (
            <LoginForm />
          ) : (
            <RegisterForm onSuccess={() => setActiveTab("login")} />
          )}

          <div className="mt-6">
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-[#494454]/30"></div>
              <span className="flex-shrink-0 mx-4 text-[#cbc3d7] font-mono text-[11px] uppercase tracking-widest">
                OR
              </span>
              <div className="flex-grow border-t border-[#494454]/30"></div>
            </div>

            <button className="w-full flex items-center justify-center gap-3 bg-[#2a2a2c] border border-[#494454]/50 hover:bg-[#353437] text-white py-3 rounded-lg text-sm font-semibold transition-all btn-3d-secondary border-b-[#0e0e10] mt-4">
              <img alt="Google Logo" className="w-5 h-5" src={googleLogo} />
              Continue with Google
            </button>
          </div>
        </div>

        <div className="w-full text-center hidden lg:block opacity-50 hover:opacity-100 transition-opacity pt-4">
          <p className="font-mono text-[11px] text-[#cbc3d7]">
            Copyright 2024 EnglishPro.{" "}
            <a className="hover:text-primary transition-colors" href="#">
              Terms
            </a>{" "}
            {" | "}{" "}
            <a className="hover:text-primary transition-colors" href="#">
              Privacy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
