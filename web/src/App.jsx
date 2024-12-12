import { useEffect } from 'react'
import axios from 'axios';

const App = () => {
	useEffect(() => {
		const fetchData = async () => {
			try {
					const response = await axios.get('http://localhost:5000/api/data');
					console.log(response.data); // Should log: { message: 'Hello from API!' }
				} catch (error) {
					console.error('Error fetching data:', error);
				}
		};

		    fetchData();
		    }, []);

	return (
			<div>
			<h1>React Frontend</h1>
			<p>Check the console for the API response!</p>
			</div>
		);
};
export default App
