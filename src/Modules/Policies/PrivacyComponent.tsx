import React, { Fragment } from "react";
import NavigationBtnComponent from "../General/NavigationBtnComponent";
import "../../Assets/scss/main.scss";

const PrivacyComponent: React.FC = () => {
	return (
		<Fragment>
			<div className="container pt-100 pb-100 register-confirmation">
				<div className="row d-none-xs">
					<div className="col-md-12">
						<NavigationBtnComponent />
					</div>
				</div>
				<div className="row mt-3">
					<div className="col-12">
						<div className="privacy">
							<h2 className="font-weight-bold mobile-text-left">
								<center>FreshTrak Privacy Policy</center>
							</h2>
							<p className="mobile-text-left caption-text">
								Effective Date: January 01, 2021
							</p>
							<p className="mobile-text-left caption-text">
								Your privacy is very important to us.
								Accordingly, we have developed this Privacy
								Policy in order for you to understand how we
								collect, use, communicate, and disclose your
								personal information. This Privacy Policy
								applies to our Website and to our communications
								with you. Throughout this Policy, we may refer
								to FreshTrak as "we," "us," or "our." "Website"
								refers to https://freshtrak.com/ and any other
								microsites or mobile websites we operate or use.
							</p>
							<h4 className="mb-2 medium-title font-weight-bold">
								Information We Collect
							</h4>
							<p className="mobile-text-left caption-text">
								When you visit our Website, certain information
								may be collected about you. This information can
								include:
							</p>
							<ul>
								<li>
									<strong>Device Information:</strong> When
									you visit our Website, we learn about your
									IP address, browser type, domain names,
									access times, and referring website
									addresses.
								</li>
								<li>
									<strong>Website Interactions:</strong> We
									also keep track of the websites and pages
									users visit within our Website in order to
									determine what services are the most
									popular.
								</li>
								<li>
									<strong>Contact Information:</strong> We may
									collect personal information you voluntarily
									provide to us including your name, email
									address, and phone number.
								</li>
								<li>
									<strong>Call or Email Records:</strong> If
									you call or email the numbers provided on
									the Website, we may keep records of those
									conversations.
								</li>
								<li>
									<strong>Demographic Information: </strong>{" "}
									We have access to demographic details about
									our customers like birthdate, gender, ZIP
									code, and other similar details.
								</li>
								<li>
									<strong>Submitted Content: </strong> We
									collect any content you submit to the
									Website, including photos, videos, or
									comments.
								</li>
							</ul>
							<h4 className="mb-2 medium-title font-weight-bold">
								How We Collect Your Information
							</h4>
							<p className="mobile-text-left caption-text">
								We may collect information directly from you,
								from third parties we partner with, or through
								cookies or other automated means. These sources
								may include:
							</p>
							<ul>
								<li>
									<strong>You:</strong> We collect information
									from you, whenever you: visit our Website;
									contact us with questions; upload content to
									our Website; or fill out any forms on our
									Website.
								</li>
								<li>
									<strong>Your Device or Browser:</strong>{" "}
									Certain information is automatically
									collected from your device or browser and
									analyzed when you visit our Website or open
									our emails.
								</li>
								<li>
									<strong>Third Parties:</strong> We work with
									third parties who provide services to us,
									such as analytics or advertising companies.
									These third parties share information they
									have collected with us. Your information may
									also be collected by third parties, who will
									process your information independently in
									accordance with their own privacy notices.
								</li>
								<li>
									<strong>Social Media Platforms:</strong>
									Social media platforms may share information
									with us. You can learn more about how social
									media platforms collect and use your
									information by reviewing their privacy
									policies and settings.
								</li>
								<li>
									<strong>Cookies:</strong> FreshTrak uses
									cookies (small files stored on your device
									or browser) and other similar technologies
									to automatically collect information when
									you visit our Website or interact with our
									emails. Through the use of cookies, we may
									link information about your interactions
									with our Website over time. We also contract
									with third party advertising or analytics
									companies to serve you online ads on other
									websites. These companies use cookies or
									similar technologies to collect information
									about your interactions with our Website and
									interactions with other websites. These
									advertising companies may use and share the
									information gathered to deliver ads more
									tailored to your interests. We receive
									aggregate information from these third
									parties to understand our advertising
									effectiveness. Any information collected by
									us or by third parties through the use of
									cookies or similar technologies may be
									linked with other information we collect
									about you.
								</li>
								<li>
									<strong>Submitted Content: </strong> We
									collect any content you submit to the
									Website, including photos, videos, or
									comments.
								</li>
							</ul>
							<h4 className="mb-2 medium-title font-weight-bold">
								Use of Your Personal Information
							</h4>
							<p className="mobile-text-left caption-text">
								We may use your information for the following
								purposes:
							</p>
							<ul>
								<li>
									<strong>Fulfillment:</strong> FreshTrak
									collects and uses your personal information
									to operate our Website and deliver the
									services you have requested.
								</li>
								<li>
									<strong>Advertising:</strong> We also use
									your information to present advertising
									online or through other communication
									channels, including through partnerships
									with social media platforms and internet
									search engines.
								</li>
								<li>
									<strong>Communications:</strong> We use your
									information to communicate with you, such as
									responding to your requests or asking for
									feedback through surveys or other messages.
								</li>
								<li>
									<strong>Website Experience:</strong> We may
									use your information to deliver customized
									content and advertising to you.
								</li>
								<li>
									<strong>Security:</strong> We may use your
									information to protect FreshTrak and our
									Website users from fraud, security threats,
									and other harmful activity.
								</li>
								<li>
									<strong>Legal Obligations: </strong> We will
									use your information to comply with legal
									and regulatory requirements and in
									connection with legal proceedings.
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</Fragment>
	);
};

export default PrivacyComponent;
