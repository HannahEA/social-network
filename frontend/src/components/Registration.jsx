import React, { useState } from "react";
import TopNavigation from './TopNavigation.jsx';
import { Notyf } from "notyf";
import "notyf/notyf.min.css";
import { useNavigate, Link } from "react-router-dom";

const RegistrationPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarURL, setAvatarURL] = useState(null);
  const [avatarImage, setAvatarImage] = useState("");
  const [bio, setBio] = useState("");

  const notyf = new Notyf();
  const navigate = useNavigate();

  const handleFirstNameChange = (event) => {
    setFirstName(event.target.value);
  };

  const handleLastNameChange = (event) => {
    setLastName(event.target.value);
  };

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handleAgeChange = (event) => {
    setAge(event.target.value);
  };

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
    const { value } = event.target;
  
    if (value.startsWith('http') || value.startsWith('https')) {
      // It's an image URL
      setAvatarURL(value);
    } else {
      // It's a file upload
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarImage(reader.result);
      };
      reader.readAsDataURL(file);
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

  // //HS: NEW UPDATED CODE FOR REGISTRATION
  const handleRegistration = (event) => {
    event.preventDefault();

  //HS: Create an object with the form data
    const formData = {
      firstName: firstName,
      lastName: lastName,
      username: username,
      age: age,
      gender: gender,
      email: email,
      password: password,
      confirPwd: confirmPassword,
      avatar: avatarURL,
      image: avatarImage,
      aboutMe: bio
    };

    console.log({formData})

  //HS: Not using a multipart/form-data object anymore
  //Create a FormData object for sending the data as multipart/form-data
    /*const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }*/

  //Make a POST request to the server
    fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
  //Handle the response from the server
        console.log(data);

  //Check if the registration was successful
        if (data.message === "Registration successful") {
  //Display a success notification
          notyf.success("Registration successful");

  //Reset the form
          setFirstName("");
          setLastName("");
          setUsername("");
          setAge("");
          setGender("");
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setAvatarURL("");
          setAvatarImage(null);
          setBio("");

  //Redirect to the login page
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

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
    <div className='content-container'>
    <TopNavigation /></div>
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:min-h-screen lg:py-0">
        <Link to="/" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
          <img className="w-8 h-8 mr-2" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo" />
          Social-Network
        </Link>
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-3xl max- xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">Create an account</h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleRegistration}>
            <div id ="row" className="flex gap-20">
              <div id = "column1" className="flex-1">
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
              <div>
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
              <div id = "column2" className="flex-1">
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
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  required
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
                  required
                />
              </div>
              </div>
              <div id = "column3" className="flex-1">
              <div>
                <label htmlFor="avatar" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Avatar
                </label>
                <input type="file" name="avatar" id="avatar" accept="image/*" className="hidden" onChange={handleAvatarChange} />
               {/* START of image URL */}
                <div className="flex">
                  <input
                    type="text"
                    name="avatarUrl"
                    id="avatarUrl"
                    placeholder="Enter image URL"
                    className="w-full mr-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-gray-600"
                    onChange={handleAvatarChange}
                  />
                  {/* END of image URL */}
                  <label
                    htmlFor="avatar"
                    className="flex items-center justify-center px-6 py-3 text-sm font-medium text-white transition duration-200 ease-in bg-primary-600 border border-transparent rounded-lg cursor-pointer hover:bg-primary-700 focus:block w-full p-2.5 outline-none focus:border-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Select Image File
                  </label>
                </div>
              </div>
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
