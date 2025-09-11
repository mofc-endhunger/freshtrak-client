import React, { useEffect, useState, Fragment } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import mainLogo from "../../Assets/img/logo.png";
import localization from "../Localization/LocalizationComponent";
import { setCurrentLanguage } from "../../Store/languageSlice";
import CountryListComponent from "../Localization/countryListComponent";
import { useAuth } from "../Authentication/AuthContext";
import { Button } from "../../components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../../components/ui/dialog";

import { RENDER_URL } from "../../Utils/Urls";
import {
	HeaderComponentProps,
	PageType,
	MobileMenuSection,
} from "./types/header.types";

/**
 * HeaderComponent - Main header component with navigation and mobile menu
 *
 * This component provides the main navigation header with:
 * - Logo and navigation links
 * - Language/country selector
 * - Logout functionality for authenticated users
 * - Mobile-responsive design with mobile menu
 * - Page-specific background color behavior
 *
 * @component
 * @param {HeaderComponentProps} props - Component props
 * @returns {JSX.Element} The main header navigation component
 *
 * @example
 * ```tsx
 * <HeaderComponent shortHeader="navbar-green" />
 * ```
 */
const HeaderComponent: React.FC<HeaderComponentProps> = ({ shortHeader }) => {
	const [navbarShrink, setNavbarShrink] = useState<string>("");
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
	const [showMobileMenu, setMobileMenu] = useState<boolean>(false);
	const dispatch = useDispatch();
	const location = useLocation();
	const navigate = useNavigate();
	const { isAuthenticated, signOut, user } = useAuth();

	const FRESHTRAK_PARTNERS_URL = process.env.REACT_APP_FRESHTRAK_PARTNERS_URL;

	/**
	 * Determines the current page type for background color logic
	 * @returns {PageType} The type of page (main, search, or other)
	 */
	const getPageType = (): PageType => {
		const { pathname } = location;

		// Main page (dashboard)
		if (pathname === RENDER_URL.ROOT_URL) {
			return "main";
		}

		// Search results page
		if (pathname.startsWith("/events/list")) {
			return "search";
		}

		// All other pages
		return "other";
	};

	/**
	 * Determines if the header should show background color
	 * @param {PageType} pageType - Current page type
	 * @param {boolean} isScrolled - Whether the page is scrolled
	 * @returns {boolean} True if background should be visible
	 */
	const shouldShowBackground = (
		pageType: PageType,
		isScrolled: boolean
	): boolean => {
		// Main page and search results: transparent initially, background on scroll
		if (pageType === "main" || pageType === "search") {
			return isScrolled;
		}

		// All other pages: always show background
		return true;
	};

	/**
	 * Handles language change for localization
	 * @param {any} event - Change event
	 * @param {any} data - Language data
	 */
	const change = (event: any, data: { value: string }): void => {
		localization.setLanguage(data.value);
		dispatch(setCurrentLanguage(data.value));
	};

	/**
	 * Handles user logout
	 */
	const logOut = async (): Promise<void> => {
		try {
			await signOut();
			setIsLoggedIn(false);
			localStorage.setItem("isLoggedIn", "false");
			localStorage.removeItem("userToken");
			localStorage.removeItem("guestId");
			localStorage.removeItem("guestType");
			localStorage.removeItem("search_zip");
			// Redirect to landing page after logout
			navigate("/");
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	useEffect(() => {
		// Check authentication status - use both Cognito auth and localStorage
		const localStorageLoggedIn = localStorage.getItem("isLoggedIn");
		const isCognitoAuthenticated = isAuthenticated;

		if (localStorageLoggedIn === "true" || isCognitoAuthenticated) {
			setIsLoggedIn(true);
		} else {
			setIsLoggedIn(false);
		}

		// Handle scroll events for background color logic
		const handleScroll = (): void => {
			const isScrolled = window.pageYOffset > 100;
			setNavbarShrink(isScrolled ? "navbar-shrink" : "");
		};

		window.addEventListener("scroll", handleScroll);

		// Cleanup event listener
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [isAuthenticated]);

	// Get current page type and background state
	const pageType = getPageType();
	const isScrolled = navbarShrink === "navbar-shrink";
	const shouldShowBackgroundColor = shouldShowBackground(
		pageType,
		isScrolled
	);

	// Check if we're on the login page
	const isLoginPage = location.pathname === "/login";

	// Mobile menu sections
	const mobileMenuSections: MobileMenuSection[] = [
		{
			title: "FIND RESOURCES",
			items: [
				{
					text: "About FreshTrak",
					url: RENDER_URL.FRESHTRAK_ABOUT,
				},
			],
		},
		{
			title: "For Foodbanks & Agencies",
			items: [
				{
					text: "FreshTrak: Partner",
					url: FRESHTRAK_PARTNERS_URL || "#",
					isExternal: true,
					target: "_blank",
				},
			],
		},
	];

	return (
		<Fragment>
			<nav
				className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
					shouldShowBackgroundColor ? "bg-primary shadow-lg" : ""
				}`}
				style={{
					boxShadow: shouldShowBackgroundColor
						? "0 4px 8px #b9b9b9"
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
							<CountryListComponent change={change} />
							{/* Show authentication buttons on all pages except login page */}
							{!isLoginPage && (
								<>
									{!isLoggedIn ? (
										<Button
											type="button"
											variant="ghost"
											className="text-white font-bold text-xs md:text-sm hover:text-white focus:outline-none"
											onClick={() => navigate("/login")}
										>
											LOG IN
										</Button>
									) : (
										<>
											{/* Show user name and logout only for authenticated users (not guests) */}
											{user?.name &&
												user?.name !== user?.email && (
													<span className="text-white font-medium text-xs md:text-sm">
														{user.name}
													</span>
												)}
											{/* Only show logout button for authenticated users, not guests */}
											{user?.name &&
												user?.name !== user?.email && (
													<Button
														type="button"
														variant="ghost"
														className="text-white font-bold text-xs md:text-sm hover:text-white focus:outline-none"
														onClick={logOut}
													>
														LOG OUT
													</Button>
												)}
										</>
									)}
								</>
							)}

							{/* Mobile menu trigger */}
							<Dialog
								key={showMobileMenu ? "open" : "closed"}
								open={showMobileMenu}
								onOpenChange={setMobileMenu}
							>
								<DialogTrigger asChild>
									<button
										className="md:hidden text-white p-2 hover:bg-white/10 rounded-md transition-colors"
										aria-label="Open mobile menu"
									>
										<svg
											className="w-6 h-6"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M4 6h16M4 12h16M4 18h16"
											/>
										</svg>
									</button>
								</DialogTrigger>
								<DialogContent className="w-[300px] bg-primary text-white border-none">
									<DialogHeader>
										<DialogTitle className="text-white">
											Menu
										</DialogTitle>
										<DialogDescription></DialogDescription>
									</DialogHeader>
									<div className="mt-6 space-y-6">
										{mobileMenuSections.map(
											(section, sectionIndex) => (
												<div key={sectionIndex}>
													<div className="text-xs font-semibold uppercase tracking-wider mb-4">
														{section.title}
													</div>
													<ul className="space-y-2">
														{section.items.map(
															(
																item,
																itemIndex
															) => (
																<li
																	key={
																		itemIndex
																	}
																>
																	{item.isExternal ? (
																		<a
																			href={
																				item.url
																			}
																			target={
																				item.target
																			}
																			rel="noopener noreferrer"
																			className="text-white text-lg font-semibold hover:text-gray-200 transition-colors"
																		>
																			{
																				item.text
																			}
																		</a>
																	) : (
																		<Link
																			to={
																				item.url
																			}
																			className="text-white text-lg font-semibold hover:text-gray-200 transition-colors"
																			onClick={() =>
																				setMobileMenu(
																					false
																				)
																			}
																		>
																			{
																				item.text
																			}
																		</Link>
																	)}
																</li>
															)
														)}
													</ul>
												</div>
											)
										)}
									</div>
								</DialogContent>
							</Dialog>
						</div>
					</div>
				</div>
			</nav>
		</Fragment>
	);
};

export default HeaderComponent;
