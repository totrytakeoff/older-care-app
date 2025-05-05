const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const authRoutes = require('./routes/auth');
const healthRoutes = require('./routes/health');
const deviceRoutes = require('./routes/device');
const alertRoutes = require('./routes/alert');
const aiRoutes = require('./routes/ai');
const recordRoutes = require('./routes/record');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Load Swagger documentation
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/devices', deviceRoutes);
app.use('/api/v1/alerts', alertRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/records', recordRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    code: 200,
    message: '欢迎使用老年人健康监测系统 API',
    data: {
      version: '1.0.0',
      docs: '/api-docs'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`API文档: http://localhost:${PORT}/api-docs`);
}); 