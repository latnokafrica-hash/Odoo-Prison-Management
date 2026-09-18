# -*- coding: utf-8 -*-
# Part of Odoo Enterprise. See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class PrisonFacilityBlock(models.Model):
    _name = 'prison.facility.block'
    _description = 'Prison Cell Block & Wing'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'facility_id asc, name asc'

    name = fields.Char(string='Block / Wing Name', required=True, tracking=True)
    code = fields.Char(string='Block Code', required=True)
    facility_id = fields.Many2one('prison.facility', string='Facility', required=True, ondelete='cascade', tracking=True)
    block_type = fields.Selection([
        ('general_population', 'General Population Block'),
        ('high_security', 'High Security / Isolation Unit'),
        ('remand_wing', 'Remand Intake Wing'),
        ('hospital_wing', 'Infirmary & Medical Wing'),
        ('juvenile_wing', 'Youth & Education Wing'),
        ('female_wing', 'Female Dedicated Wing'),
    ], string='Block Classification', default='general_population', required=True)

    supervisor_id = fields.Many2one('res.users', string='Block Officer-in-Charge (OIC)')
    floor_level = fields.Integer(string='Floor / Level', default=1)
    cell_ids = fields.One2many('prison.facility.cell', 'block_id', string='Cells in Block')
    total_cells = fields.Integer(string='Total Cells', compute='_compute_capacity', store=True)
    capacity = fields.Integer(string='Total Bed Capacity', compute='_compute_capacity', store=True)
    current_occupancy = fields.Integer(string='Current Inmates', compute='_compute_capacity', store=True)
    occupancy_rate = fields.Float(string='Occupancy Rate (%)', compute='_compute_capacity', store=True)

    @api.depends('cell_ids', 'cell_ids.capacity', 'cell_ids.current_occupancy')
    def _compute_capacity(self):
        for rec in self:
            rec.total_cells = len(rec.cell_ids)
            rec.capacity = sum(rec.cell_ids.mapped('capacity'))
            rec.current_occupancy = sum(rec.cell_ids.mapped('current_occupancy'))
            rec.occupancy_rate = round((rec.current_occupancy / rec.capacity * 100.0), 1) if rec.capacity > 0 else 0.0


class PrisonFacilityCell(models.Model):
    _name = 'prison.facility.cell'
    _description = 'Inmate Detention Cell / Room'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'block_id asc, name asc'

    name = fields.Char(string='Cell Identifier', required=True, tracking=True)
    block_id = fields.Many2one('prison.facility.block', string='Block / Wing', required=True, ondelete='cascade')
    facility_id = fields.Many2one(related='block_id.facility_id', string='Facility', store=True)
    
    cell_type = fields.Selection([
        ('single_cell', 'Single Isolation / Disciplinary Cell'),
        ('double_cell', 'Double Occupancy Cell'),
        ('dormitory', 'Group Dormitory Ward (4-12 Inmates)'),
        ('medical_cell', 'Medical Quarantine Cell'),
        ('padded_cell', 'Psychiatric Observation Cell'),
    ], string='Cell Type', default='double_cell', required=True)

    security_level = fields.Selection([
        ('CAT_A', 'Reinforced Solid Steel & Electronic Interlock (CAT A)'),
        ('CAT_B', 'Heavy Barred Grille (CAT B)'),
        ('CAT_C', 'Standard Barred Cell (CAT C)'),
        ('CAT_D', 'Low Security Open Cubicle (CAT D)'),
    ], string='Security Hardening', default='CAT_B', required=True)

    capacity = fields.Integer(string='Bed Capacity', default=2, required=True)
    current_occupancy = fields.Integer(string='Occupants Count', compute='_compute_occupancy', store=True)
    available_beds = fields.Integer(string='Available Beds', compute='_compute_occupancy', store=True)
    is_full = fields.Boolean(string='Cell Full', compute='_compute_occupancy', store=True)

    inmate_ids = fields.One2many('prison.inmate', 'cell_id', string='Current Inmates')

    # Fixtures & Amenities Checklist
    has_bunk_beds = fields.Boolean(string='Bunk Bed Frames Installed', default=True)
    has_sanitary_toilet = fields.Boolean(string='Stainless Steel Sanitary Fixture', default=True)
    has_running_water = fields.Boolean(string='Potable Running Water', default=True)
    has_cctv_monitoring = fields.Boolean(string='CCTV Camera Surveillance', default=False)
    has_emergency_duress_call = fields.Boolean(string='Emergency Officer Call Button', default=True)
    has_natural_window = fields.Boolean(string='Natural Light & Ventilation Window', default=True)

    condition_status = fields.Selection([
        ('operational', 'Operational & Clean'),
        ('minor_repair', 'Minor Maintenance Required'),
        ('condemned', 'Condemned / Decommissioned'),
        ('quarantine', 'Medical Quarantine Seal'),
    ], string='Physical Condition', default='operational', required=True, tracking=True)

    maintenance_ids = fields.One2many('prison.cell.maintenance', 'cell_id', string='Maintenance Work Orders')
    last_shakedown_date = fields.Date(string='Last Security Shakedown / Contraband Search')
    last_inspected_by = fields.Char(string='Last Inspected By Officer')

    @api.depends('inmate_ids', 'inmate_ids.custody_status', 'capacity')
    def _compute_occupancy(self):
        for rec in self:
            active_inmates = rec.inmate_ids.filtered(lambda i: i.custody_status in ['remand', 'convicted', 'in_transit'])
            count = len(active_inmates)
            rec.current_occupancy = count
            rec.available_beds = max(0, rec.capacity - count)
            rec.is_full = count >= rec.capacity

    @api.constrains('current_occupancy', 'capacity')
    def _check_cell_overcrowding(self):
        for rec in self:
            if rec.capacity > 0 and rec.current_occupancy > rec.capacity:
                raise ValidationError(_("Cell %s in %s exceeds its certified bed capacity of %d!") % (rec.name, rec.block_id.name, rec.capacity))


