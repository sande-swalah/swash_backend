const { unitSchema } = require('../model/unit_schema');
const { createUnit, listUnits, getTenantUnit } = require('../model/unit_repo');

async function create(req, res) {
  const { error, value } = unitSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  try {
    const unit = await createUnit({ ...value, ownerId: req.user.sub });
    return unit ? res.status(201).json({ unit }) : res.status(404).json({ message: 'Property not found' });
  } catch (err) {
    return res.status(409).json({ message: 'Unable to create unit' });
  }
}

async function list(req, res) {
  try {
    return res.json({ units: await listUnits(req.params.propertyId, req.user.sub) });
  } catch (err) {
    return res.status(500).json({ message: 'Unable to load units' });
  }
}

async function mine(req, res) {
  try {
    const unit = await getTenantUnit(req.user.sub);
    return unit ? res.json({ unit }) : res.status(404).json({ message: 'No unit assigned' });
  } catch (err) {
    return res.status(500).json({ message: 'Unable to load assigned unit' });
  }
}

module.exports = { create, list, mine };