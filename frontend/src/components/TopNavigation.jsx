import {
    // FaSearch,
    // FaHashtag,
    // FaRegBell,
    // FaUserCircle,
    FaMoon,
    FaSun,
  } from 'react-icons/fa';
  import useDarkMode from './useDarkMode.jsx';

  
  
  const TopNavigation = () => {
    return (
      <div className='
      bg-white dark:bg-gray-900 dark:text-white shadow-lg"'>

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
          <div>
          <FaSun size='24' className='top-navigation-icon' />
          <h5 className='title-text'>Light Mode</h5>
          </div>
        ) : (
          <div>
          <FaMoon size='24' className='top-navigation-icon' />
          <h5 className='title-text'>Dark Mode</h5>
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
  
  
  
  
  
   export {TopNavigation, ThemeIcon};