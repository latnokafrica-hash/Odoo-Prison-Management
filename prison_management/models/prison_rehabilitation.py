# -*- coding: utf-8 -*-
# Part of Odoo Enterprise. See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class PrisonProgram(models.Model):
    _name = 'prison.program'
    _description = 'Inmate Vocational & Rehabilitation Program'
    _order = 'name asc'

    name = fields.Char(string='Program / Workshop Name', required=True)
    code = fields.Char(string='Program Code', required=True)
    category = fields.Selection([
        ('vocational', 'Vocational Trades & Industrial Workshop'),
        ('education', 'Formal Education & Adult Literacy'),
        ('psychological', 'Psychological & Substance Treatment'),
        ('faith_based', 'Spiritual & Moral Rehabilitation'),
    ], string='Curriculum Category', default='vocational', required=True)

    facility_id = fields.Many2one('prison.facility', string='Operating Facility', required=True)
    daily_wage_rate = fields.Float(string='Daily Gratuity Wage Rate ($/day)', default=2.50)
    capacity = fields.Integer(string='Max Cohort Capacity', default=30)
    active = fields.Boolean(default=True)
    description = fields.Text(string='Syllabus & National Certification Alignment')


class PrisonProgramEnrollment(models.Model):
    _name = 'prison.program.enrollment'
    _description = 'Inmate Program Enrollment'
    _order = 'enrollment_date desc, id desc'

    inmate_id = fields.Many2one('prison.inmate', string='Inmate', required=True, ondelete='cascade', index=True)
    program_id = fields.Many2one('prison.program', string='Training Program / Workshop', required=True)
    enrollment_date = fields.Date(string='Enrollment Date', default=fields.Date.context_today, required=True)
    completion_date = fields.Date(string='Graduation / Completion Date')
    progress_percentage = fields.Integer(string='Progress (%)', default=10)
    status = fields.Selection([
        ('enrolled', 'Actively Enrolled'),
        ('graduated', 'Graduated with Certified Trade Test'),
        ('suspended', 'Suspended for Infraction'),
        ('withdrawn', 'Withdrawn / Transferred'),
    ], string='Status', default='enrolled', required=True)
    instructor_notes = fields.Char(string='Trade Instructor Evaluation')


class PrisonGratuityTransaction(models.Model):
    _name = 'prison.gratuity.transaction'
    _description = 'Inmate Labor Gratuity & Savings Ledger'
    _order = 'date desc, id desc'

    inmate_id = fields.Many2one('prison.inmate', string='Inmate', required=True, ondelete='cascade', index=True)
    date = fields.Date(string='Transaction Date', default=fields.Date.context_today, required=True)
    transaction_type = fields.Selection([
        ('wage_credit', 'Industrial Workshop Labor Wage'),
        ('commissary_debit', 'Prison Canteen / Commissary Debit'),
        ('fine_deduction', 'Court Ordered Restitution / Disciplinary Fine'),
        ('exit_payout', 'Final Exit Savings Payout'),
    ], string='Transaction Type', default='wage_credit', required=True)
    amount = fields.Float(string='Amount ($)', required=True, default=0.0)
    description = fields.Char(string='Transaction Memo / Voucher No.', required=True)
    verified_by_id = fields.Many2one('res.users', string='Verifying Accountant / Chief Officer', default=lambda self: self.env.user)
