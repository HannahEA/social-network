import {
  // FaSearch,
  // FaHashtag,
  // FaRegBell,
  // FaUserCircle,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import useDarkMode from "./useDarkMode.jsx";

const TopNavigation = () => {
  return (
    <div
      className='
      bg-white dark:bg-gray-900 dark:text-white shadow-lg"'
    >
      {/* <HashtagIcon />*/}
      {/* <Title />  */}
      <ThemeIcon />
      {/* <Search />
        <BellIcon />
        <UserCircle /> */}
    </div>
  );
};

//darkTheme represents the current mode, and handleMode toggles the mode when clicked.
const ThemeIcon = () => {
  const [isDarkTheme, setDarkTheme] = useDarkMode();
  const handleMode = () => setDarkTheme(!isDarkTheme);

  return (
    <span onClick={handleMode}>
      {isDarkTheme ? (
        <div className="flex items-center justify-center bg-[#ffffffbd] rounded-full p-3 absolute left-0 top-0 ml-3 mt-3 cursor-pointer">
          <FaSun size="24" className="top-navigation-icon" color="#29283E" />
          <h5 className="title-text"></h5>
        </div>
      ) : (
        <div className="flex items-center justify-center bg-[#29283ede] rounded-full p-3 absolute left-0 top-0 ml-3 mt-3 cursor-pointer">
          <FaMoon size="24" className="top-navigation-icon" color="#ffffffb3" />
          <h5 className="title-text text-white"></h5>
        </div>
      )}
    </span>
  );
};

//   const Search = () => (
//     <div className='search'>
//       <input className='search-input' type='text' placeholder='Search...' />
//       <FaSearch size='18' className='text-secondary my-auto' />
//     </div>
//   );
//   const BellIcon = () => <FaRegBell size='24' className='top-navigation-icon' />;
//   const UserCircle = () => <FaUserCircle size='24' className='top-navigation-icon' />;
//   const HashtagIcon = () => <FaHashtag size='20' className='title-hashtag' />;
// const Title = () => <h5 className='title-text'>Dark/ Light Mode</h5>;

export { TopNavigation, ThemeIcon };
