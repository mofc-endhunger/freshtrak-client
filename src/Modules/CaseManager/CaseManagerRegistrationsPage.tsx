import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { RENDER_URL } from "../../Utils/Urls";
import { StorageService } from "../../Utils/StorageService";
import { getCognitoToken } from "../../Utils/AuthErrorHandler";
import LoadingSpinner from "../General/LoadingSpinner";
import { Button } from "../../components/ui/button";
import {
	ArrowLeft,
	Users,
	Calendar,
	Phone,
	Mail,
	MapPin,
} from "lucide-react";
import localization from "../Localization/LocalizationComponent";
import config from "../../config";

interface CmRegistration {
	id: number;
	event_id: number;
	household_id: number;
	status: string;
	created_by: number;
	event_date_id: number | null;
	event_slot_id: number | null;
	created_at: string;
	registrant_first_name: string | null;
	registrant_last_name: string | null;
	registrant_phone: string | null;
	registrant_email: string | null;
	event_name: string | null;
	event_date: string | null;
}

const REGISTRATION_API = config.REGISTRATION_API;

const statusColors: Record<string, string> = {
	confirmed: "bg-green-100 text-green-800",
	waitlisted: "bg-yellow-100 text-yellow-800",
	cancelled: "bg-red-100 text-red-800",
	checked_in: "bg-blue-100 text-blue-800",
};

const getStatusLabel = (status: string): string => {
	const statusMap: Record<string, string> = {
		confirmed: localization.cm_status_confirmed || "Confirmed",
		waitlisted: localization.cm_status_waitlisted || "Waitlisted",
		cancelled: localization.cm_status_cancelled || "Cancelled",
		checked_in: localization.cm_status_checked_in || "Checked In",
	};
	return statusMap[status] || status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatPhone = (phone: string | null): string => {
	if (!phone) return "";
	const digits = phone.replace(/\D/g, "");
	if (digits.length === 10) {
		return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
	}
	return phone;
};

const CaseManagerRegistrationsPage: React.FC = () => {
	const navigate = useNavigate();
	const [registrations, setRegistrations] = useState<CmRegistration[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!StorageService.isCaseManager()) {
			navigate(RENDER_URL.ROOT_URL);
			return;
		}
		fetchRegistrations();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchRegistrations = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const token = getCognitoToken();
			if (!token) {
				setError(localization.cm_session_expired || "Session expired. Please sign in again.");
				return;
			}
			const resp = await axios.get<CmRegistration[]>(
				`${REGISTRATION_API}api/registrations/created-by-me`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setRegistrations(resp.data);
		} catch (err: any) {
			console.error("Failed to fetch CM registrations:", err);
			setError(
				err?.response?.status === 403
					? localization.cm_not_authorized || "You are not authorized to view this page."
					: localization.cm_load_failed || "Failed to load registrations. Please try again."
			);
		} finally {
			setIsLoading(false);
		}
	};

	const formatDateTime = (iso: string): string => {
		try {
			const d = new Date(iso);
			return d.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
				hour: "numeric",
				minute: "2-digit",
			});
		} catch {
			return iso;
		}
	};

	const formatEventDate = (dateStr: string | null): string => {
		if (!dateStr) return "";
		try {
			// dateStr is YYYY-MM-DD from event_date_key; parse as local date
			const [y, m, d] = dateStr.split("-").map(Number);
			const date = new Date(y, m - 1, d);
			return date.toLocaleDateString("en-US", {
				weekday: "short",
				month: "short",
				day: "numeric",
				year: "numeric",
			});
		} catch {
			return dateStr;
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Back button */}
				<div className="mb-8">
					<div className="flex items-center justify-between mb-4">
						<Button
							variant="ghost"
							onClick={() => navigate(RENDER_URL.ROOT_URL)}
							className="text-gray-600 hover:text-gray-900"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							{localization.button_back_to_home}
						</Button>
					</div>

					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">
								{localization.cm_my_registrations ||
									"My Registrations"}
							</h1>
							<p className="text-sm text-gray-500 mt-1">
								{localization.cm_my_registrations_subtitle ||
									"People you have registered on behalf of"}
							</p>
						</div>
						<div className="flex items-center gap-2">
							<span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-amber-400/90 text-amber-950 rounded-full">
								{localization.cm_badge}
							</span>
							<span className="text-sm text-gray-500">
								{registrations.length}{" "}
								{registrations.length === 1
									? localization.cm_registration_count_one || "registration"
									: localization.cm_registration_count_other || "registrations"}
							</span>
						</div>
					</div>
				</div>

				{/* Content */}
				{isLoading ? (
					<div className="flex justify-center py-16">
						<LoadingSpinner size="medium" />
					</div>
				) : error ? (
					<div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
						<p className="text-red-600">{error}</p>
						<Button
							variant="outline"
							onClick={fetchRegistrations}
							className="mt-4"
						>
							{localization.cm_retry || "Retry"}
						</Button>
					</div>
				) : registrations.length === 0 ? (
					<div className="bg-white rounded-lg shadow-sm border p-12 text-center">
						<Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							{localization.cm_no_registrations || "No registrations yet"}
						</h3>
						<p className="text-gray-500 mb-6">
							{localization.cm_no_registrations_desc ||
								"Registrations you create on behalf of others will appear here."}
						</p>
						<Button
							onClick={() => navigate(RENDER_URL.ROOT_URL)}
							className="bg-primary text-white"
						>
							{localization.cm_find_event || "Find an Event"}
						</Button>
					</div>
				) : (
					<div className="space-y-3">
						{registrations.map((reg) => (
							<div
								key={reg.id}
								className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
							>
								<div className="flex items-start justify-between">
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1">
											<h3 className="text-base font-semibold text-gray-900 truncate">
												{reg.registrant_first_name ||
												reg.registrant_last_name
													? `${reg.registrant_first_name || ""} ${reg.registrant_last_name || ""}`.trim()
													: `Registration #${reg.id}`}
											</h3>
											<span
												className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[reg.status] || "bg-gray-100 text-gray-800"}`}
											>
												{getStatusLabel(reg.status)}
											</span>
										</div>

										{/* Event info */}
										<div className="flex items-center gap-1.5 text-sm text-gray-700 mb-1">
											<MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
											<span className="font-medium truncate">
												{reg.event_name ||
													`Event #${reg.event_id}`}
											</span>
											{reg.event_date && (
												<span className="text-gray-400">
													&middot;{" "}
													{formatEventDate(
														reg.event_date
													)}
												</span>
											)}
										</div>

										{/* Contact details */}
										<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
											<span className="flex items-center gap-1">
												<Calendar className="h-3.5 w-3.5" />
												{formatDateTime(
													reg.created_at
												)}
											</span>
											{reg.registrant_phone && (
												<span className="flex items-center gap-1">
													<Phone className="h-3.5 w-3.5" />
													{formatPhone(
														reg.registrant_phone
													)}
												</span>
											)}
											{reg.registrant_email &&
												!reg.registrant_email.includes(
													"@auto.local"
												) && (
													<span className="flex items-center gap-1">
														<Mail className="h-3.5 w-3.5" />
														{reg.registrant_email}
													</span>
												)}
										</div>
									</div>

									<div className="text-right text-xs text-gray-400 ml-4 shrink-0">
										ID: {reg.id}
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default CaseManagerRegistrationsPage;
