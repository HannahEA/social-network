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
        <Title /> 
        <ThemeIcon />
        {/* <Search />
        <BellIcon />
        <UserCircle /> */}

      </div>
    );
  };
  
  const ThemeIcon = () => {
    const [darkTheme, setDarkTheme] = useDarkMode();
    const handleMode = () => setDarkTheme(!darkTheme);
    return (
      <span onClick={handleMode}>
        {darkTheme ? (
          <FaSun size='24' className='top-navigation-icon' />
        ) : (
          <FaMoon size='24' className='top-navigation-icon' />
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
   const Title = () => <h5 className='title-text'>Dark/ Light Mode</h5>;
  
  export default TopNavigation;