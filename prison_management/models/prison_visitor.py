# -*- coding: utf-8 -*-
# Part of Odoo Enterprise. See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError


class PrisonVisitor(models.Model):
    _name = 'prison.visitor'
    _description = 'Inmate Visitor Profile & Security Vetting'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'name asc'

    name = fields.Char(string='Full Legal Name', required=True, tracking=True, index=True)
    national_id = fields.Char(string='National ID / Passport No.', required=True, tracking=True, index=True)
    phone = fields.Char(string='Phone Number', required=True)
    email = fields.Char(string='Email Address')
    address = fields.Char(string='Residential Address')
    photo = fields.Binary(string='Visitor Identification Photo', attachment=True)

    relationship = fields.Selection([
        ('spouse', 'Spouse / Domestic Partner'),
        ('parent', 'Parent / Guardian'),
        ('child', 'Son / Daughter'),
        ('sibling', 'Brother / Sister'),
        ('legal_counsel', 'Legal Counsel / Advocate (Privileged)'),
        ('religious_clergy', 'Religious Clergy / Chaplain'),
        ('consular_officer', 'Diplomatic / Consular Official'),
        ('friend', 'Approved Social Friend'),
    ], string='Relationship to Inmate', default='spouse', required=True)

    vetting_status = fields.Selection([
        ('cleared', 'Cleared for Visiting Privileges'),
        ('pending_review', 'Background Check in Progress'),
        ('barred', 'Barred / Blacklisted (Security Risk)'),
        ('suspended', 'Temporarily Suspended'),
    ], string='Security Clearance Status', default='cleared', required=True, tracking=True)

    barred_reason = fields.Text(string='Blacklist / Barred Justification')
    visit_session_ids = fields.One2many('prison.visit.session', 'visitor_id', string='Visit History')
    total_visits = fields.Integer(string='Total Visits Undertaken', compute='_compute_visits_count')

    @api.depends('visit_session_ids')
    def _compute_visits_count(self):
        for rec in self:
            rec.total_visits = len(rec.visit_session_ids)


class PrisonVisitSession(models.Model):
    _name = 'prison.visit.session'
    _description = 'Inmate Visitation Session & Parloir Booking'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'visit_date desc, scheduled_time asc'

    name = fields.Char(string='Visit Booking Reference', required=True, copy=False, readonly=True, default=lambda self: _('New'))
    inmate_id = fields.Many2one('prison.inmate', string='Inmate', required=True, tracking=True, index=True)
    facility_id = fields.Many2one(related='inmate_id.facility_id', string='Correctional Facility', store=True)
    visitor_id = fields.Many2one('prison.visitor', string='Visitor', required=True, tracking=True, index=True)
    relationship = fields.Selection(related='visitor_id.relationship', string='Relationship', readonly=True)

    visit_date = fields.Date(string='Visit Date', default=fields.Date.context_today, required=True, index=True)
    scheduled_time = fields.Char(string='Scheduled Slot (e.g. 10:00 - 10:45)', default='10:00 - 10:45', required=True)
    duration_minutes = fields.Integer(string='Allocated Duration (Minutes)', default=45)

    visiting_booth = fields.Char(string='Visiting Booth / Parloir No.', default='Booth 03 - Wing West', required=True)
    booth_type = fields.Selection([
        ('glass_partition', 'Non-Contact Security Glass Partition'),
        ('open_table', 'Supervised Open Table (Trust Inmates)'),
        ('legal_conference', 'Confidential Legal Counsel Suite'),
    ], string='Parloir Security Setup', default='glass_partition', required=True)

    # Security & Contraband Screening
    chk_id_verified = fields.Boolean(string='National ID Physically Inspected & Barcode Scanned', default=False)
    chk_metal_detector_cleared = fields.Boolean(string='Walkthrough Metal Detector & Millimeter Scanner Cleared', default=False)
    chk_canine_narcotics_cleared = fields.Boolean(string='K9 Contraband & Narcotics Sniffer Checked', default=False)
    chk_personal_items_vaulted = fields.Boolean(string='Mobile Phone, Smartwatches & Cash Vaulted in Locker', default=False)

    supervising_guard_id = fields.Many2one('res.users', string='Supervising Corrections Officer', default=lambda self: self.env.user)

    status = fields.Selection([
        ('booked', 'Scheduled & Booked'),
        ('admitted', 'Visitor Admitted Through Gate Post'),
        ('in_progress', 'Session Currently Active in Parloir'),
        ('completed', 'Visit Lawfully Concluded'),
        ('denied', 'Entry Denied at Security Screening'),
        ('terminated', 'Terminated Early for Rule Infraction'),
        ('no_show', 'No Show / Cancelled'),
    ], string='Visit Status', default='booked', required=True, tracking=True)

    incident_notes = fields.Text(string='Security Officer Remarks & Incident Logs')

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', _('New')) == _('New'):
                vals['name'] = self.env['ir.sequence'].next_by_code('prison.visit.session') or _('VISIT-NEW')
        return super().create(vals_list)

    def action_admit_visitor(self):
        for rec in self:
            if rec.visitor_id.vetting_status != 'cleared':
                raise UserError(_("Cannot admit visitor: Visitor security clearance status is %s!") % rec.visitor_id.vetting_status)
            if not rec.chk_id_verified or not rec.chk_metal_detector_cleared or not rec.chk_personal_items_vaulted:
                raise UserError(_("Mandatory visitor screening checks (ID, Metal Detector, Locker Vault) must be verified!"))
            rec.status = 'admitted'
            rec.message_post(body=_("Visitor %s admitted through security check to booth %s.") % (rec.visitor_id.name, rec.visiting_booth))

    def action_start_session(self):
        for rec in self:
            rec.status = 'in_progress'

    def action_complete_session(self):
        for rec in self:
            rec.status = 'completed'
            rec.message_post(body=_("Visit completed smoothly. Inmate escorted back to cell."))

    def action_deny_entry(self):
        for rec in self:
            rec.status = 'denied'
            rec.message_post(body=_("Visitor denied entry due to security screening finding."))
