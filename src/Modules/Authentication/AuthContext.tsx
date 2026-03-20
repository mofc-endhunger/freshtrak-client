import React, { createContext, useContext, useEffect, useState } from "react";
import {
	signIn,
	signUp,
	confirmSignUp,
	signOut,
	resetPassword,
	confirmResetPassword,
	resendSignUpCode,
	fetchUserAttributes,
	fetchAuthSession,
} from "aws-amplify/auth";
import { AuthContextType } from "./types/authentication.types";
import { StorageService, CognitoUser } from "../../Utils/StorageService";
import { persistor } from "../../Store/store";
import { useDispatch } from "react-redux";
import { setCurrentLanguage } from "../../Store/languageSlice";
import { setLanguage } from "../Localization/localizationUtils";
import { getLanguageOptionById } from "../Localization/languageOptions";
import { HouseholdsApiService } from "../../Services/HouseholdsApiService";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
	children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const dispatch = useDispatch();
	const [user, setUser] = useState<any | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	// Whether the user needs to complete household setup (null = not yet determined)
	const [needsHouseholdSetup, setNeedsHouseholdSetup] = useState<
		boolean | null
	>(null);

	// Check if user is authenticated
	const isAuthenticated = !!user;

	// Initialize auth state
	useEffect(() => {
		const initAuth = async () => {
			try {
				// Check for stored Cognito user using StorageService
				const storedUser = StorageService.getCognitoUser();
				if (storedUser) {
					setUser(storedUser);
				}
			} catch (error) {
				console.error("Error initializing auth:", error);
			} finally {
				setIsLoading(false);
			}
		};

		initAuth();
	}, []);

	const handleSignIn = async (
		email: string,
		password: string,
	): Promise<void> => {
		try {
			setIsLoading(true);

			// Clear guest authentication data BEFORE attempting Cognito sign in
			// This prevents "There is already a signed in user" error when switching from guest to Cognito
			const isGuestUser = StorageService.isGuestUser();
			if (isGuestUser) {
				StorageService.clearUserToken();
				StorageService.removeItem("guestId");
				StorageService.removeItem("guestType");
				StorageService.removeItem("userProfile");
				// Also clear any guest session data that might interfere
				StorageService.removeItem("freshtrak_user_guest");
			}

			// Check for existing Amplify session and sign out if present
			// This prevents "There is already a signed in user" error from AWS Amplify
			try {
				const existingSession = await fetchAuthSession();
				if (
					existingSession.tokens &&
					Object.keys(existingSession.tokens).length > 0
				) {
					// There's an existing session, sign out first
					try {
						await signOut();
					} catch (signOutError) {
						// Ignore sign out errors - session might already be invalid
						console.warn(
							"Could not sign out existing session:",
							signOutError,
						);
					}
				}
			} catch (sessionError) {
				// No existing session or error fetching it - proceed with sign in
				console.warn("Could not check existing session:", sessionError);
			}

			// Use Amplify sign in
			// Wrap in try-catch to catch errors immediately (including 400 Bad Request)
			let result;
			try {
				result = await signIn({
					username: email,
					password,
				});

				// Check if sign-in actually succeeded
				if (!result.isSignedIn) {
					// Sign-in didn't succeed but didn't throw - check nextStep to determine why
					console.warn(
						"Sign-in returned but isSignedIn is false:",
						result,
					);

					// Check if nextStep indicates confirmation is needed
					const nextStep = result.nextStep;
					const signInStep = nextStep?.signInStep;
					const needsConfirmation =
						signInStep === "CONFIRM_SIGN_IN_WITH_SMS_CODE" ||
						signInStep === "CONFIRM_SIGN_IN_WITH_TOTP_CODE" ||
						signInStep === "CONFIRM_SIGN_IN_WITH_EMAIL_CODE" ||
						(signInStep &&
							String(signInStep).includes("CONFIRM")) ||
						(nextStep as any)?.codeDeliveryDetails !== undefined;

					if (needsConfirmation) {
						const unconfirmedError: any = new Error(
							"User account is not confirmed. Please verify your email address.",
						);
						unconfirmedError.name = "UserNotConfirmedException";
						unconfirmedError.code = "UserNotConfirmedException";
						unconfirmedError.originalError = result;
						unconfirmedError.isUnconfirmedUser = true;
						throw unconfirmedError;
					}

					// If we can't determine the reason, treat as potential unconfirmed user
					// (since 400 Bad Request often means unconfirmed user)
					const unconfirmedError: any = new Error(
						"User account is not confirmed. Please verify your email address.",
					);
					unconfirmedError.name = "UserNotConfirmedException";
					unconfirmedError.code = "UserNotConfirmedException";
					unconfirmedError.originalError = result;
					unconfirmedError.isUnconfirmedUser = true;
					throw unconfirmedError;
				}
			} catch (signInError: any) {
				// Check for unconfirmed user error in the caught error
				// AWS Amplify v6 might wrap errors in different ways
				const errorMessage =
					signInError?.message ||
					signInError?.cause?.message ||
					signInError?.underlyingError?.message ||
					signInError?.toString() ||
					"";
				const errorName =
					signInError?.name ||
					signInError?.__type ||
					signInError?.cause?.name ||
					signInError?.underlyingError?.name ||
					"";
				const errorCode =
					signInError?.code ||
					signInError?.cause?.code ||
					signInError?.underlyingError?.code ||
					"";

				// Check for HTTP status codes that might indicate unconfirmed user
				const httpStatus =
					signInError?.response?.status ||
					signInError?.status ||
					signInError?.cause?.status ||
					signInError?.underlyingError?.status;

				const isUnconfirmedUserError =
					errorName === "UserNotConfirmedException" ||
					errorCode === "UserNotConfirmedException" ||
					signInError?.__type === "UserNotConfirmedException" ||
					errorMessage.includes("UserNotConfirmedException") ||
					errorMessage.includes("User is not confirmed") ||
					errorMessage
						.toLowerCase()
						.includes("user needs to be confirmed") ||
					errorMessage.toLowerCase().includes("not confirmed") ||
					errorMessage
						.toLowerCase()
						.includes("user is not confirmed") ||
					errorMessage
						.toLowerCase()
						.includes("account is not confirmed") ||
					// 400 Bad Request from Cognito often means unconfirmed user
					httpStatus === 400 ||
					(errorMessage.includes("400") &&
						errorMessage.toLowerCase().includes("bad request"));

				// If we get a 400 error and can't determine it's NOT an unconfirmed user, treat it as such
				// This is a safety measure - 400 from Cognito sign-in often means unconfirmed user
				if (
					httpStatus === 400 &&
					!errorMessage.toLowerCase().includes("invalid") &&
					!errorMessage.toLowerCase().includes("incorrect")
				) {
					const unconfirmedError: any = new Error(
						"User account is not confirmed. Please verify your email address.",
					);
					unconfirmedError.name = "UserNotConfirmedException";
					unconfirmedError.code = "UserNotConfirmedException";
					unconfirmedError.originalError = signInError;
					unconfirmedError.isUnconfirmedUser = true;
					throw unconfirmedError;
				}

				if (isUnconfirmedUserError) {
					const unconfirmedError: any = new Error(
						errorMessage || "User account is not confirmed",
					);
					unconfirmedError.name =
						errorName || "UserNotConfirmedException";
					unconfirmedError.code = errorCode;
					unconfirmedError.originalError = signInError;
					unconfirmedError.isUnconfirmedUser = true;
					throw unconfirmedError;
				}

				// Re-throw the error to be caught by outer catch block
				throw signInError;
			}

			// Get access token from Amplify session
			let accessToken: string | undefined;
			if (result.isSignedIn) {
				try {
					const session = await fetchAuthSession();
					if (session.tokens?.accessToken) {
						accessToken = session.tokens.accessToken.toString();
					}
				} catch (sessionError) {
					console.warn(
						"Could not fetch session tokens:",
						sessionError,
					);
				}
			}

			if (result.isSignedIn) {
				// Get user name from multiple sources
				// Clear guest authentication data when logging in with Cognito
				StorageService.clearUserToken();
				StorageService.removeItem("guestId");
				StorageService.removeItem("guestType");
				StorageService.removeItem("userProfile");

				// Get user attributes to fetch name and other info
				let userName = email; // fallback to email
				let userAttributes: any = null;

				// Always fetch user attributes to get account creation date and other info
				try {
					userAttributes = await fetchUserAttributes();
				} catch (userError) {
					console.warn("Could not fetch user attributes:", userError);
				}

				// First, try to get name from stored userName (most reliable for confirmed users)
				const userNameKey = `userName_${email}`;
				const storedUserName =
					StorageService.getItem<string>(userNameKey);
				if (storedUserName && storedUserName.trim() !== "") {
					userName = storedUserName;
				} else {
					// Fallback to pending user data (for unconfirmed users)
					const pendingUser = StorageService.getItem<{
						name?: string;
						[key: string]: any;
					}>("pendingUser");
					if (pendingUser?.name && pendingUser.name.trim() !== "") {
						userName = pendingUser.name;
					}
				}

				// Use name from userAttributes if we still don't have a proper name
				if (
					userName === email &&
					userAttributes?.name &&
					userAttributes.name.trim() !== ""
				) {
					userName = userAttributes.name;
				}

				// Try to extract name from JWT token as another fallback
				if (userName === email && accessToken) {
					try {
						// Decode JWT token to get user info
						const tokenParts = accessToken.split(".");
						if (tokenParts.length === 3) {
							const payload = JSON.parse(atob(tokenParts[1]));
							// Check if there's a name in the token
							if (payload.name && payload.name.trim() !== "") {
								userName = payload.name;
							}
						}
					} catch (jwtError) {
						console.warn("Could not decode JWT token:", jwtError);
					}
				}

				// Final fallback to email prefix
				if (userName === email) {
					userName = email.split("@")[0];
				}

				// Extract account creation and last modified from JWT token claims
				let accountCreatedDate =
					userAttributes?.account_created_date || null;
				let accountLastModified =
					userAttributes?.account_last_modified || null;

				if (accessToken) {
					try {
						const tokenParts = accessToken.split(".");
						if (tokenParts.length === 3) {
							const payload = JSON.parse(atob(tokenParts[1]));
							// auth_time is when the user was created/authn first time
							if (payload.auth_time && !accountCreatedDate) {
								accountCreatedDate = new Date(
									payload.auth_time * 1000,
								).toISOString();
							}
							// iat is "issued at" time - last auth time
							if (payload.iat && !accountLastModified) {
								accountLastModified = new Date(
									payload.iat * 1000,
								).toISOString();
							}
						}
					} catch (jwtError) {
						console.warn(
							"Could not extract dates from JWT token:",
							jwtError,
						);
					}
				}

				// Create flattened signInDetails object
				const signInDetails = {
					isSignedIn: result.isSignedIn || true, // Ensure it's always true if we reach this point
					accessToken: accessToken || "", // Ensure it's always a string
				};

				// Store user data with flattened structure
				const userData: CognitoUser = {
					email,
					name: userName,
					isSignedIn: true,
					accessToken: accessToken || "",
					signInDetails: signInDetails,
					// Add account creation date and last modified from JWT token or custom attributes
					accountCreatedDate: accountCreatedDate || undefined,
					accountLastModified: accountLastModified || undefined,
					userStatus: userAttributes?.user_status || undefined,
				};

				setUser(userData);
				StorageService.setItem("cognitoUser", userData);
				StorageService.setItem("isLoggedIn", "true");

				// Set userToken for registration system compatibility
				if (accessToken) {
					StorageService.setUserToken(accessToken);
				} else {
					console.warn(
						"⚠️ AuthContext - No accessToken available to set userToken",
					);
				}
				StorageService.removeItem("household_signup_state");

				// Restore the user's preferred language from their profile
				try {
					const householdsApi = new HouseholdsApiService();
					const profile = await householdsApi.getUsersMe();
					if (profile?.language_id) {
						const langCode =
							getLanguageOptionById(Number(profile.language_id))
								?.code ?? "en";
						dispatch(setCurrentLanguage(langCode));
						setLanguage(langCode);
					}
				} catch {
					// Non-critical: language stays at default if profile fetch fails
				}
			}
		} catch (error: any) {
			console.warn("Sign in error:", error);
			// Check if this is an unconfirmed user error - preserve the original error structure
			// Check multiple possible error formats from AWS Amplify/Cognito
			const errorMessage = error.message || error.toString() || "";
			const errorName = error.name || error.__type || "";
			const errorCode = error.code || "";

			const isUnconfirmedUserError =
				errorName === "UserNotConfirmedException" ||
				errorCode === "UserNotConfirmedException" ||
				error.__type === "UserNotConfirmedException" ||
				errorMessage.includes("UserNotConfirmedException") ||
				errorMessage.includes("User is not confirmed") ||
				errorMessage
					.toLowerCase()
					.includes("user needs to be confirmed") ||
				errorMessage.toLowerCase().includes("not confirmed") ||
				errorMessage.toLowerCase().includes("user is not confirmed") ||
				errorMessage.toLowerCase().includes("account is not confirmed");
			// If it's an unconfirmed user error, throw a special error that preserves the original structure
			if (isUnconfirmedUserError) {
				const unconfirmedError: any = new Error(
					error.message || "User account is not confirmed",
				);
				unconfirmedError.name =
					error.name || error.__type || "UserNotConfirmedException";
				unconfirmedError.code = error.code;
				unconfirmedError.originalError = error;
				unconfirmedError.isUnconfirmedUser = true;
				throw unconfirmedError;
			}

			throw new Error(error.message || "Failed to sign in");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSignUp = async (
		email: string,
		password: string,
		name: string,
	): Promise<void> => {
		try {
			setIsLoading(true);

			// Use Amplify signup
			const result = await signUp({
				username: email,
				password,
				options: {
					userAttributes: {
						email,
						name,
					},
				},
			});

			// Store pending user data
			const pendingUser = {
				email,
				name,
				password, // Store password for automatic sign-in after confirmation
				username: (result as any).username || email, // Use generated username or fallback to email
				isPendingConfirmation: true,
				userId: result.userId,
			};
			StorageService.setItem("pendingUser", pendingUser);
		} catch (error: any) {
			console.warn("Sign up error:", error);

			// Check if this is an unverified user error - preserve the original error structure
			const isUnverifiedUserError =
				error.name === "UsernameExistsException" ||
				error.name === "AliasExistsException" ||
				error.code === "UsernameExistsException" ||
				error.code === "AliasExistsException" ||
				error.message?.includes("UsernameExistsException") ||
				error.message?.includes("AliasExistsException") ||
				error.message?.includes(
					"An account with the given email already exists",
				) ||
				error.message?.toLowerCase().includes("username exists") ||
				error.message?.toLowerCase().includes("email already exists");

			// If it's an unverified user error, throw a special error that preserves the original structure
			if (isUnverifiedUserError) {
				const unverifiedError: any = new Error(
					error.message ||
						"An account with this email already exists",
				);
				unverifiedError.name = error.name || "UsernameExistsException";
				unverifiedError.code = error.code;
				unverifiedError.originalError = error;
				unverifiedError.isUnverifiedUser = true;
				throw unverifiedError;
			}

			// Provide more user-friendly error messages for other errors
			let errorMessage = "Failed to create account";
			if (error.message?.includes("name.formatted")) {
				errorMessage = "Name is required. Please enter your full name.";
			} else if (error.message?.includes("email")) {
				errorMessage = "Please enter a valid email address.";
			} else if (error.message?.includes("password")) {
				errorMessage = "Password must be at least 8 characters long.";
			} else if (error.message) {
				errorMessage = error.message;
			}
			throw new Error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const handleConfirmSignUp = async (
		email: string,
		code: string,
	): Promise<void> => {
		try {
			setIsLoading(true);

			// Use Amplify confirm signup
			await confirmSignUp({
				username: email,
				confirmationCode: code,
			});

			// Get pending user data to retrieve name and password
			const pendingUser = StorageService.getItem<{
				name?: string;
				password?: string;
			}>("pendingUser");
			let userName = email; // fallback to email
			let password = "";

			if (pendingUser) {
				userName = pendingUser.name || email;
				password = pendingUser.password || "";
			}

			// Clear guest authentication data when confirming Cognito sign-up
			// Note: We don't remove userToken here as it might be needed for registration
			StorageService.removeItem("guestId");
			StorageService.removeItem("guestType");
			StorageService.removeItem("userProfile");

			// Automatically sign in the user after email confirmation
			if (password) {
				try {
					await handleSignIn(email, password);

					// Set flag to indicate this is a new user who should see setup popup
					StorageService.setItem("shouldShowSetupWizard", "true");
					return; // Exit early since handleSignIn already sets user data
				} catch (signInError) {
					console.warn(
						"Could not automatically sign in user:",
						signInError,
					);
					// Fall through to fallback behavior
				}
			}

			// Fallback: Store confirmed user data without accessToken
			// This will show the popup but user will need to sign in manually
			const userData: CognitoUser = {
				email,
				name: userName,
				isSignedIn: true,
				accessToken: "",
				signInDetails: {
					isSignedIn: true,
					accessToken: "",
				},
			};
			setUser(userData);
			StorageService.setItem("cognitoUser", userData);
			StorageService.setItem("isLoggedIn", "true");

			// Store the name for future sign-ins before clearing pending data (user-specific)
			if (userData.name && userData.name !== userData.email) {
				const userNameKey = `userName_${userData.email}`;
				StorageService.setItem(userNameKey, userData.name);
			}

			// Clear pending user data
			StorageService.removeItem("pendingUser");

			// Set flag to indicate this is a new user who should see setup popup
			StorageService.setItem("shouldShowSetupWizard", "true");
		} catch (error: any) {
			console.error("Confirm sign up error:", error);
			throw new Error(error.message || "Failed to confirm sign up");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSignOut = async (): Promise<void> => {
		try {
			setIsLoading(true);
			await signOut();
			setUser(null);
			setNeedsHouseholdSetup(null);

			// Clear all application data from localStorage and sessionStorage
			// This includes auth data, household data, preferences, etc.
			StorageService.clearAllAppData();

			// Purge Redux persist store to clear persisted state
			await persistor.purge();
		} catch (error: any) {
			throw new Error(error.message || "Failed to sign out");
		} finally {
			setIsLoading(false);
		}
	};

	const handleResetPassword = async (email: string): Promise<void> => {
		try {
			setIsLoading(true);

			// Use Amplify reset password (no secrets required)
			await resetPassword({
				username: email,
			});
		} catch (error: any) {
			throw new Error(error.message || "Failed to reset password");
		} finally {
			setIsLoading(false);
		}
	};

	const handleConfirmResetPassword = async (
		email: string,
		code: string,
		newPassword: string,
	): Promise<void> => {
		try {
			setIsLoading(true);

			// Use Amplify confirm reset password (no secrets required)
			await confirmResetPassword({
				username: email,
				confirmationCode: code,
				newPassword,
			});
		} catch (error: any) {
			throw new Error(
				error.message || "Failed to confirm reset password",
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleResendConfirmationCode = async (
		email: string,
	): Promise<void> => {
		try {
			setIsLoading(true);

			// Use Amplify resend confirmation code (no secrets required)
			await resendSignUpCode({
				username: email,
			});
		} catch (error: any) {
			throw new Error(
				error.message || "Failed to resend confirmation code",
			);
		} finally {
			setIsLoading(false);
		}
	};

	const value: AuthContextType = {
		user,
		isLoading,
		isAuthenticated,
		needsHouseholdSetup,
		setNeedsHouseholdSetup,
		signIn: handleSignIn,
		signUp: handleSignUp,
		confirmSignUp: handleConfirmSignUp,
		signOut: handleSignOut,
		resetPassword: handleResetPassword,
		confirmResetPassword: handleConfirmResetPassword,
		resendConfirmationCode: handleResendConfirmationCode,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
};

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