class PrisonCellMaintenance(models.Model):
    _name = 'prison.cell.maintenance'
    _description = 'Cell Maintenance & Security Hardware Work Order'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'priority desc, request_date desc'

    name = fields.Char(string='Work Order Ref', required=True, copy=False, default=lambda self: _('WO-NEW'))
    cell_id = fields.Many2one('prison.facility.cell', string='Cell', required=True, ondelete='cascade')
    facility_id = fields.Many2one(related='cell_id.facility_id', string='Facility', store=True)
    request_date = fields.Date(string='Reported Date', default=fields.Date.context_today, required=True)
    reported_by = fields.Many2one('res.users', string='Reporting Officer', default=lambda self: self.env.user)

    maintenance_type = fields.Selection([
        ('lock_mechanism', 'Heavy Security Lock & Bolt Mechanism'),
        ('sanitary_plumbing', 'Plumbing & Anti-Ligature Toilet Fixture'),
        ('lighting_electrical', 'Security Lighting & Electrical Conduit'),
        ('bars_grille', 'Steel Bar Integrity & Window Weld Repair'),
        ('ventilation', 'Air Duct & Ventilation Grate Cleanout'),
        ('deep_sanitization', 'Cell Disinfection & Pest Control'),
    ], string='Issue Category', required=True, default='sanitary_plumbing')

    priority = fields.Selection([
        ('low', 'Standard (Non-Urgent)'),
        ('medium', 'Priority Maintenance'),
        ('urgent', 'Urgent Security Hazard / Lock Failure'),
    ], string='Priority Level', default='medium', required=True)

    status = fields.Selection([
        ('draft', 'Work Order Logged'),
        ('in_progress', 'Technicians on Site'),
        ('completed', 'Repairs Inspected & Certified'),
        ('cancelled', 'Cancelled'),
    ], string='Work Order Status', default='draft', required=True, tracking=True)

    technician_notes = fields.Text(string='Repair Notes & Parts Installed')
    completion_date = fields.Date(string='Completed Date')

    def action_start_repair(self):
        for rec in self:
            rec.status = 'in_progress'

    def action_complete_repair(self):
        for rec in self:
            rec.status = 'completed'
            rec.completion_date = fields.Date.context_today(self)
            rec.cell_id.condition_status = 'operational'
