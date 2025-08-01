import { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { HeaderContext } from '../../Store/ContextApi/HeaderContext';
import { RENDER_URL } from '../../Utils/Urls';
import HeaderComponent from './HeaderComponent';
import HeaderDataComponent from './HeaderDataComponent';

const HeaderContainer = () => {
  let location = useLocation();
  const headerContext = useContext(HeaderContext);
  const shortHeader = headerContext.shortHeader;

  return (
    <div>
      {location.pathname === RENDER_URL.EVENT_CONFIRM_URL ||
      location.pathname === RENDER_URL.ADD_FAMILY_URL ||
      location.pathname === RENDER_URL.FRESHTRAK_ABOUT ||
      location.pathname === RENDER_URL.EDIT_FAMILY_URL ||
      location.pathname === RENDER_URL.FRESHTRAK_WORKING ||
      location.pathname.includes(RENDER_URL.AGENCY_EVENT_LIST) ||
      location.pathname.includes(RENDER_URL.REGISTRATION_EVENT_DETAILS_URL) ||
      location.pathname.includes(RENDER_URL.REGISTRATION_FORM_URL) ? (
        <HeaderComponent shortHeader={shortHeader} />
      ) : (
        <header className='header h-[300px] sm:h-[400px]'>
          <HeaderComponent />
          <HeaderDataComponent />
        </header>
      )}
    </div>
  );
};

export default HeaderContainer;
