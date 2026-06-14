async function fetchCryptoPrice() {
    console.log("Connecting to the global exchange network...");
    
    try {
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
        const data = await response.json();
        const bitcoinPrice = data.bitcoin.usd;
        
        console.log("=========================================");
        console.log("Connection Secure. Real-Time Data Retrieved:");
        console.log("Current Bitcoin Value: $" + bitcoinPrice + " USD");
        console.log("=========================================");

    } catch (error) {
        console.log("Network error: Could not reach the remote server.");
        console.log("Details: ", error.message);
    }
}

setInterval(fetchCryptoPrice, 10000);

