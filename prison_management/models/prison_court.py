# -*- coding: utf-8 -*-
# Part of Odoo Enterprise. See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api, _


class PrisonCourtHearing(models.Model):
    _name = 'prison.court.hearing'
    _description = 'Court Attendance & Production Warrant Docket'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'hearing_date asc, hearing_time asc'

    inmate_id = fields.Many2one('prison.inmate', string='Inmate', required=True, ondelete='cascade', tracking=True, index=True)
    facility_id = fields.Many2one(related='inmate_id.facility_id', string='Detaining Facility', store=True)
    case_number = fields.Char(string='Court Case / Criminal Registry No.', required=True, tracking=True)
    court_name = fields.Char(string='Judicial Court & Division', required=True, tracking=True)
    judge_name = fields.Char(string='Presiding Magistrate / Judge')
    hearing_date = fields.Date(string='Hearing Date', required=True, default=fields.Date.context_today, tracking=True, index=True)
    hearing_time = fields.Char(string='Hearing Time', default='09:00 AM')

    hearing_type = fields.Selection([
        ('bail_hearing', 'Bail / Bond Application Review'),
        ('mention', 'Case Mention & Directions'),
        ('plea', 'Plea Taking'),
        ('trial_hearing', 'Trial Hearing & Witness Evidence'),
        ('judgment', 'Judgment Ruling'),
        ('sentencing', 'Sentencing Hearing & Committal'),
        ('appeal', 'Appellate Court Review'),
    ], string='Hearing Type', default='mention', required=True, tracking=True)

    court_mode = fields.Selection([
        ('physical_court', 'Physical Courtroom Escort'),
        ('virtual_video_link', 'Virtual Video Link (Court Station Booth)'),
    ], string='Appearance Mode', default='physical_court', required=True, tracking=True)

    # Escort & Transport
    escort_team = fields.Char(string='Armed Escort Unit', default='Court Escort Squad B')
    transport_vehicle_number = fields.Char(string='Prison Van / Convoy Call Sign', default='PRIS-VAN-08')

    # Judicial Stage Workflow
    status = fields.Selection([
        ('scheduled', 'Docket Scheduled'),
        ('in_transit', 'En Route to Court'),
        ('at_court', 'Present in Court Cell / Booth'),
        ('returned_remanded', 'Returned to Facility (Remanded)'),
        ('admitted_bail', 'Granted & Executed Bail (Released)'),
        ('acquitted', 'Acquitted & Discharged by Court'),
        ('sentenced', 'Convicted & Sentenced to Prison'),
    ], string='Hearing Outcome Status', default='scheduled', required=True, tracking=True)

    outcome_notes = fields.Text(string='Court Orders / Judicial Ruling Notes')

    def action_dispatch_escort(self):
        for rec in self:
            rec.status = 'in_transit'
            rec.message_post(body=_("Inmate dispatched under armed escort to %s.") % rec.court_name)

    def action_arrive_court(self):
        for rec in self:
            rec.status = 'at_court'

    def action_return_remanded(self):
        for rec in self:
            rec.status = 'returned_remanded'
            rec.message_post(body=_("Inmate returned from court and re-admitted to facility on further remand."))

    def action_bail_release(self):
        for rec in self:
            rec.status = 'admitted_bail'
            rec.inmate_id.custody_status = 'on_bail'
            rec.inmate_id.message_post(body=_("Inmate released from custody on court-sanctioned bail."))
