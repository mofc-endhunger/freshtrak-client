import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const EligibilityModalComponent = ({
	show,
	close,
	columnData,
	rowsData,
	addOnData,
	header,
	footer,
}) => {
	const handleClose = () => close();
	const [slideValue, setSlideValue] = useState(4);
	const rowItem =
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
						onChange={setSlideValue}
						step={1}
						marks={{
							1: "1",
							[rowsData.length]: String(rowsData.length),
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
