import React, { Fragment } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import back from '../../Assets/img/back.svg';
import '../../Assets/scss/main.scss';
import { RENDER_URL } from '../../Utils/Urls';
import { DEFAULT_DISTANCE } from '../../Utils/Constants';
import localization from '../Localization/LocalizationComponent';

const BackButtonComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const backHome = () => {
    const currentPath = location.pathname;
    const pathParts = currentPath.split('/');

    // Handle different URL patterns:
    // /register/event/:eventDateId (4 parts) -> go to results page or home
    // /register/form/:eventDateId (4 parts) -> go to event details
    // /register/form/:eventDateId/:timeslotId (5 parts) -> go to event details

    if (pathParts.length === 4 && pathParts[2] === 'event') {
      // /register/event/:eventDateId - go back to search results or home

      // First, try to retrieve stored search results URL from sessionStorage
      const storedSearchUrl = sessionStorage.getItem('searchResultsUrl');
      if (storedSearchUrl) {
        sessionStorage.removeItem('searchResultsUrl');
        navigate(storedSearchUrl);
        return;
      }

      // Fallback: Try to reconstruct search URL from localStorage
      const searchZip = localStorage.getItem('search_zip');
      if (searchZip) {
        // Reconstruct search results URL with default distance
        const searchUrl = `/events/list/${searchZip}/${DEFAULT_DISTANCE}/`;
        navigate(searchUrl);
        return;
      }

      // Final fallback: navigate to home
      navigate(RENDER_URL.ROOT_URL);
    } else if (pathParts.length >= 4 && pathParts[2] === 'form') {
      // /register/form/:eventDateId or /register/form/:eventDateId/:timeslotId
      // Extract eventDateId from the URL (it's the 4th part, index 3)
      const eventDateId = pathParts[3];
      if (eventDateId) {
        navigate(`${RENDER_URL.REGISTRATION_EVENT_DETAILS_URL}/${eventDateId}`);
      } else {
        // Fallback to home if no eventDateId
        navigate(RENDER_URL.ROOT_URL);
      }
    } else {
      // Default fallback
      navigate(RENDER_URL.ROOT_URL);
    }
  };

  return (
    <Fragment>
      <div className="row">
        <div className="col-md-12">
          <button type="button" className="btn back-button" onClick={backHome}>
            <span className="back-arrow">
              <img alt={localization.button_back} src={back} />
            </span>
            <span className="font-weight-bold text-uppercase ml-2">{localization.button_back}</span>
          </button>
        </div>
      </div>
    </Fragment>
  );
};

export default BackButtonComponent;
