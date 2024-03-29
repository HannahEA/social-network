import React, { useEffect, useState } from "react";
import { TopNavigation, ThemeIcon } from "./TopNavigation.jsx";
import { Link } from "react-router-dom";
// import { FaMoon, FaSun } from "react-icons/fa";

const Home = () => {

const handleLearn = ( )=> {
  let medal = document.getElementById("learn-more");
  medal.classList.contains("Learn") == true ? medal.classList.remove("Learn") : medal.classList.add("Learn");
};


  return (
    <div className=" dark:bg-gray-900 dark:text-white ">
      <div className="content-container flex justify-center items-center">
        <TopNavigation />
      </div>
      <div className=" dark:bg-gray-900 dark:text-[#e7e7e7] desc title text-center text-4xl font-[800] leading-none text-[#8CC0DE] sm:text-6xl nav flex h-28 w-full items-center justify-center bg-white px-8">
       Social Network
      </div>
      <div className="call-to-action flex h-96 w-full items-center justify-center gap-28 px-10 overflow-clip">
        <img src="https://jguleserian.github.io/FMC-MeetLandingPage/assets/desktop/image-hero-left.png" style={{zIndex:100}} className="" alt="" />
        <div className="flex min-w-[360px] max-w-[560px] max-h-[600px] flex-col justify-center gap-6 px-12 sm:px-0">
          <div className=" dark:bg-gray-900 dark:text-[#e7e7e7] title text-center text-4xl font-[600] leading-none text-[#F0997D] sm:text-5xl">
            The New Way to Connect
          </div>
          <div className=" dark:bg-gray-900 dark:text-white desc text-center text-[#87879D]">
            Connect with friends and build relationships with Social-Network. Join our vibrant community and stay connected virtually.
          </div>
          <div className="btn-wrap flex w-full items-center justify-center gap-3 font-bold text-[#87879D]">
            <Link to="/register" className="rounded-3xl bg-[#f8b99a] hover:bg-red-400 px-4 py-2.5 sm:px-6 sm:py-3.5 text-sm sm:text-md shadow-lg">
              Get Started
            </Link>
            <button type="button" data-dropdown-toggle="apps-dropdown"
             className="rounded-3xl bg-[#FFEECC] hover:bg-[#f8d897] px-4 py-2.5 sm:px-6 sm:py-3.5 text-sm sm:text-md shadow-lg"
             onClick={handleLearn}
             >
             Learn More
             </button>
          </div>
          <div
              className="hidden text-base list-none bg-white rounded divide-gray-100 shadow-lg dark:bg-gray-700 dark:divide-gray-600"
              id="learn-more"
              style={{top:450+"px", height:220+"px", width: 560+"px", zIndex:1000, position:"absolute"}}
            >
              <div className="block py-2 px-4 text-base font-medium text-center text-gray-600 bg-gray-100 dark:bg-gray-600 dark:text-white" 
              style={{width:560+"px"}}
              >
              Product Description
              </div>
              <div className="grid grid-cols-1 gap-1 p-1" style={{height:98+"px", width:560+"px"}}>
                <a href="#" className="block p-0.5 text-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 group">
                <svg
                    aria-hidden="true"
                    className="mx-auto mb-1 w-7 h-7 text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                    <path
                      fillRule="evenodd"
                      d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-sm text-gray-500 dark:text-white">
                  Facebook-like social network that features <br></br>
                      Followers,
                      Profile,
                      Posts,
                      Groups,
                      Notifications,
                      Chats
                  </div>
                </a>
                <a href="#" className="block py-0.5 text-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 group" style={{height:76+"px", width:560+"px", zIndex:1000}}>
                  <svg
                    aria-hidden="true"
                    className="mx-auto mb-1 w-7 h-7 text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  <div className="text-sm text-gray-500 dark:text-white" style={{height:52+"px", width:560+"px", zIndex:100 }}>
                  Created by <br></br>
                  Helena Sedmak & Hannah Alemu
                </div>
                </a>
              </div>
            </div>
        </div>
        <img src="https://jguleserian.github.io/FMC-MeetLandingPage/assets/desktop/image-hero-right.png" className="" alt="" />
      </div>
      <div className=" flex w-full flex-col items-center justify-center" style={{zIndex:50, height:40+"px"}}>
        <div className="line h-[35px] w-[1px] bg-[#87879D50]"></div>
        <div className="circle flex h-[40px] w-[40px] items-center justify-center self-center rounded-full border-2 border-[#87879D40] text-[#87879D]">
          01F
        </div>
      </div>
      <div className="flex w-full items-center justify-center overflow-hidden">
        <div className="gallery mt-10 flex gap-6 flex-col sm:flex-row sm:px-8 w-80vw overflow-y-auto">
          <img
            src="https://jguleserian.github.io/FMC-MeetLandingPage/assets/desktop/image-woman-in-videocall.jpg"
            className="max-w-[250px] rounded-xl"
            alt=""
          />
          <img
            src="https://jguleserian.github.io/FMC-MeetLandingPage/assets/desktop/image-man-texting.jpg"
            className="max-w-[250px] rounded-xl"
            alt=""
          />
          <img
            src="https://jguleserian.github.io/FMC-MeetLandingPage/assets/desktop/image-women-videochatting.jpg"
            className="max-w-[250px] rounded-xl"
            alt=""
          />
          <img
            src="https://jguleserian.github.io/FMC-MeetLandingPage/assets/desktop/image-men-in-meeting.jpg"
            className="max-w-[250px] rounded-xl"
            alt=""
          />
        </div>
      </div>
      <div className="mt-10 flex flex-col items-center justify-center">
        <h2 className="text-l mb-4 font-bold uppercase tracking-widest text-[#4D96A9]">built for social connections</h2>
        <h3 className="max-w-lg text-center text-3xl font-[800] leading-none text-[#29283e] dark:text-[#e7e7e7] px-6">
          Enhance Your Social Experience
        </h3>
        <p className="mt-6 max-w-2xl text-center text-[#87879D] dark:text-[#e7e7e7] px-6">
          Discover new people, share stories, and engage in meaningful conversations — all in one platform. Connect with like-minded
          individuals and expand your network.
        </p>
      </div>
      <div className="z-10 mt-16 flex w-full flex-col items-center justify-center">
        <div className="line h-[65px] w-[1px] bg-[#87879D50]"></div>
        <div className="circle flex h-[40px] w-[40px] items-center justify-center self-center rounded-full border-2 border-[#87879D40] bg-white dark:bg-gray-900 text-[#87879D]">
          02
        </div>
      </div>
      <div className="footer mt-[-22px] flex h-[300px] sm:h-[250px] w-full items-center justify-center gap-6 bg-[#4D96A9] dark:bg-[#4d97a980] flex-col px-8 sm:flex-row sm:gap-12">
        <h3 className="max-w-xs text-3xl font-[800] leading-none text-white text-center sm:text-start">
          Experience the Power of Community
        </h3>
        <p className="max-w-sm text-white text-center sm:text-start">
          Stay connected with your friends, join interest groups, and participate in engaging discussions and events.
        </p>
      </div>
    </div>
  );
};

export default Home;
