import React, { useEffect, useState, Fragment } from "react";

import mainLogo from "../../Assets/img/logo.png";
import closeIcon from "../../Assets/img/close.svg";
// import navBarIcon from "../../Assets/img/menu.svg";
import { Link } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
import localization from "../Localization/LocalizationComponent";
import { useDispatch } from "react-redux";
import { setCurrentLanguage } from "../../Store/languageSlice";
import CountryListComponent from "../Localization/countryListComponent";
import "semantic-ui-css/semantic.min.css";
import { Nav, Navbar } from "react-bootstrap";

import { RENDER_URL } from "../../Utils/Urls";

interface HeaderComponentProps {
	shortHeader?: string;
}

interface LanguageData {
	value: string;
}

declare global {
	interface Window {
		FB: {
			logout: () => void;
		};
		onscroll: (() => void) | null;
	}
}

const HeaderComponent: React.FC<HeaderComponentProps> = props => {
	const [navbarShrink, setNavbarShrink] = useState<string>("");
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
	const shortHeader = props.shortHeader || "";
	const dispatch = useDispatch();

	const change = (event: React.SyntheticEvent, data: LanguageData): void => {
		localization.setLanguage(data.value);
		dispatch(setCurrentLanguage(data.value));
	};

	const localIsLoggedIn = localStorage.getItem("isLoggedIn");
	const [showMobileMenu, setMobileMenu] = useState<boolean>(false);
	const FRESHTRAK_PARTNERS_URL = process.env.REACT_APP_FRESHTRAK_PARTNERS_URL;

	useEffect(() => {
		let localStorageLoggedIn = localStorage.getItem("isLoggedIn");
		if (localStorageLoggedIn === null || localStorageLoggedIn === "false") {
			setIsLoggedIn(false);
		} else {
			setIsLoggedIn(true);
		}

		window.onscroll = () => {
			if (window.pageYOffset > 100) {
				setNavbarShrink("navbar-shrink");
			} else {
				setNavbarShrink("");
			}
		};
	}, [localIsLoggedIn, isLoggedIn]);

	const logOut = (): void => {
		localStorage.setItem("isLoggedIn", "false");
		setIsLoggedIn(false);

		localStorage.removeItem("userToken");
		localStorage.removeItem("tokenExpiresAt");
		localStorage.removeItem("search_zip");
		window.FB.logout();
	};

	return (
		<Fragment>
			<Nav
				className={`navbar navbar-expand-md navbar-light fixed-top ${navbarShrink} ${shortHeader}`}
				id="mainNav"
			>
				<div className="container">
					<Navbar expand="md" className="w-100">
						<Navbar.Brand className="my-auto mobile-view">
							<span className="my-auto mobile-view">
								<Link to={RENDER_URL.ROOT_URL}>
									<img
										src={mainLogo}
										alt="FreshTrak"
										className="d-inline-block"
									/>{" "}
								</Link>
							</span>
							{/* Out of Scope */}
							{/* <button
                className="navbar-toggler mr-2"
                type="button"
                data-toggle="collapse"
                data-target="#navbarCollapse"
                onClick={() => setMobileMenu(true)}
              >
                <span className="navbar-toggler-icon">
                  <img src={navBarIcon} alt="UserLogo" className="img-fluid" />
                </span>
              </button> */}
						</Navbar.Brand>
						<Navbar.Toggle aria-controls="basic-navbar-nav" />
						{/* Out of Scope */}
						{/* <Navbar.Collapse
              id="navbarCollapse"
              className="justify-content-end"
            >
              <Nav className="navbar-nav small main-menu align-items-center">
                <NavDropdown
                  title="Find Resources"
                  aria-labelledby="dropdown01"
                >
                  <NavDropdown.Item
                    tag={Link}
                    to={RENDER_URL.FRESHTRAK_ABOUT}
                    className="dropdown-item"
                  >
                    About Freshtrak
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
              <Nav className="navbar-nav small  main-menu align-items-center">
                <NavDropdown
                  title="For Foodbanks"
                  aria-labelledby="dropdown01"
                >
                  <NavDropdown.Item
                    tag={Link}
                    to={RENDER_URL.FRESHTRAK_WORKING}
                    className="dropdown-item"
                  >
                    Working with Freshtrak
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Navbar.Collapse> */}

						{/* Out of Scope */}

						{/* {!isLoggedIn && (
              <LinkContainer to={RENDER_URL.SIGN_IN}>
                <Nav.Link href="" className="header-sign-in">
                    SIGN IN
                </Nav.Link>
              </LinkContainer>
            )}*/}
						{isLoggedIn && (
							<LinkContainer to={RENDER_URL.ROOT_URL}>
								<button
									type="submit"
									className="btn btn-link header-sign-in"
									onClick={logOut}
								>
									LOG OUT
								</button>
							</LinkContainer>
						)}
						{/* <div>
              <label>Select Language ?</label>
              <select onChange={change} value={language.language}>
                <option value= "en"> English </option>
                <option value= "spa"> Spanish </option>
                <option value= "som"> Somali </option>
                <option value= "rus"> Russian </option>
                <option value= "tur"> Turkish </option>
                <option value= "ara"> Arabic </option>
                <option value= "zho"> Chinese </option>
                <option value= "hin"> Hindi </option>
                <option value= "nep"> Nepali </option>
              </select>
            </div> */}
						<CountryListComponent change={change} />
					</Navbar>
				</div>
			</Nav>
			{/* Menu popup div */}
			{showMobileMenu && (
				<div id="menuSlider" className="mobile-menu fadeIn">
					<div className="d-flex h-100 justify-content-end flex-column">
						<div className="mobile-menu-items">
							<div className="menu-item-title">
								FIND RESOURCES
							</div>
							<ul className="mt-2">
								<li>
									<Link to={RENDER_URL.FRESHTRAK_ABOUT}>
										About FreshTrak
									</Link>
								</li>
							</ul>
						</div>
						<div className="mobile-menu-items mt-4 mb-4">
							<div className="menu-item-title">
								For Foodbanks & Agencies
							</div>
							<ul className="mt-2">
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
						<hr></hr>
						{/* Out of Scope */}
						{/* <div className="status-info"> */}
						{/* {isLoggedIn ? */}
						{/* <div className="user-avatar">
                <NavDropdown title={
                    <div className="d-flex align-items-center">
                        <span>
                        <img className="thumbnail-image" src={userIcon} alt="user pic" />
                    </span>
                    <span className="text-uppercase ml-2">MANAGE YOUR ACCOUNT</span>
                    </div> */}
						{/* }> */}
						{/* <DropdownItem eventKey={1.3} onClick={(() => { localStorage.removeItem('isLoggedIn', false); setIsLoggedIn(false); window.location.reload(); })}>
                        <i className="fa fa-sign-out"></i> Logout
                    </DropdownItem>
                </NavDropdown> */}
						{/* <div className="user-avatar">
                {isLoggedIn == false ? <LoggedInComponent/> : <SignInComponent/>} */}
						{/* 
            </div>
            :

            <button className="sign-in-button" onClick={() => setModalShow(true)}>
                Sign In
                </button>}
            </div> */}
					</div>
					<button
						className="mobile-close"
						onClick={() => setMobileMenu(false)}
					>
						<img alt="close menu" src={closeIcon} />
					</button>
				</div>
			)}
		</Fragment>
	);
};

export default HeaderComponent;
