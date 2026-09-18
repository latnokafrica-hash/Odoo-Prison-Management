# -*- coding: utf-8 -*-
# Part of Odoo Enterprise. See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError


class PrisonFleetVehicle(models.Model):
    _name = 'prison.fleet.vehicle'
    _description = 'Correctional Transport Fleet & Armored Prisoner Cellular Van'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'name asc'

    name = fields.Char(string='Vehicle Plate / Call Sign', required=True, tracking=True, index=True)
    facility_id = fields.Many2one('prison.facility', string='Base Prison Depot', required=True)
    model_name = fields.Char(string='Vehicle Make & Model', default='Mercedes-Benz Sprinter 519 Armored Cellular Van')
    chassis_number = fields.Char(string='VIN / Chassis Number')

    vehicle_type = fields.Selection([
        ('armored_cellular_van', 'Heavy Armored Cellular Prisoner Van (Individual Isolation Cages)'),
        ('convoy_chase_car', 'Armed Tactical Escort / Chase Vehicle'),
        ('bus_mass_transit', 'Secured Heavy Mass Transit Prisoner Coach'),
        ('ambulance_prison', 'Secure Custodial Ambulance'),
    ], string='Transport Vehicle Class', default='armored_cellular_van', required=True)

    armor_security_level = fields.Selection([
        ('level_b6', 'Ballistic Level B6 (High Rifle Protection)'),
        ('level_b4', 'Level B4 (Handgun & Riot Shrapnel)'),
        ('standard_caged', 'Heavy Duty Steel Wire Cage Reinforced'),
    ], string='Armor & Ballistic Protection', default='level_b6', required=True)

    cellular_cages_capacity = fields.Integer(string='Prisoner Cell Capacity', default=8, required=True)
    armed_guard_capacity = fields.Integer(string='Armed Officers Seating Capacity', default=4, required=True)
    gps_tracker_id = fields.Char(string='Satellite GPS Transponder ID', default='GPS-SAT-088')
    fuel_level_percentage = fields.Integer(string='Fuel Level (%)', default=100)
    odometer_km = fields.Float(string='Odometer (km)', default=45000.0)

    operational_status = fields.Selection([
        ('ready', 'Depot Ready / Mission Cleared'),
        ('in_convoy', 'Actively Deployed in Court Convoy'),
        ('maintenance', 'Mechanical / Radio Maintenance Workshop'),
        ('quarantine', 'Decontaminated / Sanitized'),
    ], string='Vehicle Readiness Status', default='ready', required=True, tracking=True)

    convoy_ids = fields.Many2many('prison.fleet.convoy', 'prison_fleet_vehicle_convoy_rel', 'vehicle_id', 'convoy_id', string='Assigned Convoys')


class PrisonFleetConvoy(models.Model):
    _name = 'prison.fleet.convoy'
    _description = 'Armed Judicial Court Convoy & Escort Transit Mission'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'departure_datetime desc, id desc'

    name = fields.Char(string='Convoy Mission Code', required=True, copy=False, readonly=True, default=lambda self: _('New'))
    facility_id = fields.Many2one('prison.facility', string='Originating Facility', required=True, tracking=True)
    destination_court_name = fields.Char(string='Destination Judicial Court / Station', required=True, tracking=True)
    
    departure_datetime = fields.Datetime(string='Scheduled Departure Time', required=True, default=fields.Datetime.now, tracking=True)
    estimated_arrival_datetime = fields.Datetime(string='Estimated Court Arrival Time')
    actual_arrival_datetime = fields.Datetime(string='Actual Court Arrival Timestamp')
    return_base_datetime = fields.Datetime(string='Returned to Prison Gate')

    escort_commander_name = fields.Char(string='Convoy Commander (OIC)', default='Chief Inspector of Escorts', required=True)
    armed_officers_count = fields.Integer(string='Number of Armed Tactical Officers', default=6)
    
    vehicle_ids = fields.Many2many('prison.fleet.vehicle', 'prison_fleet_vehicle_convoy_rel', 'convoy_id', 'vehicle_id', string='Convoy Vehicles', required=True)
    inmate_ids = fields.Many2many('prison.inmate', 'prison_fleet_convoy_inmate_rel', 'convoy_id', 'inmate_id', string='Inmates in Transport Manifest', required=True)
    inmate_count = fields.Integer(string='Total Inmates Transported', compute='_compute_counts', store=True)

    court_hearing_ids = fields.One2many('prison.court.hearing', 'convoy_id', string='Linked Court Hearings')

    convoy_security_rating = fields.Selection([
        ('CAT_A_HIGH_THREAT', 'Tier 1: Category A High Threat (Armed Chase Escort Required)'),
        ('STANDARD_SECURE', 'Tier 2: Standard Armed Judicial Escort'),
        ('MINIMUM_ESCORT', 'Tier 3: Minimum Security Low Risk Escort'),
    ], string='Security Threat Rating', default='STANDARD_SECURE', required=True, tracking=True)

    status = fields.Selection([
        ('planned', 'Mission Planned & Manifested'),
        ('staging', 'Armed Staging & Inmates Boarded'),
        ('en_route_court', 'En Route to Court (Satellite Monitored)'),
        ('at_court', 'Arrived at Court Holding Cells'),
        ('en_route_prison', 'Returning to Base Facility'),
        ('completed', 'Mission Safely Concluded at Base'),
        ('emergency_alert', 'EMERGENCY: Distress Beacon Activated'),
    ], string='Convoy Status', default='planned', required=True, tracking=True)

    radio_comm_log = fields.Text(string='Operations Control Room Radio Log')

    @api.depends('inmate_ids')
    def _compute_counts(self):
        for rec in self:
            rec.inmate_count = len(rec.inmate_ids)

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', _('New')) == _('New'):
                vals['name'] = self.env['ir.sequence'].next_by_code('prison.fleet.convoy') or _('CNV-NEW')
        return super().create(vals_list)

    def action_stage_convoy(self):
        for rec in self:
            rec.status = 'staging'
            rec.vehicle_ids.write({'operational_status': 'in_convoy'})
            rec.inmate_ids.write({'custody_status': 'in_transit'})
            rec.message_post(body=_("Convoy staged and loaded with %d inmates.") % rec.inmate_count)

    def action_dispatch_en_route(self):
        for rec in self:
            rec.status = 'en_route_court'
            rec.message_post(body=_("Convoy departed gate en route to %s.") % rec.destination_court_name)

    def action_arrive_court(self):
        for rec in self:
            rec.status = 'at_court'
            rec.actual_arrival_datetime = fields.Datetime.now()
            rec.message_post(body=_("Convoy safely arrived at %s holding cells.") % rec.destination_court_name)

    def action_return_en_route(self):
        for rec in self:
            rec.status = 'en_route_prison'
            rec.message_post(body=_("Convoy departed court returning to base penitentiary."))

    def action_complete_mission(self):
        for rec in self:
            rec.status = 'completed'
            rec.return_base_datetime = fields.Datetime.now()
            rec.vehicle_ids.write({'operational_status': 'ready'})
            rec.inmate_ids.write({'custody_status': 'remand'})
            rec.message_post(body=_("Mission completed. All inmates secured in cell blocks."))
