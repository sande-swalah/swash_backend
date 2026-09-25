require('dotenv').config();

const express = require('express');
const userRoutes = require('./app/users/controller/user_routes');
const rentalRoutes = require('./app/rentals/controller/rental_routes');
const unitRoutes = require('./app/units/controller/unit_routes');
const billRoutes = require('./app/bills/controller/bill_routes');
const repairRoutes = require('./app/repairs/controller/repair_routes');
const paymentRoutes = require('./app/payments/controller/payment_routes');
const alertRoutes = require('./app/alerts_feature/controller/alert_routes');
const ownerDashboardRoutes = require('./app/owner_dashboard feature/controller/dashboard_routes');
const tenantDashboardRoutes = require('./app/tenants_dashboard_feature/controller/dashboard_routes');
const employeeDashboardRoutes = require('./app/employees_dashboard_feature/controller/dashboard_routes');
const invitationRoutes = require('./app/invitations/controller/invitation_routes');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');

    res.status(200).json({
      status: 'ok',
      database: 'connected',
      time: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

app.use('/api/users', userRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/dashboard/owner', ownerDashboardRoutes);
app.use('/api/dashboard/tenant', tenantDashboardRoutes);
app.use('/api/dashboard/employee', employeeDashboardRoutes);

if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  const shutdown = async (signal) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);

    server.close(async () => {
      try {
        await pool.end();
        console.log('PostgreSQL pool closed');
        process.exit(0);
      } catch (error) {
        console.error('Error closing PostgreSQL pool:', error.message);
        process.exit(1);
      }
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

module.exports = app;
