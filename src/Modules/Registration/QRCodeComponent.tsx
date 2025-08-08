import * as React from "react";
import QRCode from "qrcode.react";
import { useParams } from "react-router-dom";

const QRCodeComponent: React.FC = () => {
	const { code } = useParams<{ code: string }>();

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
			<div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
				<h2 className="text-2xl font-bold text-center mb-6">
					Your QR Code
				</h2>
				<div className="flex justify-center">
					<QRCode
						value={`https://secure.pantrytrak.com/mobile/qr_code_processing.php?code=${code?.toUpperCase()}`}
					/>
				</div>
			</div>
		</div>
	);
};

export default QRCodeComponent;
