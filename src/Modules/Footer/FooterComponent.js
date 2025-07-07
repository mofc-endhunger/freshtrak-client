import React from "react";
import LogoComponent from "../General/LogoComponent";
import { Link } from "react-router-dom";
import { RENDER_URL } from "../../Utils/Urls";

const FRESHTRAK_PARTNERS_URL = process.env.REACT_APP_FRESHTRAK_PARTNERS_URL;
const FooterComponent = () => (
	<div className="container pt-50">
		<div className="row">
			<LogoComponent />
			<div className="col-lg-6 col-xl-6">
				<div className="row">
					<div className="col-md-4"></div>
					<div className="col-md-4">
						<span className="list-title">Our Policies</span>
						<ul>
							<li>
								<Link to={RENDER_URL.PRIVACY}>
									PrivacyPolicy
								</Link>
								<br />
								<Link to={RENDER_URL.TERMS}>Terms of Use</Link>
							</li>
						</ul>
					</div>
					{/* <div className="col-md-4">
            <span className="list-title">Find Resources</span>
            <ul>
              <li>
                <Link to={RENDER_URL.FRESHTRAK_ABOUT}>
                  About FreshTrak
                </Link>
              </li>
            </ul>
          </div> */}
					<div className="col-md-4">
						<span className="list-title">
							For Foodbanks & Agencies
						</span>
						<ul>
							<li>
								<a
									href={FRESHTRAK_PARTNERS_URL}
									target="_blank"
									rel="noopener noreferrer"
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
		<div className="row pt-2 pb-3">
			<div className="col-md-12">
				<p className="copy-right">© 2020 FreshTrak</p>
			</div>
		</div>
	</div>
);

export default FooterComponent;
