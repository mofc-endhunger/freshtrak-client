/**
 * About FreshTrak
 * 
 */
import React from "react";
import MainHeadingComponent from "../General/MainHeadingComponent";
import NavigationBtnComponent from "../General/NavigationBtnComponent";
import "../../Assets/scss/main.scss";
// import ButtonComponent from "../General/ButtonComponent";
import ExpectImage from "../../Assets/img/freshTrak.jpg";
import ExpectImageMobile from "../../Assets/img/freshTrak-mobile.jpg";

const AboutFreshTrakComponent = () => {
  return (
    <React.Fragment>
       <section>
       <div className="container pt-100 pb-100 register-confirmation">
          <div className="row d-none-xs">
            <div className="col-md-12">
              <NavigationBtnComponent />
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <MainHeadingComponent text="Taking Our Community Online" />
            </div>
          </div>
          <div className="row mt-3">
           <div className="col-12">
           <div className="mb-2 medium-title font-weight-bold">
              FreshTrak is a new resource for finding food, clothing, and other
              assistance in your local area.
            </div>
            <p className="mobile-text-left caption-text">
              Built by the Mid-Ohio Foodbank, we’re working to make it easier
              for you to support your family whenever and wherever we can. For
              nearly 40 years we’ve been helping our friends and neighbors stay
              fed through local action. FreshTrak is our way of using the
              promise of the internet to speed up the line, provide options that
              better fit your family’s needs, and respond faster in times of
              crisis.
            </p>
           </div>
          </div>
        </div>
        <div className="info-banner">
          <img
            alt="Your resource for finding food"
            src={ExpectImage}
            className="img-fluid desktop-view"
          />
          <img
            alt="Your resource for finding food"
            src={ExpectImageMobile}
            className="img-fluid mobile-view"
          />
        </div>
       </section>
        <section className="gray-bg">
          <div className="container pt-150 pb-150">
            <div className="row">
              <div className="col-md-12">
                <h2 className="mb-2 font-weight-bold mobile-text-left text-center"> With FreshTrak, You Can Expect</h2>
                <div className="mobile-text-left caption-text text-center">
                  <ul className="custom-list font-weight-bold">
                    <li>Local resources, staffed with members from your own community.</li>
                    <li>A commitment to your privacy.</li>
                    <li>Service wthout Judgement.</li>
                  </ul>
                </div>                
              </div>
            </div>
            <div className="row mt-5 text-center">
            <div className="col-12">
            {/* Out of Scope */}
            {/* No action event specified for button. onClickfunction is specified as it is mandatory */}
            {/* <ButtonComponent
                  type="button"
                  name="findFood"
                  dataid=""
                  id="find-food"
                  value="Find Food In Your Area"
                  className="btn custom-button"
                  onClickfunction={()=>{}}
                /> */}
            </div>
            </div>
          </div>
        </section>
        <section>
        <div className="container pt-100 pb-100 register-confirmation">
          <div className="row">
          <div className="col-12">
          <h2 className="mb-2 font-weight-bold mobile-text-left text-center">Our goal is to end hunger. </h2>
          <p className="mobile-text-left  text-center caption-text">
              We get there by listening to our neighbors, understanding their
              needs, and being available when you need us the most. If you’d
              like to know more about the Mid-Ohio Foodbank and our mission,
              please visit us at{" "}
              <span>
                <a
                  href="http://www.midohiofoodbank.com/"
                  className="color-green"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                    www.midohiofoodbank.org
                </a>
              </span>
              .
            </p>
          </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default AboutFreshTrakComponent;
