# -*- coding: utf-8 -*-
# Part of Odoo Enterprise. See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api, _
from odoo.exceptions import UserError


class PrisonTransfer(models.Model):
    _name = 'prison.transfer'
    _description = 'Inter-Prison Transfer Requisition & Transit Manifest'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'requisition_date desc, id desc'

    name = fields.Char(string='Transfer Reference', required=True, copy=False, readonly=True, default=lambda self: _('New'))
    inmate_id = fields.Many2one('prison.inmate', string='Inmate', required=True, tracking=True, index=True)
    from_facility_id = fields.Many2one('prison.facility', string='Source Facility', required=True, tracking=True)
    to_facility_id = fields.Many2one('prison.facility', string='Destination Facility', required=True, tracking=True)

    requisition_date = fields.Date(string='Requisition Date', default=fields.Date.context_today, required=True)
    transfer_reason = fields.Selection([
        ('overcrowding_relief', 'Overcrowding Relief & Bed Rebalancing'),
        ('security_reclassification', 'Security Reclassification & Risk Elevation'),
        ('court_proximity', 'Proximity to Appellate / Trial Court'),
        ('medical_specialty', 'Referral to Central Prison Hospital'),
        ('vocational_training', 'Transfer to Industrial Workshop Facility'),
    ], string='Transfer Justification', default='overcrowding_relief', required=True, tracking=True)

    escort_level = fields.Selection([
        ('armed_tactical', 'Armed Tactical Convoy (CAT A High Risk)'),
        ('standard_escort', 'Armed Standard Escort Squad'),
        ('minimum_custody', 'Unarmed Minimum Custody Escort'),
    ], string='Escort Security Protocol', default='standard_escort', required=True)

    transit_vehicle_number = fields.Char(string='Convoy Vehicle & Call Sign', default='CONVOY-UNIT-04')
    escort_commander = fields.Char(string='Escort Officer-in-Charge (OIC)', default='Chief Inspector of Prisons')

    status = fields.Selection([
        ('pending_approval', 'Pending Commissioner Approval'),
        ('authorized', 'Authorized & Scheduled'),
        ('in_transit', 'Departed - En Route in Transit'),
        ('completed', 'Arrived & Admitted at Destination'),
        ('cancelled', 'Cancelled by Directorate'),
    ], string='Transfer Status', default='pending_approval', required=True, tracking=True)

    transit_dispatched_at = fields.Datetime(string='Dispatched Timestamp')
    arrival_confirmed_at = fields.Datetime(string='Arrival Handover Timestamp')
    handover_notes = fields.Text(string='Receiving Facility Gate Handover Notes')

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', _('New')) == _('New'):
                vals['name'] = self.env['ir.sequence'].next_by_code('prison.transfer.req') or _('New')
        return super().create(vals_list)

    def action_authorize(self):
        for rec in self:
            rec.status = 'authorized'
            rec.message_post(body=_("Transfer authorized by Directorate Operations."))

    def action_dispatch(self):
        for rec in self:
            if rec.from_facility_id.id != rec.inmate_id.facility_id.id:
                raise UserError(_("Inmate is not currently detained at the source facility!"))
            rec.status = 'in_transit'
            rec.transit_dispatched_at = fields.Datetime.now()
            rec.inmate_id.custody_status = 'in_transit'
            rec.inmate_id.message_post(body=_("Inmate departed %s under armed transit to %s.") % (rec.from_facility_id.name, rec.to_facility_id.name))

    def action_confirm_arrival(self):
        for rec in self:
            rec.status = 'completed'
            rec.arrival_confirmed_at = fields.Datetime.now()
            # Update inmate facility
            rec.inmate_id.write({
                'facility_id': rec.to_facility_id.id,
                'custody_status': 'convicted' if rec.inmate_id.sentence_ids else 'remand',
                'cell_location': f"Intake Cell Block at {rec.to_facility_id.code}",
            })
            rec.inmate_id.message_post(body=_("Arrival confirmed. Custody officially transferred to %s.") % rec.to_facility_id.name)
