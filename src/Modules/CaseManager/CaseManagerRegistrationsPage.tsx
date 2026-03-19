import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";

import { RENDER_URL } from "../../Utils/Urls";
import { StorageService } from "../../Utils/StorageService";
import { getCognitoToken } from "../../Utils/AuthErrorHandler";
import LoadingSpinner from "../General/LoadingSpinner";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../../components/ui/table";
import {
	ArrowLeft,
	Users,
	ArrowUpDown,
	ChevronLeft,
	ChevronRight,
	Search,
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
	return (
		statusMap[status] ||
		status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())
	);
};

const formatPhone = (phone: string | null): string => {
	if (!phone) return "";
	const digits = phone.replace(/\D/g, "");
	if (digits.length === 10) {
		return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
	}
	return phone;
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

const getFullName = (reg: CmRegistration): string => {
	if (reg.registrant_first_name || reg.registrant_last_name) {
		return `${reg.registrant_first_name || ""} ${reg.registrant_last_name || ""}`.trim();
	}
	return `Registration #${reg.id}`;
};

const getColumns = (): ColumnDef<CmRegistration>[] => [
	{
		accessorKey: "id",
		header: () => localization.cm_column_id || "ID",
		cell: ({ row }) => (
			<span className="text-gray-500 font-mono text-xs">
				{row.original.id}
			</span>
		),
		enableGlobalFilter: false,
	},
	{
		id: "name",
		accessorFn: (row) => getFullName(row),
		header: ({ column }) => (
			<Button
				variant="ghost"
				className="-ml-3 h-8"
				onClick={() =>
					column.toggleSorting(column.getIsSorted() === "asc")
				}
			>
				{localization.label_name || "Name"}
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => {
			const reg = row.original;
			return (
				<div className="flex items-center gap-2">
					<span className="font-medium text-gray-900">
						{getFullName(reg)}
					</span>
					<span
						className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${statusColors[reg.status] || "bg-gray-100 text-gray-800"}`}
					>
						{getStatusLabel(reg.status)}
					</span>
				</div>
			);
		},
	},
	{
		accessorKey: "registrant_email",
		header: ({ column }) => (
			<Button
				variant="ghost"
				className="-ml-3 h-8"
				onClick={() =>
					column.toggleSorting(column.getIsSorted() === "asc")
				}
			>
				{localization.label_email || "Email"}
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => {
			const email = row.original.registrant_email;
			if (!email || email.includes("@auto.local")) {
				return <span className="text-gray-400">—</span>;
			}
			return <span className="text-gray-700">{email}</span>;
		},
	},
	{
		accessorKey: "registrant_phone",
		header: () => localization.label_phone_number || "Phone Number",
		cell: ({ row }) => {
			const phone = row.original.registrant_phone;
			if (!phone) return <span className="text-gray-400">—</span>;
			return <span className="text-gray-700">{formatPhone(phone)}</span>;
		},
	},
	{
		accessorKey: "event_name",
		header: ({ column }) => (
			<Button
				variant="ghost"
				className="-ml-3 h-8"
				onClick={() =>
					column.toggleSorting(column.getIsSorted() === "asc")
				}
			>
				{localization.cm_column_event_name || "Event Name"}
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => (
			<span className="text-gray-700">
				{row.original.event_name || `Event #${row.original.event_id}`}
			</span>
		),
	},
	{
		id: "date_time",
		accessorFn: (row) => row.event_date || row.created_at,
		header: ({ column }) => (
			<Button
				variant="ghost"
				className="-ml-3 h-8"
				onClick={() =>
					column.toggleSorting(column.getIsSorted() === "asc")
				}
			>
				{localization.cm_column_date_time || "Date & Time"}
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => {
			const reg = row.original;
			return (
				<div className="text-gray-700">
					{reg.event_date ? (
						<span>{formatEventDate(reg.event_date)}</span>
					) : (
						<span>{formatDateTime(reg.created_at)}</span>
					)}
				</div>
			);
		},
		enableGlobalFilter: false,
	},
];

const CaseManagerRegistrationsPage: React.FC = () => {
	const navigate = useNavigate();
	const [registrations, setRegistrations] = useState<CmRegistration[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const columns = useMemo(() => getColumns(), []);

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
				setError(
					localization.cm_session_expired ||
						"Session expired. Please sign in again."
				);
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
					? localization.cm_not_authorized ||
							"You are not authorized to view this page."
					: localization.cm_load_failed ||
							"Failed to load registrations. Please try again."
			);
		} finally {
			setIsLoading(false);
		}
	};

	const globalFilterFn = useMemo(
		() =>
			(
				row: { original: CmRegistration },
				_columnId: string,
				filterValue: string
			): boolean => {
				const search = filterValue.toLowerCase();
				const reg = row.original;
				const name = getFullName(reg).toLowerCase();
				const email = (reg.registrant_email || "").toLowerCase();
				const phone = (reg.registrant_phone || "").toLowerCase();
				const eventName = (reg.event_name || "").toLowerCase();
				return (
					name.includes(search) ||
					email.includes(search) ||
					phone.includes(search) ||
					eventName.includes(search)
				);
			},
		[]
	);

	const table = useReactTable({
		data: registrations,
		columns,
		state: {
			sorting,
			globalFilter,
			columnFilters,
		},
		onSortingChange: setSorting,
		onGlobalFilterChange: setGlobalFilter,
		onColumnFiltersChange: setColumnFilters,
		globalFilterFn,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: {
			pagination: { pageSize: 10 },
		},
	});

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
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
									? localization.cm_registration_count_one ||
										"registration"
									: localization.cm_registration_count_other ||
										"registrations"}
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
							{localization.cm_no_registrations ||
								"No registrations yet"}
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
					<div className="bg-white rounded-lg shadow-sm border">
						{/* Search */}
						<div className="p-4 border-b">
							<div className="relative max-w-sm">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
								<Input
									placeholder={localization.cm_search_placeholder || "Search by name, event, email or phone..."}
									value={globalFilter}
									onChange={(e) =>
										setGlobalFilter(e.target.value)
									}
									className="pl-9"
								/>
							</div>
						</div>

						{/* Table */}
						<Table>
							<TableHeader>
								{table.getHeaderGroups().map((headerGroup) => (
									<TableRow key={headerGroup.id}>
										{headerGroup.headers.map((header) => (
											<TableHead key={header.id}>
												{header.isPlaceholder
													? null
													: flexRender(
															header.column
																.columnDef
																.header,
															header.getContext()
														)}
											</TableHead>
										))}
									</TableRow>
								))}
							</TableHeader>
							<TableBody>
								{table.getRowModel().rows?.length ? (
									table.getRowModel().rows.map((row) => (
										<TableRow key={row.id}>
											{row
												.getVisibleCells()
												.map((cell) => (
													<TableCell key={cell.id}>
														{flexRender(
															cell.column
																.columnDef.cell,
															cell.getContext()
														)}
													</TableCell>
												))}
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={columns.length}
											className="h-24 text-center text-gray-500"
										>
											{localization.cm_no_results_found || "No results found."}
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>

						{/* Pagination */}
						<div className="flex items-center justify-between px-4 py-3 border-t">
							<div className="text-sm text-gray-500">
								{table.getFilteredRowModel().rows.length}{" "}
								{localization.cm_table_results || "result(s)"}
							</div>
							<div className="flex items-center gap-2">
								<span className="text-sm text-gray-700">
									{localization.cm_table_page || "Page"}{" "}
									{table.getState().pagination.pageIndex + 1}{" "}
									{localization.text_of || "of"} {table.getPageCount()}
								</span>
								<Button
									variant="outline"
									size="sm"
									onClick={() => table.previousPage()}
									disabled={!table.getCanPreviousPage()}
								>
									<ChevronLeft className="h-4 w-4" />
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => table.nextPage()}
									disabled={!table.getCanNextPage()}
								>
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default CaseManagerRegistrationsPage;
