import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
// import About from "./pages/About";
// import Contact from "./pages/Contact";
// import Portfolio from "./pages/Portfolio";
// import Profile from "./pages/Profile";

const App = () => {
	return (
		<Router>
			<Layout>
				<Routes>
					<Route path="/" element={<Home />} />
					{/* <Route path="/about" element={<About />} />
					<Route path="/contact" element={<Contact />} />
					<Route path="/portfolio" element={<Portfolio />} />
					<Route path="/profile" element={<Profile />} /> */}
				</Routes>
			</Layout>
		</Router>
	);
};

export default App;
