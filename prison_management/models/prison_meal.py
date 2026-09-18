# -*- coding: utf-8 -*-
# Part of Odoo Enterprise. See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class PrisonMealMenu(models.Model):
    _name = 'prison.meal.menu'
    _description = 'Inmate Nutritional Meal Menu & Recipe'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'meal_type asc, name asc'

    name = fields.Char(string='Meal Title', required=True, tracking=True)
    code = fields.Char(string='Menu Code', required=True)
    meal_type = fields.Selection([
        ('breakfast', 'Morning Breakfast (06:30 - 08:00)'),
        ('lunch', 'Main Midday Lunch (11:30 - 13:00)'),
        ('dinner', 'Evening Dinner / Supper (16:30 - 18:00)'),
        ('special_ration', 'Special Medical / Fasting Ration'),
    ], string='Meal Service Type', default='lunch', required=True)

    diet_category = fields.Selection([
        ('standard', 'General Standard Ration'),
        ('halal', 'Halal Certified (No Pork / Ritual Slaughter)'),
        ('kosher', 'Kosher Certified Kitchen Rations'),
        ('diabetic', 'Low Glycemic / Diabetic Medical Diet'),
        ('vegetarian', 'Strict Vegetarian / Vegan'),
        ('renal_low_sodium', 'Renal & Low Sodium Diet'),
        ('maternal_infant', 'High-Protein Maternal / Toddler Ration'),
    ], string='Dietary Category', default='standard', required=True, tracking=True)

    calories_kcal = fields.Integer(string='Caloric Value (kcal)', default=950, help='Mandela Rules mandate adequate nutritional caloric intake.')
    protein_grams = fields.Float(string='Protein Content (g)', default=35.0)
    ingredients_description = fields.Text(string='Food Ingredients & Recipe Description')
    allergens = fields.Char(string='Allergen Disclosures (e.g. Gluten, Nuts, Soy, Dairy)')

    active = fields.Boolean(default=True)
    certified_by_nutritionist = fields.Boolean(string='Certified by Directorate Nutritionist', default=True)


class PrisonMealDistribution(models.Model):
    _name = 'prison.meal.distribution'
    _description = 'Daily Meal Catering & Cell Block Distribution Log'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'distribution_date desc, meal_type asc'

    name = fields.Char(string='Distribution Manifest No.', required=True, copy=False, readonly=True, default=lambda self: _('New'))
    facility_id = fields.Many2one('prison.facility', string='Correctional Facility', required=True, tracking=True)
    block_id = fields.Many2one('prison.facility.block', string='Destination Cell Block / Wing', required=True)
    distribution_date = fields.Date(string='Service Date', default=fields.Date.context_today, required=True, index=True)

    meal_type = fields.Selection([
        ('breakfast', 'Morning Breakfast'),
        ('lunch', 'Midday Lunch'),
        ('dinner', 'Evening Dinner'),
        ('special_ration', 'Night Ration / Special Diet'),
    ], string='Meal Service', default='lunch', required=True)

    menu_id = fields.Many2one('prison.meal.menu', string='Standard Menu Served', required=True)

    # Rations Tally
    standard_portions = fields.Integer(string='Standard Rations', default=0)
    halal_portions = fields.Integer(string='Halal Rations', default=0)
    kosher_portions = fields.Integer(string='Kosher Rations', default=0)
    diabetic_portions = fields.Integer(string='Diabetic / Low Glycemic Rations', default=0)
    vegetarian_portions = fields.Integer(string='Vegetarian Rations', default=0)
    medical_portions = fields.Integer(string='Special Medical / Infirmary Diets', default=0)

    total_rations = fields.Integer(string='Total Rations Dispatched', compute='_compute_total_rations', store=True)

    # Quality & Hygiene Verification
    food_temperature_celsius = fields.Float(string='Food Core Temperature at Dispatch (°C)', default=68.5)
    hygiene_certified = fields.Boolean(string='Kitchen Sanitation & Taste Test Certified', default=True)
    medical_officer_signoff = fields.Char(string='Chief Medical Officer Inspection Stamp')
    head_chef_guard = fields.Char(string='Kitchen Duty Officer (OIC)', default='Sgt. Catering Operations')

    status = fields.Selection([
        ('prep', 'In Central Kitchen Preparation'),
        ('dispatched', 'Dispatched to Block Kitchen'),
        ('served', 'Served & Counters Closed'),
        ('cancelled', 'Cancelled'),
    ], string='Distribution Status', default='prep', required=True, tracking=True)

    notes = fields.Text(string='Distribution & Food Safety Notes')

    @api.depends('standard_portions', 'halal_portions', 'kosher_portions', 'diabetic_portions', 'vegetarian_portions', 'medical_portions')
    def _compute_total_rations(self):
        for rec in self:
            rec.total_rations = (
                rec.standard_portions +
                rec.halal_portions +
                rec.kosher_portions +
                rec.diabetic_portions +
                rec.vegetarian_portions +
                rec.medical_portions
            )

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', _('New')) == _('New'):
                vals['name'] = self.env['ir.sequence'].next_by_code('prison.meal.distribution') or _('MEAL-NEW')
        return super().create(vals_list)

    def action_dispatch_meals(self):
        for rec in self:
            rec.status = 'dispatched'
            rec.message_post(body=_("Meals dispatched from central kitchen to %s. Total portions: %d.") % (rec.block_id.name, rec.total_rations))

    def action_mark_served(self):
        for rec in self:
            rec.status = 'served'
            rec.message_post(body=_("Meal service completed and tallied for %s.") % rec.block_id.name)
