import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

function App() {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pricing, setPricing] = useState({ basePrice: 0, pricePerCreditLine: 0, pricePerCreditScorePoint: 0 });
  const [calculatedPrices, setCalculatedPrices] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    const formData = new FormData();
    formData.append('file', file);

    axios.post('http://localhost:3000/upload', formData, {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      }
    }).then(response => {
      console.log(response.data);
    });
  };

  const fetchData = (page) => {
    axios.get(`http://localhost:3000/data?page=${page}`).then(response => {
      setData(response.data);
      // Update pagination logic here
    });
  };

  const handleCalculate = () => {
    axios.post('http://localhost:3000/calculate', pricing).then(response => {
      setCalculatedPrices(response.data);
    });
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  return (
    <div>
      <h1>CSV Upload and Subscription Pricing Calculator</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      <div>Upload Progress: {uploadProgress}%</div>

      <div>
        <h2>Data</h2>
        <table>
          <thead>
            <tr>
              <th>Credit Score</th>
              <th>Credit Lines</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.CreditScore}</td>
                <td>{item.CreditLines}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Add pagination controls here */}
      </div>

      <div>
        <h2>Subscription Pricing Calculator</h2>
        <input type="number" placeholder="Base Price" onChange={(e) => setPricing({ ...pricing, basePrice: e.target.value })} />
        <input type="number" placeholder="Price Per Credit Line" onChange={(e) => setPricing({ ...pricing, pricePerCreditLine: e.target.value })} />
        <input type="number" placeholder="Price Per Credit Score Point" onChange={(e) => setPricing({ ...pricing, pricePerCreditScorePoint: e.target.value })} />
        <button onClick={handleCalculate}>Calculate</button>
        <div>
          <h3>Calculated Prices</h3>
          <ul>
            {calculatedPrices.map((item, index) => (
              <li key={index}>{item.subscriptionPrice}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;

