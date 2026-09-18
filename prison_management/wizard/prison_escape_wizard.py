# -*- coding: utf-8 -*-
# Part of Odoo Enterprise. See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api, _
from odoo.exceptions import UserError


class PrisonEscapeWizard(models.TransientModel):
    _name = 'prison.escape.wizard'
    _description = 'Escape Incident & Recapture Protocol Wizard'

    inmate_id = fields.Many2one('prison.inmate', string='Inmate', required=True)
    facility_id = fields.Many2one('prison.facility', string='Facility', required=True)
    action_mode = fields.Selection([
        ('escape_alert', '🚨 Broadcast New Escape Incident (Red Alert)'),
        ('recapture', '✅ Process Recapture of Fugitive Inmate'),
    ], string='Protocol Action', default='escape_alert', required=True)

    # Escape fields
    escape_location = fields.Char(string='Perimeter Point / Scene', default='Perimeter Fence Section North-East')
    method_of_escape = fields.Char(string='Escape Modus Operandi', default='Breached outer mesh wire during evening yard muster')
    danger_level = fields.Selection([
        ('EXTREME', 'Extreme Risk (Armed / Violent Felon)'),
        ('HIGH', 'High Security Alert'),
        ('MODERATE', 'Moderate Risk'),
    ], string='Public Danger Classification', default='HIGH', required=True)

    # Recapture fields
    recaptured_date = fields.Date(string='Recapture Date', default=fields.Date.context_today)
    recaptured_by = fields.Char(string='Apprehending Agency / Joint Task Force', default='National Police Service & Prison Rapid Response Unit')
    disciplinary_forfeiture_days = fields.Integer(string='Mandatory Statutory Remission Forfeited (Days)', default=90)
    demote_progressive_stage = fields.Boolean(string='Demote to Stage 1 (Strict Custody Induction)', default=True)

    def action_execute_protocol(self):
        self.ensure_one()
        inmate = self.inmate_id

        if self.action_mode == 'escape_alert':
            incident = self.env['prison.escape.incident'].create({
                'inmate_id': inmate.id,
                'facility_id': self.facility_id.id,
                'escape_location': self.escape_location,
                'method_of_escape': self.method_of_escape,
                'danger_level': self.danger_level,
                'status': 'AT_LARGE',
            })
            inmate.write({
                'custody_status': 'escaped',
                'cell_location': 'AT LARGE - ESCAPED FUGITIVE',
            })
            inmate.message_post(
                body=_("🚨 RED ALERT: Inmate reported escaped from %s via %s. National broadcast initiated.") % (self.escape_location, self.method_of_escape),
                message_type='notification',
                subtype_xmlid='mail.mt_comment',
            )
            # Try to send email alert template
            template = self.env.ref('prison_management.mail_template_escape_alert', raise_if_not_found=False)
            if template:
                template.send_mail(incident.id, force_send=True)

        elif self.action_mode == 'recapture':
            inmate.write({
                'custody_status': 'recaptured',
                'security_category': 'CAT_A',
                'progressive_stage': 'stage_1' if self.demote_progressive_stage else inmate.progressive_stage,
                'behavior_score': max(0, inmate.behavior_score - 40),
            })
            # Log forfeiture against active sentence
            active_sentence = inmate.sentence_ids.filtered(lambda s: s.status == 'serving')[:1]
            if active_sentence and self.disciplinary_forfeiture_days > 0:
                self.env['prison.remission.log'].create({
                    'sentence_id': active_sentence.id,
                    'log_type': 'forfeiture_infraction',
                    'days': self.disciplinary_forfeiture_days,
                    'infraction_reason': _('Statutory forfeiture following escape breach and subsequent recapture by %s') % self.recaptured_by,
                    'adjudicator_name': self.env.user.name,
                })
            inmate.message_post(
                body=_("✅ Inmate recaptured by %s. Re-admitted under Maximum Security (CAT A). %d days remission forfeited.") % (self.recaptured_by, self.disciplinary_forfeiture_days),
                message_type='notification',
                subtype_xmlid='mail.mt_comment',
            )

        return {'type': 'ir.actions.act_window_close'}
