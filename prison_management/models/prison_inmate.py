# -*- coding: utf-8 -*-
# Part of Odoo Enterprise. See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError
from datetime import date


class PrisonInmate(models.Model):
    _name = 'prison.inmate'
    _description = 'Inmate Custody Master Record'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'admission_date desc, id desc'

    # Identification
    name = fields.Char(string='Full Legal Name', compute='_compute_full_name', store=True, index=True)
    first_name = fields.Char(string='First Name', required=True, tracking=True)
    last_name = fields.Char(string='Last / Family Name', required=True, tracking=True)
    alias = fields.Char(string='Alias / Street Moniker')
    booking_number = fields.Char(string='Booking / Prison Number', required=True, copy=False, readonly=True, index=True, default=lambda self: _('New'))
    national_id = fields.Char(string='National ID / Passport No.', tracking=True)
    gender = fields.Selection([
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ], string='Gender', required=True, default='male')
    date_of_birth = fields.Date(string='Date of Birth', required=True)
    age = fields.Integer(string='Age', compute='_compute_age')
    photo = fields.Binary(string='Mugshot / Intake Photograph', attachment=True)

    # Location & Facility
    facility_id = fields.Many2one('prison.facility', string='Assigned Facility', required=True, tracking=True, index=True)
    cell_location = fields.Char(string='Cell / Block Location', tracking=True, placeholder='e.g. Block B, Cell 04')

    # Custody Workflow Status
    custody_status = fields.Selection([
        ('draft', 'Intake Draft'),
        ('remand', 'Remand (Awaiting Trial)'),
        ('convicted', 'Convicted (Serving Sentence)'),
        ('in_transit', 'In Transit'),
        ('on_bail', 'Released on Bail'),
        ('escaped', 'Escaped (Red Alert)'),
        ('recaptured', 'Recaptured'),
        ('discharged', 'Lawfully Discharged'),
    ], string='Custody Status', default='remand', required=True, tracking=True, index=True)

    admission_date = fields.Date(string='Admission Date', default=fields.Date.context_today, required=True, tracking=True)
    admission_type = fields.Selection([
        ('court_committal', 'Court Committal Warrant'),
        ('transfer_in', 'Inter-Prison Transfer'),
        ('bail_revocation', 'Bail Revocation / Re-Arrest'),
        ('recaptured', 'Recaptured Escaped Fugitive'),
        ('new_remand', 'Police Remand Committal'),
        ('conviction', 'Trial Conviction Warrant'),
    ], string='Admission Type', default='new_remand', required=True, tracking=True)

    # Security & Progressive Classification
    security_category = fields.Selection([
        ('CAT_A', 'Category A - Maximum Security (High Escape/Violence Risk)'),
        ('CAT_B', 'Category B - High Security'),
        ('CAT_C', 'Category C - Medium Security'),
        ('CAT_D', 'Category D - Minimum / Open Camp Trust'),
    ], string='Security Classification', default='CAT_B', required=True, tracking=True)

    progressive_stage = fields.Selection([
        ('stage_1', 'Stage 1: Induction & Strict Supervision'),
        ('stage_2', 'Stage 2: Standard General Association'),
        ('stage_3', 'Stage 3: Advanced Vocational Privileges'),
        ('stage_4', 'Stage 4: Pre-Release Open Camp Trust'),
    ], string='Progressive Stage', default='stage_1', required=True, tracking=True)

    behavior_score = fields.Integer(string='Conduct Behavior Score (0-100)', default=80, tracking=True)

    # Biometrics Reference
    biometric_fingerprint_enrolled = fields.Boolean(string='Biometric Fingerprints Enrolled', default=False, tracking=True)
    biometric_iris_enrolled = fields.Boolean(string='Iris Biometric Scanned', default=False)
    dna_sample_ref = fields.Char(string='National Forensic DNA Ref')
    scars_tattoos = fields.Text(string='Physical Marks, Scars & Tattoos')

    # Medical & Next of Kin
    dietary_medical_notes = fields.Text(string='Medical & Dietary Constraints')
    emergency_contact_name = fields.Char(string='Next of Kin Name')
    emergency_contact_phone = fields.Char(string='Emergency Contact Phone')
    emergency_contact_relation = fields.Char(string='Relationship')

    # Relational Data Links
    sentence_ids = fields.One2many('prison.sentence', 'inmate_id', string='Sentences')
    sentence_count = fields.Integer(string='Sentences Count', compute='_compute_counts')
    
    remission_log_ids = fields.One2many('prison.remission.log', 'inmate_id', string='Remission Adjustments')
    total_remission_days = fields.Integer(string='Net Remission Days Earned', compute='_compute_remission')

    court_hearing_ids = fields.One2many('prison.court.hearing', 'inmate_id', string='Court Dockets')
    court_count = fields.Integer(string='Court Hearings Count', compute='_compute_counts')

    transfer_ids = fields.One2many('prison.transfer', 'inmate_id', string='Transfers History')
    transfer_count = fields.Integer(string='Transfers Count', compute='_compute_counts')

    property_ids = fields.One2many('prison.inmate.property', 'inmate_id', string='Personal Property in Vault')
    property_count = fields.Integer(string='Vaulted Items Count', compute='_compute_counts')

    gratuity_transaction_ids = fields.One2many('prison.gratuity.transaction', 'inmate_id', string='Gratuity Transactions')
    gratuity_balance = fields.Float(string='Current Gratuity Balance', compute='_compute_gratuity', store=True)

    rehab_enrollment_ids = fields.One2many('prison.program.enrollment', 'inmate_id', string='Rehab & Vocational Enrollments')
    human_rights_audit_ids = fields.One2many('prison.human.rights.audit', 'inmate_id', string='Human Rights & Mandela Audits')
    discharge_record_id = fields.Many2one('prison.discharge.clearance', string='Discharge Clearance Record')

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('booking_number', _('New')) == _('New'):
                vals['booking_number'] = self.env['ir.sequence'].next_by_code('prison.inmate.booking') or _('New')
        return super().create(vals_list)

    @api.depends('first_name', 'last_name')
    def _compute_full_name(self):
        for rec in self:
            rec.name = f"{rec.first_name or ''} {rec.last_name or ''}".strip()

    @api.depends('date_of_birth')
    def _compute_age(self):
        today = date.today()
        for rec in self:
            if rec.date_of_birth:
                rec.age = today.year - rec.date_of_birth.year - (
                    (today.month, today.day) < (rec.date_of_birth.month, rec.date_of_birth.day)
                )
            else:
                rec.age = 0

    @api.depends('sentence_ids', 'court_hearing_ids', 'transfer_ids', 'property_ids')
    def _compute_counts(self):
        for rec in self:
            rec.sentence_count = len(rec.sentence_ids)
            rec.court_count = len(rec.court_hearing_ids)
            rec.transfer_count = len(rec.transfer_ids)
            rec.property_count = len(rec.property_ids)

    @api.depends('sentence_ids.remission_earned_days', 'sentence_ids.remission_forfeited_days')
    def _compute_remission(self):
        for rec in self:
            earned = sum(rec.sentence_ids.mapped('remission_earned_days'))
            forfeited = sum(rec.sentence_ids.mapped('remission_forfeited_days'))
            rec.total_remission_days = max(0, earned - forfeited)

    @api.depends('gratuity_transaction_ids.amount', 'gratuity_transaction_ids.transaction_type')
    def _compute_gratuity(self):
        for rec in self:
            balance = 0.0
            for tx in rec.gratuity_transaction_ids:
                if tx.transaction_type in ['wage_credit', 'bonus']:
                    balance += tx.amount
                elif tx.transaction_type in ['commissary_debit', 'fine_deduction', 'exit_payout']:
                    balance -= tx.amount
            rec.gratuity_balance = max(0.0, balance)

    # Action Buttons
    def action_trigger_escape(self):
        self.ensure_one()
        return {
            'name': _('Escape Red Alert Incident Wizard'),
            'type': 'ir.actions.act_window',
            'res_model': 'prison.escape.wizard',
            'view_mode': 'form',
            'target': 'new',
            'context': {'default_inmate_id': self.id, 'default_facility_id': self.facility_id.id},
        }

    def action_initiate_transfer(self):
        self.ensure_one()
        return {
            'name': _('Initiate Transfer Requisition'),
            'type': 'ir.actions.act_window',
            'res_model': 'prison.transfer',
            'view_mode': 'form',
            'context': {
                'default_inmate_id': self.id,
                'default_from_facility_id': self.facility_id.id,
            },
        }

    def action_open_discharge_wizard(self):
        self.ensure_one()
        return {
            'name': _('Prisons Act Discharge Clearance Wizard'),
            'type': 'ir.actions.act_window',
            'res_model': 'prison.discharge.wizard',
            'view_mode': 'form',
            'target': 'new',
            'context': {'default_inmate_id': self.id},
        }

    def action_view_sentences(self):
        self.ensure_one()
        return {
            'name': _('Sentences - %s') % self.name,
            'type': 'ir.actions.act_window',
            'res_model': 'prison.sentence',
            'view_mode': 'list,form',
            'domain': [('inmate_id', '=', self.id)],
            'context': {'default_inmate_id': self.id},
        }

    def action_view_court_dockets(self):
        self.ensure_one()
        return {
            'name': _('Court Dockets - %s') % self.name,
            'type': 'ir.actions.act_window',
            'res_model': 'prison.court.hearing',
            'view_mode': 'list,form',
            'domain': [('inmate_id', '=', self.id)],
            'context': {'default_inmate_id': self.id},
        }


