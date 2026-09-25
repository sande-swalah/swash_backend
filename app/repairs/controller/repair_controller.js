const { createRepairSchema, updateRepairSchema, employeeRepairSchema } = require('../model/repair_schema');
const { createRepair, listRepairs, updateRepair, updateAssignedRepair } = require('../model/repair_repo');

async function create(req, res) {
  const { error, value } = createRepairSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  try {
    const repair = await createRepair({ ...value, userId: req.user.sub });
    return repair ? res.status(201).json({ repair }) : res.status(404).json({ message: 'Unit is not assigned to you' });
  } catch (err) {
    return res.status(500).json({ message: 'Unable to create repair request' });
  }
}

async function list(req, res) {
  try {
    return res.json({ repairs: await listRepairs(req.user) });
  } catch (err) {
    return res.status(500).json({ message: 'Unable to load repairs' });
  }
}

async function update(req, res) {
  const { error, value } = updateRepairSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  try {
    const repair = await updateRepair({ ...value, id: req.params.id, ownerId: req.user.sub });
    return repair ? res.json({ repair }) : res.status(404).json({ message: 'Repair not found' });
  } catch (err) {
    return res.status(400).json({ message: 'Unable to update repair' });
  }
}

async function updateAssigned(req, res) {
  const { error, value } = employeeRepairSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  try {
    const repair = await updateAssignedRepair({ ...value, id: req.params.id, employeeId: req.user.sub });
    return repair ? res.json({ repair }) : res.status(404).json({ message: 'Assigned repair not found' });
  } catch (err) {
    return res.status(500).json({ message: 'Unable to update assigned repair' });
  }
}

module.exports = { create, list, update, updateAssigned };