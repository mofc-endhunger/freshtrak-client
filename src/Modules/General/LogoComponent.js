import React from 'react';
import { Link } from 'react-router-dom';
import FooterLogoIcon from '../../Assets/img/footer-logo.svg';
import { RENDER_URL } from '../../Utils/Urls';

const LogoComponent = () => {
  return (
    <div className="w-full lg:w-1/2 xl:w-1/2">
      <Link to={RENDER_URL.ROOT_URL} className="block">
        <div className="h-10">
          <img src={FooterLogoIcon} alt="Freshtrak Logo" className="max-w-full max-h-full" />
        </div>
      </Link>
    </div>
  );
};

export default LogoComponent;
