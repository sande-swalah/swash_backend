const bcrypt = require('bcryptjs');
const { createUser } = require('../../users/model/user_repo');
const { generateToken } = require('../../users/validators/tokenization');
const { createInvitationSchema, acceptInvitationSchema } = require('../model/invitation_schema');
const { createInvitation, getValidInvitation, acceptInvitation } = require('../model/invitation_repo');

async function create(req, res) {
  const { error, value } = createInvitationSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  try {
    const invitation = await createInvitation({ ...value, invitedBy: req.user.sub });
    return invitation
      ? res.status(201).json({ invitation })
      : res.status(404).json({ message: 'Target property or unit was not found' });
  } catch (err) {
    return res.status(500).json({ message: 'Unable to create invitation' });
  }
}

async function accept(req, res) {
  const { error, value } = acceptInvitationSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  try {
    const invitation = await getValidInvitation(value.code, value.email);
    if (!invitation) return res.status(400).json({ message: 'Invitation is invalid or expired' });
    const passwordHash = await bcrypt.hash(value.password, 10);
    const user = await createUser({ email: value.email.toLowerCase(), passwordHash, role: invitation.role });
    await acceptInvitation(invitation.id, user.id, invitation);
    return res.status(201).json({ message: 'Invitation accepted', user, token: generateToken(user) });
  } catch (err) {
    return res.status(409).json({ message: 'Unable to accept invitation' });
  }
}

module.exports = { create, accept };