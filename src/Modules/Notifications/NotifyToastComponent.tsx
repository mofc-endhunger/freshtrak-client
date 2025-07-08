import React from "react";
import { ToastContainer, toast, TypeOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type ToastType = "info" | "success" | "warn" | "error" | "default";

const toastTypes: Record<ToastType, TypeOptions> = {
	info: toast.TYPE.INFO,
	success: toast.TYPE.SUCCESS,
	warn: toast.TYPE.WARNING,
	error: toast.TYPE.ERROR,
	default: toast.TYPE.DEFAULT,
};

interface NotifyToastProps {
	position?:
		| "top-right"
		| "top-center"
		| "top-left"
		| "bottom-right"
		| "bottom-center"
		| "bottom-left";
}

export const showToast = (
	message: string,
	type: ToastType = "default"
): void => {
	toast(message, {
		type: toastTypes[type],
	});
};

export const NotifyToast: React.FC<NotifyToastProps> = ({
	position = "top-left",
}) => {
	return (
		<div className="notify-toast-container">
			<ToastContainer autoClose={false} position={position} />
		</div>
	);
};
