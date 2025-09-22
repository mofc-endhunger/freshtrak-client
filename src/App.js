import React from "react";
import AppRoutes from "./Core/Routes";
import { useSelector } from "react-redux";
import { AuthProvider } from "./Modules/Authentication/AuthContext";
import "./amplify-config";

// import "./Assets/scss/main.scss";
// import "./Assets/css/style.css";

const App = () => {
	React.useEffect(() => {}, []);
	const language = useSelector(state => state.language.language);
	return (
		<div className="App">
			<div className="main-wrapper">
				<AuthProvider>
					<AppRoutes language={language} />
				</AuthProvider>
			</div>
		</div>
	);
};

export default App;
