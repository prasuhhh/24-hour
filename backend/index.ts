import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