class PrisonInmateProperty(models.Model):
    _name = 'prison.inmate.property'
    _description = 'Inmate Personal Property Held in Vault'
    _order = 'id desc'

    inmate_id = fields.Many2one('prison.inmate', string='Inmate', required=True, ondelete='cascade', index=True)
    description = fields.Char(string='Property Item Description', required=True)
    category = fields.Selection([
        ('cash', 'Legal Currency / Cash'),
        ('electronics', 'Electronics & Phones'),
        ('jewelry', 'Jewelry & Watches'),
        ('clothing', 'Civilian Clothing'),
        ('documents', 'Legal & Identity Documents'),
    ], string='Item Category', default='clothing', required=True)
    quantity = fields.Integer(string='Qty', default=1)
    condition = fields.Char(string='Intake Condition Notes', default='Good / As surrendered')
    seal_bag_number = fields.Char(string='Tamper-Proof Vault Seal Bag Number', required=True)
    status = fields.Selection([
        ('held_in_vault', 'Secured in Vault'),
        ('returned_on_exit', 'Returned at Discharge'),
        ('confiscated', 'Contraband / Confiscated'),
    ], string='Vault Status', default='held_in_vault', required=True)
    intake_officer_id = fields.Many2one('res.users', string='Intake Officer', default=lambda self: self.env.user)
