/**
 * RegistrationSuspendedMessage Component
 *
 * Displays a user-friendly message when event registrations are temporarily
 * suspended due to backend issues, with an option to navigate back home.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { RENDER_URL } from "../../Utils/Urls";

interface RegistrationSuspendedMessageProps {
	onBackToHome?: () => void;
}

const RegistrationSuspendedMessage: React.FC<RegistrationSuspendedMessageProps> = ({
	onBackToHome,
}) => {
	const navigate = useNavigate();

	const handleBackToHome = () => {
		if (onBackToHome) {
			onBackToHome();
		} else {
			navigate(RENDER_URL.ROOT_URL);
		}
	};

	return (
		<div className="container mx-auto my-12 px-4 py-12">
			<div className="max-w-2xl mx-auto">
				<div className="bg-white rounded-lg shadow-lg p-8">
					{/* Warning Icon */}
					<div className="flex justify-center mb-6">
						<div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
							<svg
								className="w-8 h-8 text-yellow-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							</svg>
						</div>
					</div>

					{/* Title */}
					<h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
						Reservations Temporarily Unavailable
					</h2>

					{/* Message */}
					<p className="text-center text-gray-600 mb-6">
						We're currently experiencing technical difficulties with our
						registration system. Please try again later.
					</p>

					{/* Additional Info */}
					<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
						<p className="text-sm text-yellow-800 text-center">
							We apologize for the inconvenience. Our team is working to
							resolve this issue as quickly as possible.
						</p>
					</div>

					{/* Action Button */}
					<div className="flex justify-center">
						<Button
							type="button"
							variant="highlight"
							onClick={handleBackToHome}
							className="min-w-48"
						>
							Back to Home
						</Button>
					</div>

					{/* Contact Info */}
					<div className="mt-8 pt-6 border-t border-gray-200 text-center">
						<p className="text-sm text-gray-500">
							Need help? Contact us at{" "}
							<a
								href="mailto:support@freshtrak.org"
								className="text-blue-600 hover:text-blue-800 underline"
							>
								support@freshtrak.org
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RegistrationSuspendedMessage;
