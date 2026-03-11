import React, { useEffect, useState, Fragment } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import mainLogo from "../../Assets/img/logo.png";
import localization from "../Localization/LocalizationComponent";
import { setCurrentLanguage, selectLanguage } from "../../Store/languageSlice";
import CountryListComponent from "../Localization/countryListComponent";
import { useAuth } from "../Authentication/AuthContext";
import { StorageService } from "../../Utils/StorageService";
import { Button } from "../../components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../../components/ui/dialog";
import UserAccountButton from "./components/UserAccountButton";

import { RENDER_URL } from "../../Utils/Urls";
import {
	HeaderComponentProps,
	PageType,
	MobileMenuSection,
} from "./types/header.types";
import config from "../../config";

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
	const currentLanguage = useSelector(selectLanguage);
	const location = useLocation();
	const navigate = useNavigate();
	const { isAuthenticated, user } = useAuth();

	const FRESHTRAK_PARTNERS_URL = config.FRESHTRAK_PARTNERS_URL;

	/**
	 * Determines the current page type for background color logic
	 * @returns {PageType} The type of page (main, search, login, or other)
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

		// Login page
		if (pathname === "/login") {
			return "login" as PageType;
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
		// Main page, search results, and login page: transparent initially, background on scroll
		if (
			pageType === "main" ||
			pageType === "search" ||
			pageType === "login"
		) {
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

	// Keep localization singleton in sync with the persisted Redux language
	// (covers page refresh: Redux restores from localStorage, this sets the strings)
	useEffect(() => {
		if (currentLanguage && currentLanguage !== "en") {
			localization.setLanguage(currentLanguage);
		}
	}, [currentLanguage]);

	useEffect(() => {
		// Check authentication status - check for cognitoUser and valid token
		// Only set isLoggedIn to true for Cognito users with valid tokens
		// Guest users and untracked users should see the login button
		setIsLoggedIn(StorageService.isLoggedInUser());

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
	}, [isAuthenticated, user]);

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
			title: localization.footer_find_resources.toUpperCase(),
			items: [
				{
					text: "About FreshTrak",
					url: RENDER_URL.FRESHTRAK_ABOUT,
				},
			],
		},
		{
			title: localization.footer_for_foodbanks_agencies,
			items: [
				{
					text: localization.footer_freshtrak_partner,
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
						? "0 4px 8px #28CE85"
						: "",
					overflow: "visible",
				}}
				id="mainNav"
			>
				<div
					className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
					style={{ overflow: "visible" }}
				>
					<div
						className="flex items-center justify-between h-16 relative"
						style={{ overflow: "visible" }}
					>
						{/* Logo - centered on desktop, left-aligned on mobile */}
						<div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
							<Link
								to={RENDER_URL.ROOT_URL}
								className="flex items-center"
							>
								<img
									src={mainLogo}
									alt={localization.alt_freshtrak_logo}
									className="h-6 md:h-8 w-auto"
								/>
							</Link>
						</div>

						<div className="flex items-center space-x-2 md:space-x-4 ml-auto w-full justify-end">
							<CountryListComponent change={change} currentLanguage={currentLanguage} />
							{/* Show authentication buttons on all pages except login page */}
							{!isLoginPage && (
								<>
									{!isLoggedIn ? (
										<Button
											type="button"
											variant="ghost"
											className="text-white font-bold text-xs md:text-sm hover:text-white focus:outline-none"
											onClick={() =>
												navigate(RENDER_URL.LOGIN_URL)
											}
										>
											{localization.button_sign_in.toUpperCase()}
										</Button>
									) : (
										<>
											{/* Show user account button for all authenticated users */}
											<UserAccountButton />
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
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="md:hidden text-white hover:bg-white/10"
										aria-label={
											localization.aria_open_mobile_menu
										}
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
									</Button>
								</DialogTrigger>
								<DialogContent className="w-[300px] bg-primary text-white border-none">
									<DialogHeader>
										<DialogTitle className="text-white">
											{localization.title_menu}
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
