import React from "react";
import LogoComponent from "../General/LogoComponent";
import { Link } from "react-router-dom";
import { RENDER_URL } from "../../Utils/Urls";

const FRESHTRAK_PARTNERS_URL = process.env.REACT_APP_FRESHTRAK_PARTNERS_URL;

const FooterComponent: React.FC = () => (
	<div className="container mx-auto px-4 pt-12">
		<div className="flex flex-col lg:flex-row items-start gap-8">
			<LogoComponent />
			<div className="flex-1">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<div className="md:col-span-1"></div>
					<div className="md:col-span-1">
						<span className="block font-bold text-sm mb-4 text-center md:text-left">
							Our Policies
						</span>
						<ul className="space-y-2 text-center md:text-left">
							<li>
								<Link
									to={RENDER_URL.PRIVACY}
									className="text-white text-sm underline hover:no-underline"
								>
									PrivacyPolicy
								</Link>
								<br />
								<Link
									to={RENDER_URL.TERMS}
									className="text-white text-sm underline hover:no-underline"
								>
									Terms of Use
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
							For Foodbanks & Agencies
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
									FreshTrak: Partner{" "}
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
		<div className="pt-2 pb-3 mt-8">
			<div className="text-center md:text-right">
				<p className="text-xs">© 2025 FreshTrak</p>
			</div>
		</div>
	</div>
);

export default FooterComponent;
