import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Slider from "react-rangeslider";
import "react-rangeslider/lib/index.css";

interface EligibilityModalComponentProps {
	show: boolean;
	close: () => void;
	columnData: any[];
	rowsData: any[];
	addOnData: string;
	header?: string;
	footer?: string;
}

const EligibilityModalComponent: React.FC<EligibilityModalComponentProps> = ({
	show,
	close,
	columnData,
	rowsData,
	addOnData,
	header,
	footer,
}) => {
	const handleClose = (): void => close();
	const [slideValue, setSlideValue] = useState<number>(4);
	const rowItem: any[] =
		rowsData.length >= slideValue - 1 ? rowsData[slideValue - 1] : [];

	return (
		<Modal
			dialogClassName="light"
			size="lg"
			show={show}
			onHide={handleClose}
		>
			<Modal.Header closeButton>
				<Modal.Title>{header}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="mb-5">
					<span> Member Size </span>
					<Slider
						value={slideValue}
						min={1}
						max={rowsData.length}
						orientation="horizontal"
						onChange={(e: number) => setSlideValue(e)}
						labels={{
							0: "1",
							[rowsData.length]: rowsData.length.toString(),
						}}
					/>
				</div>
				<table className="table">
					<thead className="thead-light">
						<tr>
							{columnData.map((item, i) => (
								<th scope="col" key={i}>
									{item}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						<tr>
							{rowItem.map((row, j) => (
								<td key={j}>{row}</td>
							))}
						</tr>
					</tbody>
				</table>
				<span>Note: {addOnData}</span>
			</Modal.Body>
			<Modal.Footer className="justify-content-start">
				<span> {footer}</span>
			</Modal.Footer>
		</Modal>
	);
};

export default EligibilityModalComponent;
