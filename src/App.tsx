import React from "react";
import AppRoutes from "./Core/Routes";
import { useSelector } from "react-redux";
import { RootState } from "./Store/store";

// import "./Assets/scss/main.scss";
// import "./Assets/css/style.css";

const App: React.FC = () => {
	React.useEffect(() => {}, []);
	const language = useSelector((state: RootState) => state.language.language);
	console.log("inside app routes app.js lan", language);
	return (
		<div className="App">
			<div className="main-wrapper">
				<AppRoutes />
			</div>
		</div>
	);
};

export default App;
