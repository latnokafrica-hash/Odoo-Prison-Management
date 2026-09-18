# -*- coding: utf-8 -*-
# Part of Odoo Enterprise. See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api, _
from odoo.exceptions import UserError


class PrisonDischargeClearance(models.Model):
    _name = 'prison.discharge.clearance'
    _description = 'Custodial Discharge & Exit Management Clearance'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'clearance_date desc, id desc'

    name = fields.Char(string='Clearance Certificate No.', required=True, copy=False, readonly=True, default=lambda self: _('New'))
    inmate_id = fields.Many2one('prison.inmate', string='Inmate', required=True, tracking=True, index=True)
    facility_id = fields.Many2one(related='inmate_id.facility_id', string='Discharging Facility', store=True)
    clearance_date = fields.Date(string='Exit Clearance Date', default=fields.Date.context_today, required=True)
    gate_pass_number = fields.Char(string='Official Gate Pass Seal No.', readonly=True, copy=False)

    discharge_type = fields.Selection([
        ('sentence_completion', 'Sentence Expiration with Statutory Remission'),
        ('parole_license', 'Parole Board Release License'),
        ('pardon_clemency', 'Presidential Pardon / Clemency'),
        ('court_acquittal', 'Court Acquittal / Immediate Judicial Discharge'),
        ('bail_execution', 'Bail Bond Satisfaction'),
    ], string='Grounds for Discharge', default='sentence_completion', required=True)

    # 7-Point Mandatory Exit Checklist
    chk_biometric_exit_match = fields.Boolean(string='1. Exit 10-Print Biometric Verification Matched', default=False)
    chk_judicial_no_hold = fields.Boolean(string='2. National Judicial "No-Hold / Outstanding Warrant" Clearance', default=False)
    chk_medical_exit_exam = fields.Boolean(string='3. Medical Fit-to-Discharge Examination Certified', default=False)
    chk_property_returned = fields.Boolean(string='4. All Vaulted Property & Valuables Returned & Signed', default=False)
    chk_gratuity_disbursed = fields.Boolean(string='5. Labor Gratuity Savings Balance Disbursed in Full', default=False)
    chk_transport_voucher = fields.Boolean(string='6. Statutory Bus / Train Transport Fare Voucher Issued', default=False)
    chk_aftercare_assigned = fields.Boolean(string='7. Community Aftercare & Parole Probation Officer Handover', default=False)

    aftercare_officer_name = fields.Char(string='Designated Probation / Aftercare Officer')
    gratuity_disbursed_amount = fields.Float(string='Disbursed Gratuity Total ($)')

    status = fields.Selection([
        ('checklist_in_progress', 'Checklist Verification in Progress'),
        ('approved_by_warden', 'Approved by Facility Warden'),
        ('cleared_gate', 'Gate Exit Executed (Discharged)'),
        ('archived', 'Archived Custody File'),
    ], string='Clearance Status', default='checklist_in_progress', required=True, tracking=True)

    all_checklist_passed = fields.Boolean(string='All Verification Checks Cleared', compute='_compute_checklist_cleared')

    @api.depends('chk_biometric_exit_match', 'chk_judicial_no_hold', 'chk_medical_exit_exam',
                 'chk_property_returned', 'chk_gratuity_disbursed', 'chk_transport_voucher',
                 'chk_aftercare_assigned')
    def _compute_checklist_cleared(self):
        for rec in self:
            rec.all_checklist_passed = all([
                rec.chk_biometric_exit_match,
                rec.chk_judicial_no_hold,
                rec.chk_medical_exit_exam,
                rec.chk_property_returned,
                rec.chk_gratuity_disbursed,
                rec.chk_transport_voucher,
                rec.chk_aftercare_assigned,
            ])

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', _('New')) == _('New'):
                vals['name'] = self.env['ir.sequence'].next_by_code('prison.discharge.cert') or _('New')
            if vals.get('gate_pass_number', _('New')) == _('New'):
                vals['gate_pass_number'] = self.env['ir.sequence'].next_by_code('prison.gate.pass') or _('GP-PENDING')
        return super().create(vals_list)

    def action_warden_approve(self):
        for rec in self:
            if not rec.all_checklist_passed:
                raise UserError(_("All 7 mandatory exit clearance points must be verified and checked before Warden approval!"))
            rec.status = 'approved_by_warden'
            rec.message_post(body=_("Warden has formally approved the discharge release."))

    def action_execute_gate_exit(self):
        for rec in self:
            if rec.status != 'approved_by_warden':
                raise UserError(_("Discharge must be approved by the Facility Warden prior to gate exit!"))
            rec.status = 'cleared_gate'
            rec.inmate_id.write({
                'custody_status': 'discharged',
                'cell_location': 'Discharged from Custody',
            })
            # Mark property returned
            rec.inmate_id.property_ids.write({'status': 'returned_on_exit'})
            rec.message_post(body=_("Inmate has passed the main perimeter gate. Custodial exit executed under Gate Pass %s.") % rec.gate_pass_number)

    def action_print_gate_pass(self):
        self.ensure_one()
        return self.env.ref('prison_management.action_report_gate_pass').report_action(self)
