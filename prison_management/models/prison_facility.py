# -*- coding: utf-8 -*-
# Part of Odoo Enterprise. See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class PrisonFacility(models.Model):
    _name = 'prison.facility'
    _description = 'Correctional Facility & Penitentiary'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'name asc'

    name = fields.Char(string='Facility Name', required=True, tracking=True, index=True)
    code = fields.Char(string='Facility Code', required=True, copy=False, tracking=True)
    facility_type = fields.Selection([
        ('maximum', 'Maximum Security Penitentiary'),
        ('medium', 'Medium Security Facility'),
        ('minimum', 'Minimum Security / Open Camp'),
        ('remand', 'Remand & Allocation Center'),
        ('women', 'Women Correctional Facility'),
        ('juvenile', 'Youth Rehabilitation Center'),
    ], string='Facility Type', default='medium', required=True, tracking=True)

    warden_id = fields.Many2one('res.users', string='Superintendent / Warden', tracking=True)
    warden_name = fields.Char(string='Warden Name')
    phone = fields.Char(string='Emergency Control Room Phone')
    email = fields.Char(string='Official Email')
    street = fields.Char(string='Street Address')
    city = fields.Char(string='County / State / City', required=True)
    country_id = fields.Many2one('res.country', string='Country', default=lambda self: self.env.ref('base.ke', raise_if_not_found=False))

    latitude = fields.Float(string='Latitude', digits=(10, 7))
    longitude = fields.Float(string='Longitude', digits=(10, 7))

    # Capacity & Occupancy
    capacity = fields.Integer(string='Certified Bed Capacity', default=500, required=True, tracking=True)
    current_occupancy = fields.Integer(string='Current Inmates Population', compute='_compute_occupancy', store=True)
    occupancy_rate = fields.Float(string='Occupancy Rate (%)', compute='_compute_occupancy', store=True)
    is_overcrowded = fields.Boolean(string='Overcrowding Alert', compute='_compute_occupancy', store=True)

    # Inmate & Facilities Relations
    inmate_ids = fields.One2many('prison.inmate', 'facility_id', string='Inmate Population')
    block_ids = fields.One2many('prison.facility.block', 'facility_id', string='Cell Blocks & Wings')
    fleet_vehicle_ids = fields.One2many('prison.fleet.vehicle', 'facility_id', string='Assigned Fleet Vehicles')
    transfer_in_ids = fields.One2many('prison.transfer', 'to_facility_id', string='Incoming Transfers')
    transfer_out_ids = fields.One2many('prison.transfer', 'from_facility_id', string='Outgoing Transfers')

    active = fields.Boolean(default=True)
    notes = fields.Html(string='Facility Brief & Directives')

    _sql_constraints = [
        ('code_unique', 'unique(code)', 'The facility code must be globally unique!'),
    ]

    @api.depends('inmate_ids', 'inmate_ids.custody_status', 'capacity')
    def _compute_occupancy(self):
        for rec in self:
            active_inmates = rec.inmate_ids.filtered(lambda i: i.custody_status in ['remand', 'convicted', 'in_transit'])
            count = len(active_inmates)
            rec.current_occupancy = count
            if rec.capacity > 0:
                rate = (count / rec.capacity) * 100.0
                rec.occupancy_rate = round(rate, 1)
                rec.is_overcrowded = count > rec.capacity
            else:
                rec.occupancy_rate = 0.0
                rec.is_overcrowded = False

    def action_view_inmates(self):
        self.ensure_one()
        return {
            'name': _('Inmates - %s') % self.name,
            'type': 'ir.actions.act_window',
            'res_model': 'prison.inmate',
            'view_mode': 'list,kanban,form',
            'domain': [('facility_id', '=', self.id), ('custody_status', 'in', ['remand', 'convicted'])],
            'context': {'default_facility_id': self.id},
        }

    def action_view_transfers(self):
        self.ensure_one()
        return {
            'name': _('Transfers - %s') % self.name,
            'type': 'ir.actions.act_window',
            'res_model': 'prison.transfer',
            'view_mode': 'list,form',
            'domain': ['|', ('from_facility_id', '=', self.id), ('to_facility_id', '=', self.id)],
        }
