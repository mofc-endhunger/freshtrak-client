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
			const result = await signIn({
				username: email,
				password,
			});

			if (result.isSignedIn) {
				// Clear guest authentication data when logging in with Cognito
				localStorage.removeItem("userToken");
				localStorage.removeItem("guestId");
				localStorage.removeItem("guestType");
				localStorage.removeItem("userProfile");

				// Get user attributes to fetch name
				let userName = email; // fallback to email
				try {
					const userAttributes = await fetchUserAttributes();
					userName =
						userAttributes.name || userAttributes.email || email;
				} catch (userError) {
					console.warn("Could not fetch user attributes:", userError);
				}

				// Store user data
				const userData = {
					email,
					name: userName,
					isSignedIn: true,
					signInDetails: result,
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
			await confirmSignUp({
				username: email,
				confirmationCode: code,
			});

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
			await resetPassword({ username: email });
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
			await confirmResetPassword({
				username: email,
				confirmationCode: code,
				newPassword,
			});
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
			await resendSignUpCode({ username: email });
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
