//inspiration from: https://github.com/fireship-io/tailwind-dashboard/blob/main/src/components/SideBar/index.jsx
import { useEffect, useState } from 'react';

/*
Together, these functions create a system for managing 
and persisting values in localStorage (useLocalStorage), 
controlling the state of dark mode (useDarkMode), 
and applying appropriate styles based on the mode state (useEffect). 
They provide an encapsulated and reusable approach to implementing features
 related to localStorage and managing UI behaviors in React components.

Here is how the three functions work together:

1) useLocalStorage:
The useLocalStorage function is a custom hook that provides a way to store 
and retrieve values from the browser's localStorage.
It uses the useState hook to define a state variable (storedValue) and a setter function
 (setStoredValue) to manage the stored value.
It retrieves the initial value from localStorage using the provided key and falls back 
to the initialValue if no stored value is found.
It returns an array [storedValue, setStoredValue] to allow accessing and updating the stored value.

2) useDarkMode:
The useDarkMode function is another custom hook that utilizes the useLocalStorage hook.
It manages the state of the dark mode by calling useLocalStorage with the 'dark-theme' key.
It retrieves the current mode value (enabled) and provides a setter function (setEnabled)
 to update the mode value. It applies the appropriate CSS class ('dark') to the 
 window.document.body element based on the mode value, using the useEffect hook.

3) useEffect:
The useEffect hook is a built-in hook provided by React to handle side effects in functional components.
It allows performing actions in response to changes in dependencies.
In the context of the useDarkMode function, it triggers an effect whenever the enabled or isEnabled variables change.
Inside the effect, it adds the 'dark' CSS class to the bodyClass of the window.document.body element if isEnabled is truthy, or removes the 'dark' class if isEnabled is falsy.
 */

/*Detailed explanations:

Below function is a custom hook that handles storing and retrieving values from the browser's 
localStorage key under which the value will be stored in localStorage, 
and initialValue represents the default value to be used 
if there is no stored value under the given key.
It uses the useState hook to define a state variable storedValue 
and a corresponding setter function setStoredValue. 
The initial state value is set using a function that is passed to useState
This function is executed only once during the initial render.
If a value associated with the provided key is found (item is truthy)
it parses the value from a string to its original form using JSON.parse(item)
and this parsed value is then returned as the initial value of storedValue.
Otherwise the initialValue provided to the useLocalStorage function
is returned as the initial value of storedValue*/

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  /*Below function rovides a way to store a value in the browser's localStorage
  and update it using a provided setter function.
  It first checks if the value parameter is an instance of a function 
  by using the instanceof operator. If it is a function, it executes the function
  by passing storedValue as an argument, and the result is stored in the variable
  valueToStore. If it is not a function, valueToStore is assigned the value 
  of the value parameter.*/

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      setStoredValue(valueToStore);
      //Next, it stores the valueToStore in the browser's localStorage. 
      //It uses JSON.stringify to convert the value to a string before storing it.
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };
  // returns an array: 
  //['value that was stored', 'function to update the value and store it in localStorage again']
  return [storedValue, setValue];
};

const useDarkMode = () => {
  const [enabled, setEnabled] = useLocalStorage('dark-theme');

  //isEnabled is assigned the value of 'enabled'
  const isEnabled = typeof enabled === 'undefined' ? enabled : enabled;

  //The below useEffect function defines an effect using the useEffect hook.
  //The effect is triggered whenever the enabled or isEnabled variables change. 
  //Inside the effect, it checks the value of isEnabled. If it is truthy, 
  //it adds the CSS class name 'dark' to the classList of the window.document.body element.
  //Overall this is a custom hook that manages the state of dark mode. 
  //It utilizes the useLocalStorage hook to store and retrieve the state from localStorage.
  //The isEnabled variable represents the current state of dark mode, 
  //and the setEnabled function can be used to update that state. 
  //Additionally, it applies the 'dark' CSS class to the window.document.body element 
  //based on the value of isEnabled, allowing for dynamic switching of dark mode styles.
  useEffect(() => {
    const className = 'dark';
    const bodyClass = window.document.body.classList;

    isEnabled ? bodyClass.add(className) : bodyClass.remove(className);
  }, [enabled, isEnabled]);

  //return [enabled, setEnabled];
  return [isEnabled, setEnabled];
};

export default useDarkMode;