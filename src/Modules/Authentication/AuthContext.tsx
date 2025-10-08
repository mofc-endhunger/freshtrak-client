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
} from "aws-amplify/auth";
import { AuthContextType } from "./types/authentication.types";
import { getSecretHash } from "../../Utils/CognitoUtils";
import {
	customSignUp,
	customConfirmSignUp,
	customSignIn,
} from "../../Utils/AWSCognitoService";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
	children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<any | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Check if user is authenticated
	const isAuthenticated = !!user;

	// Initialize auth state
	useEffect(() => {
		const initAuth = async () => {
			try {
				// In a real implementation, you would check the current user here
				// For demo purposes, we'll check localStorage
				const storedUser = localStorage.getItem("cognitoUser");
				if (storedUser) {
					setUser(JSON.parse(storedUser));
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
		password: string
	): Promise<void> => {
		try {
			setIsLoading(true);

			// Check if client secret is configured
			const clientSecret = process.env.REACT_APP_USER_POOL_CLIENT_SECRET;

			let result;

			if (clientSecret) {
				// Use custom sign in with SECRET_HASH for clients with secrets

				const customResult = await customSignIn({
					email,
					password,
				});

				// Convert custom result to match Amplify format
				result = {
					isSignedIn: customResult.isSignedIn,
					signInDetails: {
						isSignedIn: customResult.isSignedIn,
						accessToken: customResult.accessToken,
					},
				};
			} else {
				// Use standard Amplify sign in for clients without secrets
				result = await signIn({
					username: email,
					password,
				});
			}

			if (result.isSignedIn) {
				// Get user name from multiple sources
				// Clear guest authentication data when logging in with Cognito
				localStorage.removeItem("userToken");
				localStorage.removeItem("guestId");
				localStorage.removeItem("guestType");
				localStorage.removeItem("userProfile");

				// Get user attributes to fetch name
				let userName = email; // fallback to email

				// First, try to get name from stored userName (most reliable for confirmed users)
				const userNameKey = `userName_${email}`;
				const storedUserName = localStorage.getItem(userNameKey);
				if (storedUserName && storedUserName.trim() !== "") {
					userName = storedUserName;
				} else {
					// Fallback to pending user data (for unconfirmed users)
					const pendingUser = localStorage.getItem("pendingUser");
					if (pendingUser) {
						try {
							const pendingData = JSON.parse(pendingUser);
							if (
								pendingData.name &&
								pendingData.name.trim() !== ""
							) {
								userName = pendingData.name;
							}
						} catch (parseError) {
							console.warn(
								"Could not parse pending user data:",
								parseError
							);
						}
					}
				}

				// If we still don't have a proper name, try fetchUserAttributes
				if (userName === email) {
					try {
						const userAttributes = await fetchUserAttributes();
						// Use the name attribute if it exists and is not empty
						if (
							userAttributes.name &&
							userAttributes.name.trim() !== ""
						) {
							userName = userAttributes.name;
						}
					} catch (userError) {
						console.warn(
							"Could not fetch user attributes:",
							userError
						);
					}
				}

				// Try to extract name from JWT token as another fallback
				if (userName === email) {
					try {
						const accessToken =
							(result as any).signInDetails?.accessToken ||
							(result as any).signInDetails?.signInDetails
								?.accessToken ||
							(result as any).accessToken;

						if (accessToken) {
							// Decode JWT token to get user info
							const tokenParts = accessToken.split(".");
							if (tokenParts.length === 3) {
								const payload = JSON.parse(atob(tokenParts[1]));
								// Check if there's a name in the token
								if (
									payload.name &&
									payload.name.trim() !== ""
								) {
									userName = payload.name;
								}
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

				// Extract access token from nested structure
				const accessToken =
					(result as any).signInDetails?.accessToken ||
					(result as any).signInDetails?.signInDetails?.accessToken ||
					(result as any).accessToken;

				// Create flattened signInDetails object
				const signInDetails = {
					isSignedIn: result.isSignedIn || true, // Ensure it's always true if we reach this point
					accessToken: accessToken,
				};

				// Store user data with flattened structure
				const userData = {
					email,
					name: userName,
					isSignedIn: true,
					accessToken: accessToken,
					signInDetails: signInDetails,
				};

				setUser(userData);
				localStorage.setItem("cognitoUser", JSON.stringify(userData));
				localStorage.setItem("isLoggedIn", "true");
			}
		} catch (error: any) {
			console.error("Sign in error:", error);
			throw new Error(error.message || "Failed to sign in");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSignUp = async (
		email: string,
		password: string,
		name: string
	): Promise<void> => {
		try {
			setIsLoading(true);

			// Check if client secret is configured
			const clientSecret = process.env.REACT_APP_USER_POOL_CLIENT_SECRET;

			let result;

			if (clientSecret) {
				// Use custom signup with SECRET_HASH for clients with secrets
				const customResult = await customSignUp({
					username: email,
					password,
					email,
					name,
				});

				// Convert custom result to match Amplify format
				result = {
					userId: customResult.userId,
					username: customResult.username,
					isSignUpComplete: customResult.isPendingConfirmation,
				};
			} else {
				// Use standard Amplify signup for clients without secrets
				result = await signUp({
					username: email,
					password,
					options: {
						userAttributes: {
							email,
							name,
						},
					},
				});
			}

			// Store pending user data
			const pendingUser = {
				email,
				name,
				username: (result as any).username || email, // Use generated username or fallback to email
				isPendingConfirmation: true,
				userId: result.userId,
			};
			localStorage.setItem("pendingUser", JSON.stringify(pendingUser));
		} catch (error: any) {
			console.error("Sign up error:", error);
			// Provide more user-friendly error messages
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
		code: string
	): Promise<void> => {
		try {
			setIsLoading(true);

			// Check if client secret is configured
			const clientSecret = process.env.REACT_APP_USER_POOL_CLIENT_SECRET;

			if (clientSecret) {
				// Use custom confirm signup with SECRET_HASH for clients with secrets
				// Get the stored username from pending user data
				const pendingUserData = localStorage.getItem("pendingUser");
				let username = email; // fallback to email

				if (pendingUserData) {
					try {
						const pendingUser = JSON.parse(pendingUserData);
						username = pendingUser.username || email;
					} catch (parseError) {
						console.warn(
							"Could not parse pending user data:",
							parseError
						);
					}
				}

				await customConfirmSignUp({
					username: username,
					confirmationCode: code,
				});
			} else {
				// Use standard Amplify confirm signup for clients without secrets
				const confirmOptions: any = {
					username: email,
					confirmationCode: code,
				};

				await confirmSignUp(confirmOptions);
			}

			// Get pending user data to retrieve name
			const pendingUserData = localStorage.getItem("pendingUser");
			let userName = email; // fallback to email

			if (pendingUserData) {
				try {
					const pendingUser = JSON.parse(pendingUserData);
					userName = pendingUser.name || email;
				} catch (parseError) {
					console.warn(
						"Could not parse pending user data:",
						parseError
					);
				}
			}

			// Clear guest authentication data when confirming Cognito sign-up
			localStorage.removeItem("userToken");
			localStorage.removeItem("guestId");
			localStorage.removeItem("guestType");
			localStorage.removeItem("userProfile");

			// Store confirmed user data
			const userData = {
				email,
				name: userName,
				isSignedIn: true,
				isConfirmed: true,
			};
			setUser(userData);
			localStorage.setItem("cognitoUser", JSON.stringify(userData));
			localStorage.setItem("isLoggedIn", "true");

			// Store the name for future sign-ins before clearing pending data (user-specific)
			if (userData.name && userData.name !== userData.email) {
				const userNameKey = `userName_${userData.email}`;
				localStorage.setItem(userNameKey, userData.name);
			}

			// Clear pending user data
			localStorage.removeItem("pendingUser");
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

			// Clear all authentication data
			localStorage.removeItem("cognitoUser");
			localStorage.removeItem("userToken");
			localStorage.removeItem("guestId");
			localStorage.removeItem("guestType");
			localStorage.removeItem("userProfile");
			localStorage.removeItem("isLoggedIn");
		} catch (error: any) {
			console.error("Sign out error:", error);
			throw new Error(error.message || "Failed to sign out");
		} finally {
			setIsLoading(false);
		}
	};

	const handleResetPassword = async (email: string): Promise<void> => {
		try {
			setIsLoading(true);

			// Generate SECRET_HASH if client secret is configured
			const secretHash = getSecretHash(email);

			const resetOptions: any = { username: email };

			// Add SECRET_HASH if available
			if (secretHash) {
				resetOptions.options = {
					clientMetadata: {
						SECRET_HASH: secretHash,
					},
				};
			}

			await resetPassword(resetOptions);
		} catch (error: any) {
			console.error("Reset password error:", error);
			throw new Error(error.message || "Failed to reset password");
		} finally {
			setIsLoading(false);
		}
	};

	const handleConfirmResetPassword = async (
		email: string,
		code: string,
		newPassword: string
	): Promise<void> => {
		try {
			setIsLoading(true);

			// Generate SECRET_HASH if client secret is configured
			const secretHash = getSecretHash(email);

			const confirmResetOptions: any = {
				username: email,
				confirmationCode: code,
				newPassword,
			};

			// Add SECRET_HASH if available
			if (secretHash) {
				confirmResetOptions.options = {
					clientMetadata: {
						SECRET_HASH: secretHash,
					},
				};
			}

			await confirmResetPassword(confirmResetOptions);
		} catch (error: any) {
			console.error("Confirm reset password error:", error);
			throw new Error(
				error.message || "Failed to confirm reset password"
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleResendConfirmationCode = async (
		email: string
	): Promise<void> => {
		try {
			setIsLoading(true);

			// Generate SECRET_HASH if client secret is configured
			const secretHash = getSecretHash(email);

			const resendOptions: any = { username: email };

			// Add SECRET_HASH if available
			if (secretHash) {
				resendOptions.options = {
					clientMetadata: {
						SECRET_HASH: secretHash,
					},
				};
			}

			await resendSignUpCode(resendOptions);
		} catch (error: any) {
			console.error("Resend confirmation code error:", error);
			throw new Error(
				error.message || "Failed to resend confirmation code"
			);
		} finally {
			setIsLoading(false);
		}
	};

	const value: AuthContextType = {
		user,
		isLoading,
		isAuthenticated,
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
