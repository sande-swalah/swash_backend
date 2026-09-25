const { propertySchema, assignmentSchema } = require('../model/rental_schema');
const { createProperty, listProperties, getProperty, assignTenant } = require('../model/rental_repo');

async function create(req, res) {
  const { error, value } = propertySchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  try {
    return res.status(201).json({ property: await createProperty({ ...value, ownerId: req.user.sub }) });
  } catch (err) {
    return res.status(500).json({ message: 'Unable to create property' });
  }
}

async function list(req, res) {
  try {
    return res.json({ properties: await listProperties(req.user.sub) });
  } catch (err) {
    return res.status(500).json({ message: 'Unable to load properties' });
  }
}

async function get(req, res) {
  try {
    const property = await getProperty(req.params.id, req.user.sub);
    return property ? res.json({ property }) : res.status(404).json({ message: 'Property not found' });
  } catch (err) {
    return res.status(500).json({ message: 'Unable to load property' });
  }
}

async function assign(req, res) {
  const { error, value } = assignmentSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  try {
    const assignment = await assignTenant({ ...value, ownerId: req.user.sub });
    return assignment
      ? res.status(201).json({ assignment })
      : res.status(404).json({ message: 'Tenant or unit not found in your properties' });
  } catch (err) {
    return res.status(400).json({ message: 'Unable to assign tenant to unit' });
  }
}

module.exports = { create, list, get, assign };