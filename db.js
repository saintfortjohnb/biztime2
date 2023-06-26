/** Database setup for BizTime. */

const { Client } = require('pg');

// Create a new instance of the PostgreSQL client
const client = new Client({
  connectionString: 'postgresql:///biztime', // Replace with your actual database credentials
});

// Connect to the database
client.connect()
  .then(() => {
    console.log('Connected to the PostgreSQL database');
  })
  .catch((err) => {
    console.error('Error connecting to the PostgreSQL database:', err);
  });

// Export the client object
module.exports = client;
