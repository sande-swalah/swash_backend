const { listAlerts, markRead } = require('../model/alert_repo');

async function list(req, res) {
  try {
    return res.json({ alerts: await listAlerts(req.user.sub) });
  } catch (err) {
    return res.status(500).json({ message: 'Unable to load alerts' });
  }
}

async function read(req, res) {
  try {
    const alert = await markRead(req.params.id, req.user.sub);
    return alert ? res.json({ alert }) : res.status(404).json({ message: 'Alert not found' });
  } catch (err) {
    return res.status(500).json({ message: 'Unable to update alert' });
  }
}

module.exports = { list, read };