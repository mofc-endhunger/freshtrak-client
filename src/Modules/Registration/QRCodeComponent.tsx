import * as React from "react";
import QRCode from "qrcode";
import { useParams } from "react-router-dom";
import { useEffect, useRef } from "react";

const QRCodeComponent: React.FC = () => {
	const { code } = useParams<{ code: string }>();
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (canvasRef.current && code) {
			QRCode.toCanvas(
				canvasRef.current,
				`https://secure.pantrytrak.com/mobile/qr_code_processing.php?code=${code.toUpperCase()}`
			);
		}
	}, [code]);

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
			<div className="max-w-md mx-auto p-6 bg-white">
				<h2 className="text-2xl font-bold text-center mb-6">
					Your QR Code
				</h2>
				<div className="flex justify-center">
					<canvas ref={canvasRef} />
				</div>
			</div>
		</div>
	);
};

export default QRCodeComponent;
