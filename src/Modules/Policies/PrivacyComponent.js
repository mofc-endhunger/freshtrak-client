import React, { Fragment } from 'react';
import NavigationBtnComponent from "../General/NavigationBtnComponent";
import { withRouter } from 'react-router-dom';
import '../../Assets/scss/main.scss';

const PrivacyComponent = props => {
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
      <div class= "privacy">
        <h2 className="font-weight-bold mobile-text-left">
        <center>FreshTrak Privacy Policy</center>
        </h2>
        <p className="mobile-text-left caption-text">Effective Date: January 01, 2021</p>
        <p className="mobile-text-left caption-text">
        Your privacy is very important to us. Accordingly, we have developed this Privacy Policy in order for you
        to understand how we collect, use, communicate, and disclose your personal information. This Privacy
        Policy applies to our Website and to our communications with you. Throughout this Policy, we may refer
        to FreshTrak as “we,” “us,” or “our.” “Website” refers to https://freshtrak.com/ and any other
        microsites or mobile websites we operate or use.
        </p>
        <h4 className="mb-2 medium-title font-weight-bold">
        Information We Collect
        </h4>
        <p className="mobile-text-left caption-text">
        When you visit our Website, certain information may be collected about you. This information can
        include: 
        </p>
        <ul>
          <li>
          <strong>Device Information:</strong> When you visit our Website, we learn about your IP address, browser type, domain names, access times, and referring website addresses. 
          </li>
          <li>
          <strong>Website Interactions:</strong> We also keep track of the websites and pages users visit within our Website in order to determine what services are the most popular.  
          </li>
          <li>
          <strong>Contact Information:</strong> We may collect personal information you voluntarily provide to us including your name, email address, and phone number.
          </li>
          <li>
          <strong>Call or Email Records:</strong> If you call or email the numbers provided on the Website, we may keep records of those conversations.   
          </li>
          <li>
          <strong>Demographic Information: </strong> We have access to demographic details about our customers like birthdate, gender, ZIP code, and other similar details.
          </li>
          <li>
          <strong>Submitted Content: </strong> We collect any content you submit to the Website, including photos, videos, or comments.
          </li>
        </ul>
      <h4 className="mb-2 medium-title font-weight-bold">
      How We Collect Your Information
      </h4>
      <p className="mobile-text-left caption-text">
      We may collect information directly from you, from third parties we partner with, or through cookies or other automated means. These sources may include: 
      </p>
        <ul>
          <li>
          <strong>You:</strong> We collect information from you, whenever you: visit our Website; contact us with questions; upload content to our Website; or fill out any forms on our Website.
          </li>
          <li>
          <strong>Your Device or Browser:</strong> Certain information is automatically collected from your device or browser and analyzed when you visit our Website or open our emails. 
          </li>
          <li>
          <strong>Third Parties:</strong> We work with third parties who provide services to us, such as analytics or advertising companies. These third parties share information they have collected with us. Your information may also be collected by third parties, who will process your information independently in accordance with their own privacy notices.
          </li>
          <li>
          <strong>Social Media Platforms:</strong>Social media platforms may share information with us. You can learn more about how social media platforms collect and use your information by reviewing their privacy policies and settings. 
          </li>
          <li>
          <strong>Cookies:</strong>  FreshTrak uses cookies (small files stored on your device or browser) and other similar technologies to automatically collect information when you visit our Website or interact with our emails. Through the use of cookies, we may link information about your interactions with our Website over time. We also contract with third party advertising or analytics companies to serve you online ads on other websites. These companies use cookies or similar technologies to collect information about your interactions with our Website and interactions with other websites. These advertising companies may use and share the information gathered to deliver ads more tailored to your interests. We receive aggregate information from these third parties to understand our advertising effectiveness. Any information collected by us or by third parties through the use of cookies or similar technologies may be linked with other information we collect about you.
          </li>
          <li>
          <strong>Submitted Content: </strong> We collect any content you submit to the Website, including photos, videos, or comments.
          </li>
        </ul>
        <h4 className="mb-2 medium-title font-weight-bold">
        Use of Your Personal Information
        </h4>
        <p className="mobile-text-left caption-text">
        We may use your information for the following purposes:
        </p>
        <ul>
          <li>
          <strong>Fulfillment:</strong> FreshTrak collects and uses your personal information to operate our Website and deliver the services you have requested.
          </li>
          <li>
          <strong>Advertising:</strong> We also use your information to present advertising online or through other communication channels, including through partnerships with social media platforms and internet search engines.
          </li>
          <li>
          <strong>Communications:</strong> We use your information to communicate with you, such as responding to your requests or asking for feedback through surveys or other messages.
          </li>
          <li>
          <strong>Website Experience:</strong> We may use your information to deliver customized content and advertising to you.
          </li>
          <li>
          <strong>Security:</strong> We may use your information to protect FreshTrak and our Website users from fraud, security threats, and other harmful activity.
          </li>
          <li>
          <strong>Legal Obligations: </strong> We will use your information to comply with legal and regulatory requirements and in responding to requests from courts or other government bodies.
          </li>
        </ul>
        <h4 className="mb-2 medium-title font-weight-bold">
        How We Share Your Information
        </h4>
      <p className="mobile-text-left caption-text">
        We may share personal information with:
      </p>
      <ul>
          <li>
          <strong>Service and Marketing Providers:</strong> We partner with third parties to assist with the operation of our Website, including fulfilling requests, advertising, analyzing your interests and activity on our Website, and helping us communicate with you. These third parties may provide services related to the purposes described above, and we may share with them any types of information described in Information We Collect. We may also receive information collected by these third parties and combine it with information we have collected. Your information may also be collected and processed by third parties who will process your information independently in accordance with their own privacy policies.
          </li>
          <li>
          <strong>Other Third Parties:</strong> We will disclose your personal information, without notice, if required to do so by law or in the good faith belief that such action is necessary to: (a) conform to the edicts of the law or comply with legal process served on FreshTrak; (b) protect and defend the rights or property of FreshTrak; and, (c) act under exigent circumstances to protect the personal safety of users of FreshTrak or the public.
          </li>
        </ul>
        <h4 className="mb-2 medium-title font-weight-bold">
        Your Privacy Choices
        </h4>
      <p className="mobile-text-left caption-text">
        You can control the information we collect and use in the following ways:
      </p>
      <ul>
          <li>
          <strong>Location Information:</strong> You can disable location-based services on your mobile device or web browser by adjusting the settings on your device or browser. This will prevent our Website from accessing your location information. Note that some services may not be available if you disable location-based services.
          </li>
          <li>
          <strong>Online Advertising:</strong>  For information about opting out of third party advertising, visit: NAI Opt-Out and DAA Opt-Out (you will leave this Website for a separately managed online site where you can specify your preference under those programs). You can also click on the icon that may appear on some of our advertising served through these technologies. We may use more than one third party company for placing this advertising, which would require you to opt out of each company.
          </li>
        </ul>
        <h4 className="mb-2 medium-title font-weight-bold">
        Children’s Privacy
        </h4>
      <p className="mobile-text-left caption-text">
        Our Website is not intended for children under the age of 13. No one under 13 should share any personal information with us. We do not knowingly collect any personal information from children under 13. If we learn that we have collected the personal information of a child under the age of 13, we will make reasonable efforts to delete that information from our records. To request deletion of personal information relating to a child under 13, please email us at freshtrak@midohiofoodbank.org.
      </p>
      <h4 className="mb-2 medium-title font-weight-bold">
        Supported Web Browsers and Do Not Track Signals
        </h4>
      <p className="mobile-text-left caption-text">
        We recommend that you use the latest web browser versions to optimize your experience. Older web browser versions may not be able to access or utilize all pages on our website as intended. We may not be able to receive or honor “Do Not Track” signals and our Website may continue to collect information in the manner described within this privacy notice.
      </p>
      <h4 className="mb-2 medium-title font-weight-bold">
      External Links
        </h4>
      <p className="mobile-text-left caption-text">
        Our Website may enable you to navigate to third-party websites through links on our Websites. We do this for your convenience. We do not endorse, may not have any affiliation with, do not control, and are not responsible for those third-party websites and/or their Internet and web practices. We encourage you to review the privacy statements of websites you choose to link to from our Website so that you can understand how those websites collect, use and share your information.
      </p>
      <h4 className="mb-2 medium-title font-weight-bold">
      Security
        </h4>
      <p className="mobile-text-left caption-text">
        We take steps to help protect the confidentiality and security of your information. Although we use measures to protect your information, in general, information transmitted through the Internet may not be completely secure. Accordingly, we cannot guarantee the security of information provided over the Internet or stored in our databases. Your transmissions are, therefore, at your own risk.
      </p>
      <h4 className="mb-2 medium-title font-weight-bold">
      Contact Information
        </h4>
      <p className="mobile-text-left caption-text">
        Please send your privacy-related questions, comments, and concerns to us via email at freshtrak@midohiofoodbank.org. 
      </p>
      <h4 className="mb-2 medium-title font-weight-bold">
      Changes to this Statement
        </h4>
      <p className="mobile-text-left caption-text">
        We will make updates to our privacy practices from time to time. If we make any material changes to our privacy practices, we will update this privacy notice and change the effective date at the top of this page.
      </p>
   </div>
  </div>
 </div>
</div>
    </Fragment>
  );
};

export default withRouter(PrivacyComponent);
