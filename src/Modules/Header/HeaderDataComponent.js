import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { selectZip } from '../../Store/Search/searchSlice';
import localization from '../Localization/LocalizationComponent';

const HeaderDataComponent = () => {
  const location = useLocation();
  const zip = useSelector(selectZip);
  const getPath = pathname => {
    if (!pathname || typeof pathname !== 'string') {
      return '';
    }
    // Check if the pathname starts with the events list base path
    const eventsListBasePath = '/events/list';
    if (pathname.startsWith(eventsListBasePath)) {
      return eventsListBasePath;
    }
    return '';
  };
  const currentPath = getPath(location.pathname);

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full'>
      <div className='flex flex-col items-center justify-center h-full'>
        <div className='w-full sm:w-[95%] md:w-[80%] lg:w-[85%] xl:w-[80%] max-w-4xl'>
          {currentPath !== '/events/list' ? (
            <h1 className='text-center text-white font-bold text-[1.4rem] sm:text-[2.3rem] md:text-[2.5rem] lg:text-[3.3rem] capitalize leading-tight'>
              {localization.home_freshtrack}
            </h1>
          ) : (
            <h1 className='text-center text-white font-bold text-[1.4rem] sm:text-[2.3rem] md:text-[2.5rem] lg:text-[3.3rem] capitalize leading-tight'>
              {localization.resource_zip_code} {zip}
            </h1>
          )}
          {currentPath !== '/events/list' && (
            <p
              className='text-center text-secondary font-varela text-[0.9rem] sm:text-[1.2rem] mt-4'
              data-testid='subtext-on-header'
            >
              {localization.home_header_component}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
export default HeaderDataComponent;
