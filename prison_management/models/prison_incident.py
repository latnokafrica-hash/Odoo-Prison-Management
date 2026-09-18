# -*- coding: utf-8 -*-
# Part of Odoo Enterprise. See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class PrisonEscapeIncident(models.Model):
    _name = 'prison.escape.incident'
    _description = 'Escape Incident & Recapture Red Alert'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'incident_date desc, id desc'

    inmate_id = fields.Many2one('prison.inmate', string='Escaped Inmate', required=True, tracking=True, index=True)
    facility_id = fields.Many2one('prison.facility', string='Breached Facility', required=True, tracking=True)
    incident_date = fields.Datetime(string='Time of Breach / Alarm', default=fields.Datetime.now, required=True)
    escape_location = fields.Char(string='Perimeter Point / Scene', required=True)
    method_of_escape = fields.Char(string='Escape Modus Operandi', required=True)
    danger_level = fields.Selection([
        ('EXTREME', 'Extreme Risk (Armed / Violent Felon)'),
        ('HIGH', 'High Security Alert'),
        ('MODERATE', 'Moderate Risk'),
    ], string='Public Danger Classification', default='HIGH', required=True)

    status = fields.Selection([
        ('AT_LARGE', 'At Large (Red Alert Active)'),
        ('RECAPTURED', 'Recaptured & Re-committed'),
        ('DECEASED', 'Deceased during Pursuit'),
    ], string='Incident Status', default='AT_LARGE', required=True, tracking=True)

    recaptured_date = fields.Date(string='Date of Recapture')
    recaptured_by = fields.Char(string='Apprehending Law Enforcement Unit')
    disciplinary_forfeiture_days = fields.Integer(string='Mandatory Remission Forfeiture (Days)', default=90)


class PrisonHumanRightsAudit(models.Model):
    _name = 'prison.human.rights.audit'
    _description = 'UN Nelson Mandela Rules & Human Rights Compliance Audit'
    _order = 'date desc, id desc'

    inmate_id = fields.Many2one('prison.inmate', string='Inmate Audited', required=True, index=True)
    date = fields.Date(string='Inspection Date', default=fields.Date.context_today, required=True)
    auditor_name = fields.Char(string='Independent Inspector / Ombudsman', required=True)
    inspection_type = fields.Selection([
        ('un_mandela_rules', 'UN Nelson Mandela Rules Compliance (Rule 43/23/56)'),
        ('medical_health', 'Independent Healthcare & Sanitation Audit'),
        ('solitary_review', 'Strict Solitary Confinement Ceiling Review'),
        ('legal_access', 'Access to Legal Representation & Due Process'),
    ], string='Audit Mandate', default='un_mandela_rules', required=True)

    outdoor_hours_per_day = fields.Float(string='Daily Outdoor Physical Exercise (Hours)', default=1.5,
                                         help='Rule 23 requires at least 1 hour of daily open-air exercise.')
    consecutive_solitary_days = fields.Integer(string='Consecutive Solitary Confinement Days', default=0,
                                               help='Rule 43 strictly bans prolonged solitary confinement in excess of 15 consecutive days.')
    medical_visits_count = fields.Integer(string='Medical Officer Consultations in Past 30 Days', default=2)

    compliance_status = fields.Selection([
        ('compliant', 'Full Standard Compliance'),
        ('remedial_required', 'Deficiency Found - Remedial Action Ordered'),
        ('violation', 'Urgent Human Rights Breach Notice Issued'),
    ], string='Finding Status', default='compliant', required=True)

    recommendations = fields.Text(string='Inspector Corrective Recommendations')

    @api.constrains('consecutive_solitary_days')
    def _check_solitary_ceiling(self):
        for rec in self:
            if rec.consecutive_solitary_days > 15:
                raise ValidationError(_("VIOLATION OF UN MANDELA RULES (Rule 43): Solitary confinement must NOT exceed 15 consecutive days! Immediate termination required."))
