import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {TopNavigation, ThemeIcon} from './TopNavigation.jsx';
import { Notyf } from "notyf";
import "notyf/notyf.min.css";

const notyf = new Notyf(); // Create a single instance of Notyf

// environment variable from the docker-compose.yml file. 
//This variable will contain the URL of your backend service, 
//allowing your frontend code to make requests to the correct endpoint.
 const apiURL = process.env.REACT_APP_API_URL;
//const apiURL = "http://localhost:8000"

console.log({apiURL})

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check the cookie value on page load
    checkCookie();
  }, []);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleLogin = (event) => {
    event.preventDefault(); // Prevent default form submission

    // Create an object with the form data
    const formData = {
      email: email,
      password: password,
    };


    // Make a POST request to the server
    const data = fetch(`${apiURL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
      credentials: 'include',
    })
      .then((response) => {console.log(response); return response.json()})
      .then((data) => {
        // Check if the login was successful
        if (data.message === "Login successful") {
         

          // Display a success notification
          notyf.success("Login successful");
          return data
          // Check the cookie value
          
        } else if (data.message === "Login unsuccessful") {
          notyf.error("Incorrect email or password");
          return data
        }
       })//.then((data)=> {
      //   console.log("data2:",data.userAvatar)

      // })
      .catch((error) => {
        // Handle any errors
        console.error("Error:", error);
        console.log("Error:", error);
      });
       (async () =>{
         const dataObj = await data
           
           checkCookie(dataObj);

       })()
  };

  const checkCookie = (dataObj) => {
     fetch(`${apiURL}/checkCookie`,{credentials: 'include',})
    .then((response) => response.json())
    .then((data) => {
      // Handle the response from the server
      console.log("Cookie check:", data);

      // Redirect to the feed page if the cookie is found
      if (data.message === "Cookie is found") {
        console.log("Cookie is found, redirecting to feed");


        console.log("from inside /checkCookie dataObj:===>",dataObj.offlineFollowNotif)
    

          
       
        navigate(`/feed`, { state: { email: email, avatar:dataObj.userAvatar, userInfo: dataObj.userInfo} });
        
      
      } else {
        return ""
        // console.log("Cookie is not found, redirecting to home");
        // navigate("/");
      }
    })
    .catch((error) => {
      // Handle any errors
      console.error("Error:", error);
    });
   
     
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
    <div className='content-container'>
    <TopNavigation />
    </div>
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <Link to="/" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
          <img className="w-8 h-8 mr-2" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo" />
          Social-Network
        </Link>
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Sign in to your account
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Your email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="name@company.com"
                  value={email}
                  onChange={handleEmailChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="remember"
                      aria-describedby="remember"
                      type="checkbox"
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="remember" className="text-gray-500 dark:text-gray-300">
                      Remember me
                    </label>
                  </div>
                </div>
                <a href="#" className="text-sm font-medium text-primary-500 hover:underline dark:text-primary-400">
                  Forgot password?
                </a>
              </div>
              <button
                type="submit"
                className="w-full text-white bg-[#8cc0de] hover:bg-[#76a1ba] focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center shadow-lg"
              >
                Sign in
              </button>
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Don't have an account yet?{" "}
                <Link to="/register" className="font-medium text-primary-500 hover:underline dark:text-primary-400">
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
