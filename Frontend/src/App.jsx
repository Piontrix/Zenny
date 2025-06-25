import "./App.css";
import HeroFormSection from "./components/HeroFormSection";

function App() {
	return (
		<>
			<div>
				{/* <div class="bg-zenny-primary text-zenny-text p-6 rounded-lg">
					<h1 class="text-3xl font-heading text-zenny-dark">Welcome to Zenny!</h1>
					<p class="mt-2">Your creative space to chat with editors.</p>
					<button class="mt-4 bg-zenny-accent text-white px-4 py-2 rounded hover:bg-zenny-dark">
						Book a Free Call
					</button>
				</div> */}
				<HeroFormSection />
			</div>
		</>
	);
}

export default App;
