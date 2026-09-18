# -*- coding: utf-8 -*-
# Part of Odoo Enterprise. See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
from datetime import timedelta, date


class PrisonSentence(models.Model):
    _name = 'prison.sentence'
    _description = 'Court Sentence & Remission Administration'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'date_convicted desc, id desc'

    inmate_id = fields.Many2one('prison.inmate', string='Inmate', required=True, ondelete='cascade', tracking=True, index=True)
    facility_id = fields.Many2one(related='inmate_id.facility_id', string='Current Facility', store=True)
    court_name = fields.Char(string='Convicting Court / Division', required=True, tracking=True)
    case_number = fields.Char(string='Criminal Case / Committal Warrant No.', required=True, tracking=True)
    judge_name = fields.Char(string='Presiding Judge / Magistrate')
    date_convicted = fields.Date(string='Date of Conviction / Sentence', required=True, default=fields.Date.context_today, tracking=True)
    offense = fields.Char(string='Penal Offense / Charge', required=True, tracking=True)

    # Term
    term_years = fields.Integer(string='Years', default=0)
    term_months = fields.Integer(string='Months', default=0)
    term_days = fields.Integer(string='Days', default=0)
    total_sentence_days = fields.Integer(string='Nominal Sentence Duration (Days)', compute='_compute_sentence_days', store=True)

    sentence_type = fields.Selection([
        ('determinate', 'Determinate Fixed Term'),
        ('life_imprisonment', 'Life Imprisonment'),
        ('president_pleasure', "At the President's Pleasure (Juvenile/Mental)"),
        ('community_service', 'Community Service Order (CSO)'),
    ], string='Sentence Type', default='determinate', required=True, tracking=True)

    structure = fields.Selection([
        ('concurrent', 'Concurrent with Other Sentences'),
        ('consecutive', 'Consecutive to Prior Sentence'),
    ], string='Sentence Structure', default='concurrent', required=True, tracking=True)

    # Remission Engine (Standard 1/3 deduction under Prison Act)
    statutory_remission_fraction = fields.Float(string='Statutory Remission Rate', default=0.333333, readonly=True,
                                                help='One-third (1/3) deduction granted by statute for good conduct.')
    remission_earned_days = fields.Integer(string='Statutory Remission Earned (Days)', compute='_compute_remission_dates', store=True)
    remission_forfeited_days = fields.Integer(string='Disciplinary Forfeited Remission (Days)', compute='_compute_forfeitures', store=True)
    net_remission_days = fields.Integer(string='Net Usable Remission (Days)', compute='_compute_remission_dates', store=True)

    # Key Release Dates
    earliest_release_date = fields.Date(string='Earliest Date of Release (EDR)', compute='_compute_remission_dates', store=True, tracking=True)
    latest_release_date = fields.Date(string='Latest Date of Release (LDR / Full Term)', compute='_compute_remission_dates', store=True, tracking=True)
    parole_eligibility_date = fields.Date(string='Parole Review Eligibility Date (PED)', compute='_compute_remission_dates', store=True)

    status = fields.Selection([
        ('serving', 'Actively Serving Term'),
        ('parole', 'Released on Parole / Supervised License'),
        ('expired', 'Term Expired / Fully Served'),
        ('quashed', 'Quashed on Appeal'),
        ('commuted', 'Commuted / Presidential Pardon'),
    ], string='Status', default='serving', tracking=True)

    remission_log_ids = fields.One2many('prison.remission.log', 'sentence_id', string='Disciplinary Remission Logs')

    @api.depends('term_years', 'term_months', 'term_days')
    def _compute_sentence_days(self):
        for rec in self:
            days = (rec.term_years * 365) + (rec.term_months * 30) + rec.term_days
            rec.total_sentence_days = days

    @api.depends('remission_log_ids.days', 'remission_log_ids.log_type')
    def _compute_forfeitures(self):
        for rec in self:
            forfeited = sum(rec.remission_log_ids.filtered(lambda l: l.log_type == 'forfeiture_infraction').mapped('days'))
            restored = sum(rec.remission_log_ids.filtered(lambda l: l.log_type == 'restoration_merit').mapped('days'))
            rec.remission_forfeited_days = max(0, forfeited - restored)

    @api.depends('total_sentence_days', 'statutory_remission_fraction', 'remission_forfeited_days', 'date_convicted', 'sentence_type')
    def _compute_remission_dates(self):
        for rec in self:
            if rec.sentence_type in ['life_imprisonment', 'president_pleasure']:
                rec.remission_earned_days = 0
                rec.net_remission_days = 0
                rec.earliest_release_date = False
                rec.latest_release_date = False
                # Eligible for parole review after 10 years
                rec.parole_eligibility_date = rec.date_convicted + timedelta(days=3650) if rec.date_convicted else False
            else:
                earned = int(rec.total_sentence_days * (1.0 / 3.0))
                rec.remission_earned_days = earned
                net = max(0, earned - rec.remission_forfeited_days)
                rec.net_remission_days = net

                if rec.date_convicted and rec.total_sentence_days > 0:
                    rec.latest_release_date = rec.date_convicted + timedelta(days=rec.total_sentence_days)
                    rec.earliest_release_date = rec.date_convicted + timedelta(days=(rec.total_sentence_days - net))
                    # Halfway mark for parole eligibility
                    rec.parole_eligibility_date = rec.date_convicted + timedelta(days=int(rec.total_sentence_days * 0.5))
                else:
                    rec.earliest_release_date = False
                    rec.latest_release_date = False
                    rec.parole_eligibility_date = False


class PrisonRemissionLog(models.Model):
    _name = 'prison.remission.log'
    _description = 'Disciplinary Remission Forfeiture & Restoration Log'
    _order = 'log_date desc, id desc'

    sentence_id = fields.Many2one('prison.sentence', string='Sentence Reference', required=True, ondelete='cascade')
    inmate_id = fields.Many2one(related='sentence_id.inmate_id', string='Inmate', store=True, index=True)
    log_date = fields.Date(string='Adjudication Date', default=fields.Date.context_today, required=True)
    log_type = fields.Selection([
        ('forfeiture_infraction', 'Disciplinary Forfeiture (Deduction of Days)'),
        ('restoration_merit', 'Merit Restoration (Re-crediting of Days)'),
    ], string='Adjustment Type', default='forfeiture_infraction', required=True)
    days = fields.Integer(string='Days Adjusted', required=True, default=14)
    infraction_reason = fields.Char(string='Disciplinary Board Case & Reason', required=True)
    adjudicator_name = fields.Char(string='Visiting Justice / Presiding Superintendent', required=True)
