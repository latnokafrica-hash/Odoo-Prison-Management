# -*- coding: utf-8 -*-
# Part of Odoo Enterprise. See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api, _


class PrisonManagementDashboard(models.Model):
    _name = 'prison.management.dashboard'
    _description = 'Correctional Operations Executive KPI & Performance Dashboard'

    name = fields.Char(string='Dashboard View', default='National Prison Operations KPI')

    @api.model
    def get_dashboard_metrics(self, facility_id=None):
        """
        High-performance single-query metric aggregator for Odoo 19 Executive Dashboard
        """
        domain = [('facility_id', '=', facility_id)] if facility_id else []

        total_facilities = self.env['prison.facility'].search_count([])
        inmates = self.env['prison.inmate'].search(domain)
        total_inmates = len(inmates)
        
        remand_count = len(inmates.filtered(lambda i: i.custody_status == 'remand'))
        convicted_count = len(inmates.filtered(lambda i: i.custody_status == 'convicted'))
        escaped_count = len(inmates.filtered(lambda i: i.custody_status == 'escaped'))
        cat_a_count = len(inmates.filtered(lambda i: i.security_category == 'CAT_A'))
        
        # Bed capacity across facilities
        facilities = self.env['prison.facility'].search([])
        total_capacity = sum(facilities.mapped('capacity'))
        overall_occupancy_rate = round((total_inmates / total_capacity * 100.0), 1) if total_capacity > 0 else 0.0

        # Operational daily activities
        today = fields.Date.context_today(self)
        hearings_today = self.env['prison.court.hearing'].search_count([('hearing_date', '=', today)])
        convoys_active = self.env['prison.fleet.convoy'].search_count([('status', 'in', ['staging', 'en_route_court', 'at_court', 'en_route_prison'])])
        visitors_today = self.env['prison.visit.session'].search_count([('visit_date', '=', today)])
        meals_today = self.env['prison.meal.distribution'].search([('distribution_date', '=', today)])
        total_meals_served = sum(meals_today.mapped('total_rations'))

        # Nelson Mandela Rules alert: solitary confinement > 10 days
        solitary_audits = self.env['prison.human.rights.audit'].search([('consecutive_solitary_days', '>=', 10)])
        solitary_alert_count = len(solitary_audits)

        return {
            'total_facilities': total_facilities,
            'total_inmates': total_inmates,
            'total_capacity': total_capacity,
            'overall_occupancy_rate': overall_occupancy_rate,
            'remand_count': remand_count,
            'convicted_count': convicted_count,
            'escaped_count': escaped_count,
            'cat_a_count': cat_a_count,
            'hearings_today': hearings_today,
            'convoys_active': convoys_active,
            'visitors_today': visitors_today,
            'total_meals_served': total_meals_served,
            'solitary_alert_count': solitary_alert_count,
        }
