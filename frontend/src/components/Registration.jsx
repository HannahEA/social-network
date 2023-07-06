import React, { useState, useRef } from "react";
import { TopNavigation, ThemeIcon } from "./TopNavigation.jsx";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";
import { useNavigate, Link } from "react-router-dom";

// environment variable from the docker-compose.yml file.
//This variable will contain the URL of your backend service,
//allowing your frontend code to make requests to the correct endpoint.
const apiURL = process.env.REACT_APP_API_URL;
//const apiURL = "http://localhost:8000"

let fileType;

const RegistrationPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  // const [age, setAge] = useState("");
  const [date, setDOB] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarURL, setAvatarURL] = useState(null);
  const [avatarImage, setAvatarImage] = useState("");
  const [bio, setBio] = useState("");

  const dateInputRef = useRef(null);
  const notyf = new Notyf();
  const navigate = useNavigate();

  //uses the useState hook to keep track of the selected date
  //and the useRef hook to get a reference to the date input field.
  //It then creates an onChange handler that updates the date state
  //when the user selects a date.
  const handleDateChange = (e) => {
    setDOB(e.target.value);
  };

  const handleFirstNameChange = (event) => {
    setFirstName(event.target.value);
  };

  const handleLastNameChange = (event) => {
    setLastName(event.target.value);
  };

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  // const handleAgeChange = (event) => {
  //   setAge(event.target.value);
  // };

  const handleGenderChange = (event) => {
    setGender(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
  };

  //HS: This code handles both files and image URLs
  //By using FileReader and readAsDataURL, the image file is converted
  //to a base64-encoded string, which can be sent as a string value in the JSON data.
  const handleAvatarChange = (event) => {
    //setAvatarURL("");//throws error: too many renders
    const { value } = event.target;

    if (value.startsWith("http") || value.startsWith("https")) {
      setAvatarURL(value);
    } else {
      // It's a file upload
      const file = event.target.files[0];

      //now get file type
      /*const fType = file.type;
      console.log({fType});//this should show e.g. "image/jpg"
      fileType = fType.split("/");
      fileType = fileType[1];
      console.log({fileType});*/ //this should show e.g. "jpg"

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        setAvatarImage(result);
      };
      reader.readAsDataURL(file);
      console.log({ avatarImage });
    }
  };

  const handleBioChange = (event) => {
    setBio(event.target.value);
  };

  //HS: Replaced by code starting at line 110
  /*const handleRegistration = (event) => {
    event.preventDefault();

    // Create an object with the form data
    const formData = {
      email: email,
      password: password,
      confirmPassword: confirmPassword,
    };

    // Make a POST request to the server
    fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response from the server
        console.log(data);

        // Check if the registration was successful
        if (data.message === "Registration successful") {
          // Display a success notification
          notyf.success("Registration successful");

          // Reset the form
          setEmail("");
          setPassword("");
          setConfirmPassword("");

          // Redirect to the login page
          navigate("/login");
        } else if (data.message === "Email already taken") {
          notyf.error("Email already taken");
        } else {
          notyf.error("Invalid registration");
        }
      })
      .catch((error) => {
        // Handle any errors
        console.error("Error:", error);
      });
  };*/

  //use default image if none was supplied
  if (avatarImage === "" && avatarURL === null) {
    setAvatarURL(
      "https://yt3.googleusercontent.com/-CFTJHU7fEWb7BYEb6Jh9gm1EpetvVGQqtof0Rbh-VQRIznYYKJxCaqv_9HeBcmJmIsp2vOO9JU=s900-c-k-c0x00ffffff-no-rj"
    );
  }

  // //HS: NEW UPDATED CODE FOR REGISTRATION
  const handleRegistration = (event) => {
    event.preventDefault();

    //HS: Create an object with the form data
    const formData = {
      firstName: firstName,
      lastName: lastName,
      username: username,
      age: date,
      gender: gender,
      email: email,
      password: password,
      confirPwd: confirmPassword,
      avatar: avatarURL,
      image: avatarImage,
      //imageType: fileType,
      aboutMe: bio,
    };

    //HS: Not using a multipart/form-data object anymore
    //Create a FormData object for sending the data as multipart/form-data
    /*const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }*/

    if (firstName === "" || lastName === "" || username === "" || date === "" || gender === "" || email === "" || password === "") {
      notyf.error("Please fill in all fields");
      return;
    } else {
      //Make a POST request to the server
      fetch(`${apiURL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          //Handle the response from the server
          console.log(data);

          //Check if the registration was successful
          if (data.message === "Registration successful") {
            console.log("Successfully sent to backend:", formData);

            //Display a success notification
            notyf.success("Registration successful");

            //Reset the form
            setFirstName("");
            setLastName("");
            setUsername("");
            setDOB("");
            setGender("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setAvatarURL(null);
            setAvatarImage("");
            setBio("");

            //Redirect to the login page
            navigate(`/login`);
          } else if (data.message === "Email already taken") {
            notyf.error("Email already taken");
          } else {
            notyf.error("Invalid registration");
          }
        })
        .catch((error) => {
          // Handle any errors
          console.error("Error:", error);
        });
    }
  };

  //check if password and confirm password match

  // NEW UPDATED CODE FOR REGISTRATION
  // const handleRegistration = (event) => {
  //   event.preventDefault();

  //   // Create an object with the form data
  //   const formData = {
  //     firstName: firstName,
  //     lastName: lastName,
  //     username: username,
  //     age: age,
  //     gender: gender,
  //     email: email,
  //     password: password,
  //     avatar: {
  //       file: avatarURL
  //     },
  //     bio: bio
  //   };

  //   // Create a FormData object for sending the data as multipart/form-data
  //   const formDataToSend = new FormData();
  //   for (const key in formData) {
  //     formDataToSend.append(key, formData[key]);
  //   }
  //   console.log(formDataToSend)
  //   // Make a POST request to the server
  //   fetch("/register", {
  //     method: "POST",
  //     body: formDataToSend
  //    credentials: 'include',
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       // Handle the response from the server
  //       console.log(data);

  //       // Check if the registration was successful
  //       if (data.message === "Registration successful") {
  //         // Display a success notification
  //         notyf.success("Registration successful");

  //         // Reset the form
  //         setFirstName("");
  //         setLastName("");
  //         setUsername("");
  //         setAge("");
  //         setGender("");
  //         setEmail("");
  //         setPassword("");
  //         setConfirmPassword("");
  //         setAvatarURL(null);
  //         setBio("");

  //         // Redirect to the login page
  //         navigate("/login");
  //       } else if (data.message === "Email already taken") {
  //         notyf.error("Email already taken");
  //       } else {
  //         notyf.error("Invalid registration");
  //       }
  //     })
  //     .catch((error) => {
  //       // Handle any errors
  //       console.error("Error:", error);
  //     });
  // };

  const [step, setStep] = useState(1);
  const handleStepChange = (newStep) => {
    setStep(newStep);
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="content-container">
        <TopNavigation />
      </div>
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:min-h-screen lg:py-0">
        <Link to="/">
          <img className="mb-5" src="https://jguleserian.github.io/FMC-MeetLandingPage/assets/logo.svg" alt="logo" />
        </Link>
        {/* Step 1 */}
        <div className="p-8 mx-auto bg-white rounded-lg shadow dark:border md:mt-0 p-4 dark:bg-gray-800 dark:border-gray-700">
          <div className="space-y-4 md:space-y-6">
            <form id="registrationForm" className="space-y-4 md:space-y-6" onSubmit={handleRegistration}>
              <div class="header">
                <ul className="w-full flex justify-center">
                  <li class="active form_1_progessbar">
                    <div className="w-fit flex justify-center items-center">
                      <p className="bg-[#4D96A9] h-8 w-8 flex text-center justify-center items-center text-white rounded-full">1</p>
                      <div
                        className={`${step === 1 ? "bg-gradient-to-r from-[#4D96A9] to-gray-400" : "bg-[#4D96A9]"} bg-1/3 h-[5px] w-10`}
                      ></div>
                    </div>
                  </li>
                  <li class="form_2_progessbar">
                    <div className="w-fit flex justify-center items-center">
                      <p
                        className={`${
                          step === 1 ? "bg-gray-400" : "bg-[#4D96A9]"
                        } h-8 w-8 flex text-center justify-center items-center text-white rounded-full`}
                      >
                        2
                      </p>
                      <div
                        className={`${
                          step === 1 ? "bg-gray-400" : step === 2 ? "bg-gradient-to-r from-[#4D96A9] to-gray-400" : "bg-[#4D96A9]"
                        } bg-1/3 h-[5px] w-10`}
                      ></div>
                    </div>
                  </li>
                  <li class="form_3_progessbar">
                    <div>
                      <p
                        className={`${
                          step === 3 ? "bg-[#4D96A9]" : "bg-gray-400"
                        } h-8 w-8 flex text-center justify-center items-center text-white rounded-full`}
                      >
                        3
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <h1 className="text-lg text-center font-bold leading-tight tracking-tight text-gray-700 2xl:text-xl dark:text-white">
                {step === 1 ? "Let's Get Started" : step === 2 ? "Nearly There..." : "One last thing..."}
              </h1>

              <div>
                {/* Step 1 */}
                <div className={`step-1 flex flex-col gap-3.5 ${step === 1 ? "" : "hidden"}`}>
                  <div>
                    <label for="firstName" class="block mb-1.5 text-sm font-medium text-gray-900 dark:text-white">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg outline-[#4d97a92f] block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:outline-none"
                      placeholder="Ada"
                      value={firstName}
                      onChange={handleFirstNameChange}
                    />
                  </div>
                  <div>
                    <label for="lastName" class="block mb-1.5 text-sm font-medium text-gray-900 dark:text-white">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg outline-[#4d97a92f] block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:outline-none"
                      placeholder="Lovelace"
                      value={lastName}
                      onChange={handleLastNameChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block mb-1.5 text-sm font-medium text-gray-900 dark:text-white">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg outline-[#4d97a92f] block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:outline-none"
                      placeholder="ada@lovelace.com"
                      value={email}
                      onChange={handleEmailChange}
                    />
                  </div>
                  <div
                    onClick={() => handleStepChange(2)}
                    className="step-1-btn flex justify-center w-full px-4 py-2 mt-2 text-sm font-medium text-white transition duration-200 ease-in bg-[#4D96A9] border border-transparent rounded-lg cursor-pointer hover:bg-[#438495] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4d97a94f]"
                  >
                    Continue
                  </div>
                </div>

                {/* Step 2 */}
                <div className={`step-2 flex flex-col gap-3.5 ${step === 2 ? "" : "hidden"}`}>
                  <div>
                    <label htmlFor="username" className="block mb-1.5 text-sm font-medium text-gray-900 dark:text-white">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 outline-[#4d97a92f]"
                      placeholder="Choose a username"
                      value={username}
                      onChange={handleUsernameChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block mb-1.5 text-sm font-medium text-gray-900 dark:text-white">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 outline-[#4d97a92f]"
                      placeholder="••••••••"
                      value={password}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="gender" className="block mb-1.5 text-sm font-medium text-gray-900 dark:text-white">
                      Your DOB
                    </label>
                    <input
                      type="date"
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 outline-[#4d97a92f]"
                      onChange={handleDateChange}
                      ref={dateInputRef}
                    />
                  </div>
                  <div className="flex justify-center gap-2">
                    <div
                      onClick={() => handleStepChange(1)}
                      className="step-2-btn flex justify-center w-fit px-4 py-2 mt-2 text-sm font-medium text-white transition duration-200 ease-in bg-gray-400 border border-transparent rounded-lg cursor-pointer hover:bg-[#878d98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4d97a94f]"
                    >
                      Back
                    </div>
                    <div
                      onClick={() => handleStepChange(3)}
                      className="step-2-btn flex justify-center w-full px-4 py-2 mt-2 text-sm font-medium text-white transition duration-200 ease-in bg-[#4D96A9] border border-transparent rounded-lg cursor-pointer hover:bg-[#438495] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4d97a94f]"
                    >
                      Continue
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className={`step-3 flex flex-col gap-3.5 ${step === 3 ? "" : "hidden"}`}>
                  <div>
                    <label htmlFor="avatar" className="block mb-1.5 text-sm font-medium text-gray-900 dark:text-white">
                      Avatar
                    </label>

                    <div>
                      <input
                        type="text"
                        name="avatarUrl"
                        id="avatarUrl"
                        placeholder="Enter image URL"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-center sm:text-sm rounded-t-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 outline-[#4d97a92f]"
                        onChange={handleAvatarChange}
                      />
                      {/* END of image URL */}
                    </div>
                    <div>
                      <label
                        htmlFor="avatar"
                        className="flex justify-center w-full px-4 py-2 mt-0 text-sm font-medium text-white transition duration-200 ease-in bg-[#6b939d] rounded-b-lg cursor-pointer hover:bg-[#438495] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4d97a94f]"
                      >
                        Upload From File
                      </label>
                      <input type="file" name="avatar" id="avatar" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="gender" className="block mb-1.5 text-sm font-medium text-gray-900 dark:text-white">
                      Gender
                    </label>
                    <input
                      type="text"
                      name="gender"
                      id="gender"
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 outline-[#4d97a92f]"
                      placeholder="Your gender"
                      value={gender}
                      onChange={handleGenderChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="bio" className="block mb-1.5 text-sm font-medium text-gray-900 dark:text-white">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      id="bio"
                      rows="3"
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 outline-[#4d97a92f]"
                      placeholder="Tell us about yourself"
                      value={bio}
                      onChange={handleBioChange}
                    ></textarea>
                  </div>
                  <div className="flex justify-center gap-2">
                    <div
                      onClick={() => handleStepChange(2)}
                      className="step-2-btn flex justify-center w-fit px-4 py-2 mt-2 text-sm font-medium text-white transition duration-200 ease-in bg-gray-400 border border-transparent rounded-lg cursor-pointer hover:bg-[#878d98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4d97a94f]"
                    >
                      Back
                    </div>
                    <button
                      type="submit"
                      className="flex justify-center w-full px-4 py-2 mt-2 text-sm font-medium text-white transition duration-200 ease-in bg-[#4D96A9] border border-transparent rounded-lg cursor-pointer hover:bg-[#438495] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4d97a94f]"
                    >
                      Register
                    </button>
                  </div>
                </div>
                <p className="text-sm text-center text-gray-400 mt-2">
                  Already registered?{" "}
                  <Link to="/login" className="font-medium text-[#4D96A9] hover:underline dark:text-primary-500">
                    Log in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
        {/* Step 2 */}
        <div className="hidden w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-3xl max- xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">Create an account</h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleRegistration}>
              <div id="row" className="flex gap-20">
                <div id="column1" className="flex-1">
                  <div>
                    <label htmlFor="firstName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Your first name"
                      value={firstName}
                      onChange={handleFirstNameChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Your last name"
                      value={lastName}
                      onChange={handleLastNameChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Choose a username"
                      value={username}
                      onChange={handleUsernameChange}
                    />
                  </div>
                  {/* <div>
                <label htmlFor="age" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  id="age"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Your age"
                  value={age}
                  onChange={handleAgeChange}
                />
              </div> */}
                  <div>
                    <label htmlFor="gender" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Your DOB
                    </label>
                    <input
                      type="date"
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      onChange={handleDateChange}
                      ref={dateInputRef}
                    />
                  </div>

                  <div>
                    <label htmlFor="gender" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Gender
                    </label>
                    <input
                      type="text"
                      name="gender"
                      id="gender"
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Your gender"
                      value={gender}
                      onChange={handleGenderChange}
                    />
                  </div>
                </div>
                <div id="column2" className="flex-1">
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
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="••••••••"
                      value={password}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Confirm password
                    </label>
                    <input
                      type="password"
                      name="confirm-password"
                      id="confirm-password"
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                    />
                  </div>
                </div>
                <div id="column3" className="flex-1">
                  <div>
                    <label htmlFor="bio" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      id="bio"
                      rows="3"
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Tell us about yourself"
                      value={bio}
                      onChange={handleBioChange}
                    ></textarea>
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="flex justify-center w-full px-4 py-2 mt-2 text-sm font-medium text-white transition duration-200 ease-in bg-primary-600 border border-transparent rounded-lg cursor-pointer hover:bg-primary-700 focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Register
                    </button>
                  </div>
                </div>
              </div>
            </form>
            <p className="text-xs text-center text-gray-400">
              By signing up, you agree to our{" "}
              <a href="#" className="underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="underline">
                Privacy Policy
              </a>
              .
            </p>
            <p className="text-sm text-center text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-primary-600 hover:underline dark:text-primary-500">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegistrationPage;
