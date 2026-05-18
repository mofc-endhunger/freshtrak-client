import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoComponent from '../General/LogoComponent';
import { Link } from 'react-router-dom';
import { RENDER_URL } from '../../Utils/Urls';
import { getFormattedAppVersion } from '../../Utils/VersionUtils';
import config from '../../config';
import localization from '../Localization/LocalizationComponent';
import { StorageService } from '../../Utils/StorageService';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
} from '../../components/ui/dialog';

const FRESHTRAK_PARTNERS_URL = config.FRESHTRAK_PARTNERS_URL;

const FooterComponent: React.FC = () => {
  const navigate = useNavigate();
  const [caseManagerExpanded, setCaseManagerExpanded] = useState(false);
  const [showClearSessionDialog, setShowClearSessionDialog] = useState(false);

  const handleClearSession = () => {
    StorageService.removeItem('freshtrak_user_guest');
    StorageService.clearUserToken();
    StorageService.removeItem('guestId');
    StorageService.removeItem('guestType');
    setShowClearSessionDialog(false);
    setCaseManagerExpanded(false);
    navigate(RENDER_URL.ROOT_URL);
  };

  return (
    <div className="container mx-auto px-4 pt-12">
      <div className="flex flex-col lg:flex-row items-start gap-8">
        <LogoComponent />
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <button
                onClick={() => setCaseManagerExpanded(!caseManagerExpanded)}
                className="block font-bold text-sm mb-4 text-center md:text-left text-white bg-transparent border-none cursor-pointer p-0 hover:underline"
              >
                {localization.footer_for_case_managers}
              </button>
              {caseManagerExpanded && (
                <ul className="space-y-2 text-center md:text-left">
                  <li>
                    <button
                      onClick={() => setShowClearSessionDialog(true)}
                      className="text-white text-sm underline hover:no-underline bg-transparent border-none cursor-pointer p-0"
                    >
                      {localization.footer_register_another_person}
                    </button>
                  </li>
                </ul>
              )}
            </div>
            <div className="md:col-span-1">
              <span className="block font-bold text-sm mb-4 text-center md:text-left">
                {localization.footer_our_policies}
              </span>
              <ul className="space-y-2 text-center md:text-left">
                <li>
                  <Link
                    to={RENDER_URL.PRIVACY}
                    className="text-white text-sm underline hover:no-underline"
                    data-testid="footer-privacy"
                  >
                    {localization.footer_privacy_policy}
                  </Link>
                  <br />
                  <Link
                    to={RENDER_URL.TERMS}
                    className="text-white text-sm underline hover:no-underline"
                    data-testid="footer-terms"
                  >
                    {localization.footer_terms_of_use}
                  </Link>
                </li>
              </ul>
            </div>
            <div className="md:col-span-1">
              <span className="block font-bold text-sm mb-4 text-center md:text-left">
                {localization.footer_for_foodbanks_agencies}
              </span>
              <ul className="space-y-2 text-center md:text-left">
                <li>
                  <a
                    href={FRESHTRAK_PARTNERS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white text-sm underline hover:no-underline"
                  >
                    {' '}
                    {localization.footer_freshtrak_partner}{' '}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="pt-2 pb-3 mt-8">
        <div className="text-center md:text-right">
          <p className="text-xs">{localization.footer_copyright}</p>
          <p className="text-xs mt-1">{getFormattedAppVersion()}</p>
        </div>
      </div>

      <Dialog open={showClearSessionDialog}>
        <DialogContent
          className="sm:max-w-md bg-white border border-gray-200 text-gray-900"
          showCloseButton={false}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-center text-gray-900">
              {localization.footer_clear_session_title}
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              {localization.footer_clear_session_description}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button
              onClick={() => setShowClearSessionDialog(false)}
              variant="outline"
              className="flex-1"
            >
              {localization.footer_clear_session_cancel}
            </Button>
            <Button onClick={handleClearSession} variant="default" className="flex-1">
              {localization.footer_clear_session_confirm}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FooterComponent;
