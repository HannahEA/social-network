import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <div className="nav flex h-28 w-full items-center justify-center bg-white px-8">
        <img src="https://jguleserian.github.io/FMC-MeetLandingPage/assets/logo.svg" alt="" />
      </div>
      <div className="call-to-action flex h-96 w-full items-center justify-center gap-28 px-10">
        <img src="https://jguleserian.github.io/FMC-MeetLandingPage/assets/desktop/image-hero-left.png" className="w-" alt="" />
        <div className="flex min-w-[360px] flex-col justify-center gap-4 px-12 sm:px-0">
          <div className="title text-center text-4xl font-[800] leading-none text-[#29283e] sm:text-5xl">The New Way to Connect</div>
          <div className="desc text-center text-[#87879D]">
            Connect with friends and build relationships with Social-Network. Join our vibrant community and stay connected virtually.
          </div>
          <div className="btn-wrap flex w-full items-center justify-center gap-3 font-bold text-white">
            <Link to="/registration" className="rounded-3xl bg-[#4D96A9] px-4 py-2.5 sm:px-6 sm:py-3.5 text-sm sm:text-md">
              Get Started
            </Link>
            <button className="rounded-3xl bg-[#855FB1] px-4 py-2.5 sm:px-6 sm:py-3.5 text-sm sm:text-md">Learn More</button>
          </div>
        </div>
        <img src="https://jguleserian.github.io/FMC-MeetLandingPage/assets/desktop/image-hero-right.png" alt="" />
      </div>
      <div className="flex w-full flex-col items-center justify-center">
        <div className="line h-[75px] w-[1px] bg-[#87879D50]"></div>
        <div className="circle flex h-[40px] w-[40px] items-center justify-center self-center rounded-full border-2 border-[#87879D40] text-[#87879D]">
          01
        </div>
      </div>
      <div className="flex w-full items-center justify-center">
        <div className="gallery mt-24 flex gap-6 flex-col sm:flex-row sm:px-8">
          <img
            src="https://jguleserian.github.io/FMC-MeetLandingPage/assets/desktop/image-woman-in-videocall.jpg"
            className="w-[250px] rounded-xl"
            alt=""
          />
          <img
            src="https://jguleserian.github.io/FMC-MeetLandingPage/assets/desktop/image-women-videochatting.jpg"
            className="w-[250px] rounded-xl"
            alt=""
          />
          <img
            src="https://jguleserian.github.io/FMC-MeetLandingPage/assets/desktop/image-men-in-meeting.jpg"
            className="w-[250px] rounded-xl"
            alt=""
          />
          <img
            src="https://jguleserian.github.io/FMC-MeetLandingPage/assets/desktop/image-man-texting.jpg"
            className="w-[250px] rounded-xl"
            alt=""
          />
        </div>
      </div>
      <div className="mt-24 flex flex-col items-center justify-center">
        <h2 className="text-l mb-4 font-bold uppercase tracking-widest text-[#4D96A9]">built for social connections</h2>
        <h3 className="max-w-sm text-center text-3xl font-[800] leading-none text-[#29283e] px-6">Enhance Your Social Experience</h3>
        <p className="mt-6 max-w-lg text-center text-[#87879D] px-6">
          Discover new people, share stories, and engage in meaningful conversations — all in one platform. Connect with like-minded
          individuals and expand your network.
        </p>
      </div>
      <div className="z-10 mt-24 flex w-full flex-col items-center justify-center">
        <div className="line h-[75px] w-[1px] bg-[#87879D50]"></div>
        <div className="circle flex h-[45px] w-[45px] items-center justify-center self-center rounded-full border-2 border-[#87879D40] bg-white text-[#87879D]">
          02
        </div>
      </div>
      <div className="footer mt-[-22px] flex h-[300px] sm:h-[250px] w-full items-center justify-center gap-6 bg-[#4D96A9] flex-col px-8 sm:flex-row sm:gap-12">
        <h3 className="max-w-xs text-3xl font-[800] leading-none text-white text-center sm:text-start">
          Experience the Power of Community
        </h3>
        <p className="max-w-sm text-white text-center sm:text-start">
          Stay connected with your friends, join interest groups, and participate in engaging discussions and events.
        </p>
        <Link to="/registration" className="rounded-3xl bg-[#855FB1] px-4 py-2.5 sm:px-6 sm:py-3.5 text-sm sm:text-md font-bold text-white">
          Login
        </Link>
      </div>
    </div>
  );
};

export default Home;
