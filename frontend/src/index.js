import React from "react";
// import ReactDOM from "react-dom";
import {createRoot}  from 'react-dom/client';
import App from "./App";
import "./index.css"; // Import tailwind CSS file

// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById("root")
// );

//ro stop react rendering multiple times
//to disable: Remove <React.StrictMode> or <StrictMode>

const root = createRoot(document.getElementById("root"))
root.render(
    <React.StrictMode>
       <App />
     </React.StrictMode>
   );
