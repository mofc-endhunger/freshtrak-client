import React from "react";
import LogoComponent from "../General/LogoComponent";
import { Link } from "react-router-dom";
import { RENDER_URL } from "../../Utils/Urls";
import { getFormattedAppVersion } from "../../Utils/VersionUtils";
import config from "../../config";
import localization from "../Localization/LocalizationComponent";

const FRESHTRAK_PARTNERS_URL = config.FRESHTRAK_PARTNERS_URL;

const FooterComponent: React.FC = () => (
	<div className="container mx-auto px-4 pt-12">
		<div className="flex flex-col lg:flex-row items-start gap-8">
			<LogoComponent />
			<div className="flex-1">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<div className="md:col-span-1"></div>
					<div className="md:col-span-1">
						<span className="block font-bold text-sm mb-4 text-center md:text-left">
							{localization.footer_our_policies}
						</span>
						<ul className="space-y-2 text-center md:text-left">
							<li>
								<Link
									to={RENDER_URL.PRIVACY}
									className="text-white text-sm underline hover:no-underline"
								>
									{localization.footer_privacy_policy}
								</Link>
								<br />
								<Link
									to={RENDER_URL.TERMS}
									className="text-white text-sm underline hover:no-underline"
								>
									{localization.footer_terms_of_use}
								</Link>
							</li>
						</ul>
					</div>
					{/* <div className="md:col-span-1">
            <span className="block font-bold text-sm mb-4 text-center md:text-left">Find Resources</span>
            <ul className="space-y-2 text-center md:text-left">
              <li>
                <Link to={RENDER_URL.FRESHTRAK_ABOUT} className="text-white text-sm underline hover:no-underline">
                  About FreshTrak
                </Link>
              </li>
            </ul>
          </div> */}
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
									{" "}
									{localization.footer_freshtrak_partner}{" "}
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
	</div>
);

export default FooterComponent;
