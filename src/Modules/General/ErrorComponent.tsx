import React from "react";
import { Link } from "react-router-dom";
import { RENDER_URL } from "../../Utils/Urls";
import localization from "../Localization/LocalizationComponent";

import { AlertTriangle, Home, AlertCircle } from "lucide-react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";

interface ErrorComponentProps {
	error: {
		event_date?: Array<{
			code: string;
			message: string;
		}>;
		status?: string;
		message?: string;
	};
}

const ErrorComponent: React.FC<ErrorComponentProps> = ({ error }) => {
	const errors = error.event_date;

	const viewErrors = () => {
		if (!errors) {
			return (
				<div className="text-center space-y-4">
					<div className="flex justify-center">
						<AlertTriangle className="h-16 w-16 text-red-500" />
					</div>
					<h2 className="text-2xl font-bold text-red-600">
						{localization.text_page_not_found}
					</h2>
					{error.message && (
						<div className="text-gray-600 space-y-2">
							<p>
								<span className="font-semibold">{localization.label_message_colon}</span>{" "}
								{error.message}
							</p>
						</div>
					)}
				</div>
			);
		} else if (errors) {
			return (
				<div className="text-center space-y-4">
					<div className="flex justify-center">
						<AlertCircle className="h-16 w-16 text-orange-500" />
					</div>
					<h2 className="text-2xl font-bold text-orange-600">
						{localization.text_validation_errors_on_event}
					</h2>
					<div className="space-y-2">
						{errors.map((error, index) => (
							<div
								key={`error-${index}`}
								className="text-gray-600 p-3 bg-orange-50 rounded-lg"
							>
								<p className="font-semibold">
									{localization.label_code_colon} {error.code}
								</p>
								<p>{localization.label_message_colon} {error.message}</p>
							</div>
						))}
					</div>
				</div>
			);
		}
		return null;
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle className="text-xl font-semibold text-gray-800">
						{localization.label_error_details}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					{viewErrors()}
					<div className="flex justify-center">
						<Link to={RENDER_URL.ROOT_URL}>
							<Button
								data-testid="continue button"
								variant="highlight"
							>
								<Home className="h-4 w-4 mr-2" />
								{localization.button_back_to_home}
							</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default ErrorComponent;
