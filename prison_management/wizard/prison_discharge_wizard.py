# -*- coding: utf-8 -*-
# Part of Odoo Enterprise. See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api, _
from odoo.exceptions import UserError


class PrisonDischargeWizard(models.TransientModel):
    _name = 'prison.discharge.wizard'
    _description = 'Discharge Clearance Verification Wizard'

    inmate_id = fields.Many2one('prison.inmate', string='Inmate', required=True)
    facility_id = fields.Many2one(related='inmate_id.facility_id', string='Facility', readonly=True)
    discharge_type = fields.Selection([
        ('sentence_completion', 'Sentence Expiration with Statutory Remission'),
        ('parole_license', 'Parole Board Release License'),
        ('pardon_clemency', 'Presidential Pardon / Clemency'),
        ('court_acquittal', 'Court Acquittal / Immediate Judicial Discharge'),
        ('bail_execution', 'Bail Bond Satisfaction'),
    ], string='Discharge Basis', default='sentence_completion', required=True)

    # 7-point checklist verification
    chk_biometric_exit_match = fields.Boolean(string='1. Exit 10-Print Biometric Verification Matched', default=True)
    chk_judicial_no_hold = fields.Boolean(string='2. National Judicial "No-Hold" Warrant Clearance Verified', default=True)
    chk_medical_exit_exam = fields.Boolean(string='3. Medical Officer Exit Health Certificate Cleared', default=True)
    chk_property_returned = fields.Boolean(string='4. All Vaulted Property & Valuables Returned and Signed', default=True)
    chk_gratuity_disbursed = fields.Boolean(string='5. Labor Gratuity Balance Settled in Full', default=True)
    chk_transport_voucher = fields.Boolean(string='6. Statutory Travel Fare Warrant / Bus Voucher Issued', default=True)
    chk_aftercare_assigned = fields.Boolean(string='7. Assigned Community Aftercare & Parole Probation Officer', default=True)

    aftercare_officer_name = fields.Char(string='Designated Probation Officer', default='Senior Probation Officer K. Mwangi')

    def action_generate_clearance(self):
        self.ensure_one()
        inmate = self.inmate_id

        if not all([
            self.chk_biometric_exit_match,
            self.chk_judicial_no_hold,
            self.chk_medical_exit_exam,
            self.chk_property_returned,
            self.chk_gratuity_disbursed,
            self.chk_transport_voucher,
            self.chk_aftercare_assigned,
        ]):
            raise UserError(_("All 7 mandatory exit clearance points must be verified prior to creating discharge certificate!"))

        clearance = self.env['prison.discharge.clearance'].create({
            'inmate_id': inmate.id,
            'discharge_type': self.discharge_type,
            'chk_biometric_exit_match': self.chk_biometric_exit_match,
            'chk_judicial_no_hold': self.chk_judicial_no_hold,
            'chk_medical_exit_exam': self.chk_medical_exit_exam,
            'chk_property_returned': self.chk_property_returned,
            'chk_gratuity_disbursed': self.chk_gratuity_disbursed,
            'chk_transport_voucher': self.chk_transport_voucher,
            'chk_aftercare_assigned': self.chk_aftercare_assigned,
            'aftercare_officer_name': self.aftercare_officer_name,
            'gratuity_disbursed_amount': inmate.gratuity_balance,
            'status': 'approved_by_warden',
        })
        inmate.discharge_record_id = clearance.id

        # Return action to view newly created clearance certificate
        return {
            'name': _('Discharge Clearance Certificate'),
            'type': 'ir.actions.act_window',
            'res_model': 'prison.discharge.clearance',
            'res_id': clearance.id,
            'view_mode': 'form',
            'target': 'current',
        }
