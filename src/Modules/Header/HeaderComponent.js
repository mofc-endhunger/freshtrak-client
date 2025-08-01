import React, { useEffect, useState, Fragment } from "react";

import mainLogo from "../../Assets/img/logo.png";
import closeIcon from "../../Assets/img/close.svg";
// import navBarIcon from "../../Assets/img/menu.svg";
import { Link } from "react-router-dom";
import localization from "../Localization/LocalizationComponent";
import { useDispatch } from "react-redux";
import { setCurrentLanguage } from "../../Store/languageSlice";
import CountryListComponent from "../Localization/countryListComponent";

import { RENDER_URL } from "../../Utils/Urls";
const HeaderComponent = props => {
	const [navbarShrink, setNavbarShrink] = useState("");
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const dispatch = useDispatch();
	const change = (event, data) => {
		localization.setLanguage(data.value);
		dispatch(setCurrentLanguage(data.value));
	};
	const localIsLoggedIn = localStorage.getItem("isLoggedIn");
	const [showMobileMenu, setMobileMenu] = useState(false);
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

	const logOut = () => {
		localStorage.setItem("isLoggedIn", false);
		setIsLoggedIn(false);

		localStorage.removeItem("userToken");
		localStorage.removeItem("tokenExpiresAt");
		localStorage.removeItem("search_zip");
		// window.FB.logout() // Removed Facebook logout
	};

	return (
		<Fragment>
			<nav
				className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300  ${
					navbarShrink === "navbar-shrink"
						? "bg-primary shadow-lg"
						: ""
				}`}
				style={{
					boxShadow:
						navbarShrink === "navbar-shrink"
							? "0 4px 8px #28ce85"
							: "",
				}}
				id="mainNav"
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16 relative">
						{/* Logo - centered on desktop, left-aligned on mobile */}
						<div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
							<Link
								to={RENDER_URL.ROOT_URL}
								className="flex items-center"
							>
								<img
									src={mainLogo}
									alt="FreshTrak"
									className="h-6 md:h-8 w-auto"
								/>
							</Link>
						</div>

						<div className="flex items-center space-x-2 md:space-x-4 ml-auto w-full justify-end">
							{isLoggedIn && (
								<button
									type="button"
									className="text-white font-bold text-xs md:text-sm hover:text-white focus:outline-none"
									onClick={logOut}
								>
									LOG OUT
								</button>
							)}
							<CountryListComponent change={change} />
						</div>
					</div>
				</div>
			</nav>
			{/* Menu popup div */}
			{showMobileMenu && (
				<div
					className="fixed inset-0 z-50 bg-primary bg-cover bg-center bg-no-repeat animate-fadeIn"
					style={{
						backgroundImage:
							"url(../../Assets/img/mobile-menu-bg.svg)",
					}}
				>
					<div className="flex flex-col h-full justify-end p-8">
						<div className="text-white">
							<div className="text-xs font-semibold uppercase tracking-wider mb-4">
								FIND RESOURCES
							</div>
							<ul className="mt-2 space-y-2">
								<li>
									<Link
										to={RENDER_URL.FRESHTRAK_ABOUT}
										className="text-white text-lg font-semibold"
									>
										About FreshTrak
									</Link>
								</li>
							</ul>
						</div>
						<div className="text-white mt-8 mb-4">
							<div className="text-xs font-semibold uppercase tracking-wider mb-4">
								For Foodbanks & Agencies
							</div>
							<ul className="mt-2 space-y-2">
								<li>
									<a
										href={FRESHTRAK_PARTNERS_URL}
										target="_blank"
										rel="noopener noreferrer"
										className="text-white text-lg font-semibold"
									>
										FreshTrak: Partner
									</a>
								</li>
							</ul>
						</div>
						<hr className="border-white border-2 w-full my-4" />
						{/* Out of Scope */}
						{/* <div className="status-info"> */}
						{/* {isLoggedIn ? */}
						{/* <div className="user-avatar"> */}
						{/* <NavDropdown title={ */}
						{/* <div className="d-flex align-items-center"> */}
						{/* <span> */}
						{/* <img className="thumbnail-image" src={userIcon} alt="user pic" /> */}
						{/* </span> */}
						{/* <span className="text-uppercase ml-2">MANAGE YOUR ACCOUNT</span> */}
						{/* </div> */}
						{/* }> */}
						{/* <DropdownItem eventKey={1.3} onClick={(() => { localStorage.removeItem('isLoggedIn', false); setIsLoggedIn(false); window.location.reload(); })}> */}
						{/* <i className="fa fa-sign-out"></i> Logout */}
						{/* </DropdownItem> */}
						{/* </NavDropdown> */}
						{/* <div className="user-avatar"> */}
						{/* {isLoggedIn == false ? <LoggedInComponent/> : <SignInComponent/>} */}
						{/*  */}
						{/* </div> */}
						{/* : */}

						{/* <button className="sign-in-button" onClick={() => setModalShow(true)}> */}
						{/* Sign In */}
						{/* </button>} */}
						{/* </div> */}
					</div>
					<button
						className="absolute top-5 right-5 bg-transparent border-none"
						onClick={() => setMobileMenu(false)}
					>
						<img
							alt="close menu"
							src={closeIcon}
							className="w-6 h-6"
						/>
					</button>
				</div>
			)}
		</Fragment>
	);
};

export default HeaderComponent;
