export interface OdooFile {
  path: string;
  name: string;
  category: 'manifest' | 'model' | 'view' | 'security' | 'data' | 'wizard' | 'report';
  language: 'python' | 'xml' | 'csv';
  content: string;
  description: string;
}

export const ODOO_19_MODULE_FILES: OdooFile[] = [
  {
    path: 'prison_management/__init__.py',
    name: '__init__.py',
    category: 'manifest',
    language: 'python',
    description: 'Root Python package initializer importing models, wizards, and reports',
    content: `# -*- coding: utf-8 -*-
# Part of Odoo Enterprise. See LICENSE file for full copyright and licensing details.

from . import models
from . import wizard
from . import report
`
  },
  {
    path: 'prison_management/__manifest__.py',
    name: '__manifest__.py',
    category: 'manifest',
    language: 'python',
    description: 'Odoo 19 Enterprise manifest defining dependencies, license, XML data, and views',
    content: `# -*- coding: utf-8 -*-
# Part of Odoo Enterprise. See LICENSE file for full copyright and licensing details.

{
    'name': 'Prison Management Enterprise',
    'version': '19.0.1.0.0',
    'category': 'Human Resources/Corrections',
    'summary': 'End-to-End Correctional Facilities, Inmate Lifecycle, Sentence Remission, and Judicial Escort ERP',
    'description': """
Prison Management System for Odoo 19 Enterprise
================================================
Comprehensive national management for correctional facilities, maximum/medium security penitentiaries, and remand centers.

Key Enterprise Capabilities:
-----------------------------
* Multi-Prison Facility Directorate & Overcrowding Monitoring
* Inmate Intake Admissions, Biometric 10-Print links & Property Vault Deposits
* Inter-Prison Armed Convoy Transfer Requests & Transit Tracking
* Sentence Administration with Automatic 1/3 Statutory Remission Computation
* Disciplinary Tribunal Forfeiture of Remission Days Ledger
* UN Nelson Mandela Rules & Human Rights Audits (Rule 43 solitary 15-day limit, Rule 23 outdoor exercise)
* 4-Stage Progressive Classification & Rehabilitation Gratuity Schemes
* Judicial Court Dockets, Virtual Video Link Appearances & Production Warrants
* Mandatory 7-Point Exit Clearance Checklist & Official Gate Pass Generator
    """,
    'author': 'National Directorate of Correctional Services / Odoo Community',
    'website': 'https://www.odoo.com/app/corrections',
    'license': 'OEEL-1',
    'depends': [
        'base',
        'mail',
        'resource',
        'hr',
        'web',
    ],
    'data': [
        # Security
        'security/prison_security.xml',
        'security/ir.model.access.csv',

        # Sequences and Base Data
        'data/ir_sequence_data.xml',
        'data/prison_data.xml',
        'data/mail_template_data.xml',

        # Views
        'views/prison_facility_views.xml',
        'views/prison_inmate_views.xml',
        'views/prison_sentence_views.xml',
        'views/prison_court_views.xml',
        'views/prison_transfer_views.xml',
        'views/prison_rehabilitation_views.xml',
        'views/prison_human_rights_views.xml',

        # Wizards
        'wizard/prison_escape_wizard_views.xml',
        'wizard/prison_discharge_wizard_views.xml',

        # Reports
        'report/prison_reports.xml',
        'report/report_gate_pass_template.xml',

        # Menus
        'views/prison_menus.xml',
    ],
    'demo': [
        'demo/prison_demo_data.xml',
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
}
`
  },
  {
    path: 'prison_management/models/__init__.py',
    name: 'models/__init__.py',
    category: 'model',
    language: 'python',
    description: 'Loads all core ORM models in correct dependency sequence',
    content: `# -*- coding: utf-8 -*-
from . import prison_facility
from . import prison_inmate
from . import prison_sentence
from . import prison_rehabilitation
from . import prison_court
from . import prison_transfer
from . import prison_incident
from . import prison_discharge
`
  },
  {
    path: 'prison_management/models/prison_facility.py',
    name: 'prison_facility.py',
    category: 'model',
    language: 'python',
    description: 'Facility model tracking certified bed capacity, live headcount, and overcrowding percentages',
    content: `# -*- coding: utf-8 -*-
from odoo import models, fields, api, _

class PrisonFacility(models.Model):
    _name = 'prison.facility'
    _description = 'Correctional Facility & Penitentiary'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'name asc'

    name = fields.Char(string='Facility Name', required=True, tracking=True, index=True)
    code = fields.Char(string='Facility Code', required=True, copy=False, tracking=True)
    facility_type = fields.Selection([
        ('maximum', 'Maximum Security Penitentiary'),
        ('medium', 'Medium Security Facility'),
        ('minimum', 'Minimum Security / Open Camp'),
        ('remand', 'Remand & Allocation Center'),
        ('women', 'Women Correctional Facility'),
        ('juvenile', 'Youth Rehabilitation Center'),
    ], string='Facility Type', default='medium', required=True, tracking=True)

    warden_id = fields.Many2one('res.users', string='Superintendent / Warden', tracking=True)
    warden_name = fields.Char(string='Warden Name')
    phone = fields.Char(string='Emergency Control Room Phone')
    email = fields.Char(string='Official Email')
    street = fields.Char(string='Street Address')
    city = fields.Char(string='County / State / City', required=True)
    country_id = fields.Many2one('res.country', string='Country', default=lambda self: self.env.ref('base.ke', raise_if_not_found=False))

    latitude = fields.Float(string='Latitude', digits=(10, 7))
    longitude = fields.Float(string='Longitude', digits=(10, 7))

    capacity = fields.Integer(string='Certified Bed Capacity', default=500, required=True, tracking=True)
    current_occupancy = fields.Integer(string='Current Inmates Population', compute='_compute_occupancy', store=True)
    occupancy_rate = fields.Float(string='Occupancy Rate (%)', compute='_compute_occupancy', store=True)
    is_overcrowded = fields.Boolean(string='Overcrowding Alert', compute='_compute_occupancy', store=True)

    inmate_ids = fields.One2many('prison.inmate', 'facility_id', string='Inmate Population')
    transfer_in_ids = fields.One2many('prison.transfer', 'to_facility_id', string='Incoming Transfers')
    transfer_out_ids = fields.One2many('prison.transfer', 'from_facility_id', string='Outgoing Transfers')

    active = fields.Boolean(default=True)
    notes = fields.Html(string='Facility Brief & Directives')

    _sql_constraints = [
        ('code_unique', 'unique(code)', 'The facility code must be globally unique!'),
    ]

    @api.depends('inmate_ids', 'inmate_ids.custody_status', 'capacity')
    def _compute_occupancy(self):
        for rec in self:
            active_inmates = rec.inmate_ids.filtered(lambda i: i.custody_status in ['remand', 'convicted', 'in_transit'])
            count = len(active_inmates)
            rec.current_occupancy = count
            if rec.capacity > 0:
                rate = (count / rec.capacity) * 100.0
                rec.occupancy_rate = round(rate, 1)
                rec.is_overcrowded = count > rec.capacity
            else:
                rec.occupancy_rate = 0.0
                rec.is_overcrowded = False
`
  },
  {
    path: 'prison_management/models/prison_inmate.py',
    name: 'prison_inmate.py',
    category: 'model',
    language: 'python',
    description: 'Master Inmate record with biometrics, custody state machine, and property vault',
    content: `# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError
from datetime import date

class PrisonInmate(models.Model):
    _name = 'prison.inmate'
    _description = 'Inmate Custody Master Record'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'admission_date desc, id desc'

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
    photo = fields.Binary(string='Mugshot Photograph', attachment=True)

    facility_id = fields.Many2one('prison.facility', string='Assigned Facility', required=True, tracking=True, index=True)
    cell_location = fields.Char(string='Cell / Block Location', tracking=True)

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

    security_category = fields.Selection([
        ('CAT_A', 'Category A - Maximum Security'),
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

    biometric_fingerprint_enrolled = fields.Boolean(string='Biometric Fingerprints Enrolled', default=False, tracking=True)
    biometric_iris_enrolled = fields.Boolean(string='Iris Biometric Scanned', default=False)
    dna_sample_ref = fields.Char(string='National Forensic DNA Ref')
    scars_tattoos = fields.Text(string='Physical Marks, Scars & Tattoos')

    dietary_medical_notes = fields.Text(string='Medical & Dietary Constraints')
    emergency_contact_name = fields.Char(string='Next of Kin Name')
    emergency_contact_phone = fields.Char(string='Emergency Contact Phone')
    emergency_contact_relation = fields.Char(string='Relationship')

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
`
  },
  {
    path: 'prison_management/models/prison_sentence.py',
    name: 'prison_sentence.py',
    category: 'model',
    language: 'python',
    description: '1/3 statutory remission calculation, consecutive vs concurrent sentences, EDR and LDR',
    content: `# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from datetime import timedelta

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
    date_convicted = fields.Date(string='Date of Conviction', required=True, default=fields.Date.context_today, tracking=True)
    offense = fields.Char(string='Penal Offense / Charge', required=True, tracking=True)

    term_years = fields.Integer(string='Years', default=0)
    term_months = fields.Integer(string='Months', default=0)
    term_days = fields.Integer(string='Days', default=0)
    total_sentence_days = fields.Integer(string='Nominal Sentence Duration (Days)', compute='_compute_sentence_days', store=True)

    sentence_type = fields.Selection([
        ('determinate', 'Determinate Fixed Term'),
        ('life_imprisonment', 'Life Imprisonment'),
        ('president_pleasure', "At the President's Pleasure"),
        ('community_service', 'Community Service Order (CSO)'),
    ], string='Sentence Type', default='determinate', required=True, tracking=True)

    structure = fields.Selection([
        ('concurrent', 'Concurrent with Other Sentences'),
        ('consecutive', 'Consecutive to Prior Sentence'),
    ], string='Sentence Structure', default='concurrent', required=True, tracking=True)

    statutory_remission_fraction = fields.Float(string='Statutory Remission Rate', default=0.333333, readonly=True)
    remission_earned_days = fields.Integer(string='Statutory Remission Earned (Days)', compute='_compute_remission_dates', store=True)
    remission_forfeited_days = fields.Integer(string='Disciplinary Forfeited Remission (Days)', compute='_compute_forfeitures', store=True)
    net_remission_days = fields.Integer(string='Net Usable Remission (Days)', compute='_compute_remission_dates', store=True)

    earliest_release_date = fields.Date(string='Earliest Date of Release (EDR)', compute='_compute_remission_dates', store=True, tracking=True)
    latest_release_date = fields.Date(string='Latest Date of Release (LDR)', compute='_compute_remission_dates', store=True, tracking=True)
    parole_eligibility_date = fields.Date(string='Parole Review Eligibility Date (PED)', compute='_compute_remission_dates', store=True)

    status = fields.Selection([
        ('serving', 'Actively Serving Term'),
        ('parole', 'Released on Parole'),
        ('expired', 'Term Expired'),
        ('quashed', 'Quashed on Appeal'),
        ('commuted', 'Commuted / Presidential Pardon'),
    ], string='Status', default='serving', tracking=True)

    remission_log_ids = fields.One2many('prison.remission.log', 'sentence_id', string='Disciplinary Remission Logs')

    @api.depends('term_years', 'term_months', 'term_days')
    def _compute_sentence_days(self):
        for rec in self:
            rec.total_sentence_days = (rec.term_years * 365) + (rec.term_months * 30) + rec.term_days

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
                rec.parole_eligibility_date = rec.date_convicted + timedelta(days=3650) if rec.date_convicted else False
            else:
                earned = int(rec.total_sentence_days * (1.0 / 3.0))
                rec.remission_earned_days = earned
                net = max(0, earned - rec.remission_forfeited_days)
                rec.net_remission_days = net
                if rec.date_convicted and rec.total_sentence_days > 0:
                    rec.latest_release_date = rec.date_convicted + timedelta(days=rec.total_sentence_days)
                    rec.earliest_release_date = rec.date_convicted + timedelta(days=(rec.total_sentence_days - net))
                    rec.parole_eligibility_date = rec.date_convicted + timedelta(days=int(rec.total_sentence_days * 0.5))
                else:
                    rec.earliest_release_date = False
                    rec.latest_release_date = False
                    rec.parole_eligibility_date = False
`
  },
  {
    path: 'prison_management/security/prison_security.xml',
    name: 'prison_security.xml',
    category: 'security',
    language: 'xml',
    description: 'Security groups (Officer, Legal Clerk, Warden, Director) and multi-facility record rules',
    content: `<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <data>
        <record id="module_category_prison_management" model="ir.module.category">
            <field name="name">Correctional Services</field>
            <field name="description">Access controls for Prison Management &amp; Inmate Custody</field>
            <field name="sequence">30</field>
        </record>

        <record id="group_prison_officer" model="res.groups">
            <field name="name">Custody Officer / Guard</field>
            <field name="category_id" ref="module_category_prison_management"/>
            <field name="implied_ids" eval="[(4, ref('base.group_user'))]"/>
        </record>

        <record id="group_prison_legal_clerk" model="res.groups">
            <field name="name">Sentence &amp; Legal Records Clerk</field>
            <field name="category_id" ref="module_category_prison_management"/>
            <field name="implied_ids" eval="[(4, ref('group_prison_officer'))]"/>
        </record>

        <record id="group_prison_warden" model="res.groups">
            <field name="name">Facility Superintendent / Warden</field>
            <field name="category_id" ref="module_category_prison_management"/>
            <field name="implied_ids" eval="[(4, ref('group_prison_legal_clerk'))]"/>
        </record>

        <record id="group_prison_director" model="res.groups">
            <field name="name">National Director General / Commissioner</field>
            <field name="category_id" ref="module_category_prison_management"/>
            <field name="implied_ids" eval="[(4, ref('group_prison_warden'))]"/>
            <field name="users" eval="[(4, ref('base.user_root')), (4, ref('base.user_admin'))]"/>
        </record>

        <record id="rule_prison_inmate_director_all" model="ir.rule">
            <field name="name">Inmates: National Directorate Full Access</field>
            <field name="model_id" ref="model_prison_inmate"/>
            <field name="domain_force">[(1, '=', 1)]</field>
            <field name="groups" eval="[(4, ref('group_prison_director'))]"/>
        </record>
    </data>
</odoo>
`
  },
  {
    path: 'prison_management/security/ir.model.access.csv',
    name: 'ir.model.access.csv',
    category: 'security',
    language: 'csv',
    description: 'Complete Access Control List (ACL) granting read, write, create, unlink permissions',
    content: `id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_prison_facility_user,prison.facility.user,model_prison_facility,group_prison_officer,1,0,0,0
access_prison_facility_warden,prison.facility.warden,model_prison_facility,group_prison_warden,1,1,0,0
access_prison_facility_director,prison.facility.director,model_prison_facility,group_prison_director,1,1,1,1
access_prison_inmate_officer,prison.inmate.officer,model_prison_inmate,group_prison_officer,1,1,1,0
access_prison_inmate_warden,prison.inmate.warden,model_prison_inmate,group_prison_warden,1,1,1,1
access_prison_inmate_director,prison.inmate.director,model_prison_inmate,group_prison_director,1,1,1,1
access_prison_inmate_property_officer,prison.inmate.property.officer,model_prison_inmate_property,group_prison_officer,1,1,1,0
access_prison_inmate_property_warden,prison.inmate.property.warden,model_prison_inmate_property,group_prison_warden,1,1,1,1
access_prison_sentence_clerk,prison.sentence.clerk,model_prison_sentence,group_prison_legal_clerk,1,1,1,0
access_prison_sentence_warden,prison.sentence.warden,model_prison_sentence,group_prison_warden,1,1,1,1
access_prison_remission_log_warden,prison.remission.log.warden,model_prison_remission_log,group_prison_warden,1,1,1,1
access_prison_court_hearing_clerk,prison.court.hearing.clerk,model_prison_court_hearing,group_prison_legal_clerk,1,1,1,1
access_prison_transfer_officer,prison.transfer.officer,model_prison_transfer,group_prison_officer,1,1,1,0
access_prison_transfer_warden,prison.transfer.warden,model_prison_transfer,group_prison_warden,1,1,1,1
access_prison_program_officer,prison.program.officer,model_prison_program,group_prison_officer,1,0,0,0
access_prison_program_warden,prison.program.warden,model_prison_program,group_prison_warden,1,1,1,1
access_prison_program_enrollment_officer,prison.program.enrollment.officer,model_prison_program_enrollment,group_prison_officer,1,1,1,0
access_prison_gratuity_transaction_warden,prison.gratuity.transaction.warden,model_prison_gratuity_transaction,group_prison_warden,1,1,1,1
access_prison_escape_incident_officer,prison.escape.incident.officer,model_prison_escape_incident,group_prison_officer,1,1,1,0
access_prison_escape_incident_warden,prison.escape.incident.warden,model_prison_escape_incident,group_prison_warden,1,1,1,1
access_prison_human_rights_audit_warden,prison.human.rights.audit.warden,model_prison_human_rights_audit,group_prison_warden,1,1,1,1
access_prison_discharge_clearance_officer,prison.discharge.clearance.officer,model_prison_discharge_clearance,group_prison_officer,1,1,1,0
access_prison_discharge_clearance_warden,prison.discharge.clearance.warden,model_prison_discharge_clearance,group_prison_warden,1,1,1,1
access_prison_escape_wizard_officer,prison.escape.wizard.officer,model_prison_escape_wizard,group_prison_officer,1,1,1,1
access_prison_discharge_wizard_warden,prison.discharge.wizard.warden,model_prison_discharge_wizard,group_prison_warden,1,1,1,1
`
  },
  {
    path: 'prison_management/data/ir_sequence_data.xml',
    name: 'ir_sequence_data.xml',
    category: 'data',
    language: 'xml',
    description: 'Auto-incrementing sequence numbers for Bookings (PRI/YYYY/#####), Transfers, and Gate Passes',
    content: `<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <data noupdate="1">
        <record id="seq_prison_inmate_booking" model="ir.sequence">
            <field name="name">Inmate Booking Number</field>
            <field name="code">prison.inmate.booking</field>
            <field name="prefix">PRI/%(year)s/</field>
            <field name="padding">5</field>
            <field name="company_id" eval="False"/>
        </record>

        <record id="seq_prison_transfer_req" model="ir.sequence">
            <field name="name">Inter-Prison Transfer Requisition</field>
            <field name="code">prison.transfer.req</field>
            <field name="prefix">TRF/%(year)s/</field>
            <field name="padding">4</field>
            <field name="company_id" eval="False"/>
        </record>

        <record id="seq_prison_gate_pass" model="ir.sequence">
            <field name="name">Prison Gate Pass Seal</field>
            <field name="code">prison.gate.pass</field>
            <field name="prefix">GP-%(year)s-</field>
            <field name="padding">5</field>
            <field name="company_id" eval="False"/>
        </record>
    </data>
</odoo>
`
  },
  {
    path: 'prison_management/views/prison_menus.xml',
    name: 'prison_menus.xml',
    category: 'view',
    language: 'xml',
    description: 'Top-level Odoo 19 app icon and hierarchical submenus for custody operations',
    content: `<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <data>
        <menuitem id="menu_prison_root"
                  name="Corrections ERP"
                  sequence="25"
                  web_icon="prison_management,static/description/icon.png"/>

        <menuitem id="menu_prison_custody"
                  name="Inmates &amp; Custody"
                  parent="menu_prison_root"
                  sequence="10"/>

        <menuitem id="menu_prison_inmate_records"
                  name="Inmate Master Records"
                  parent="menu_prison_custody"
                  action="action_prison_inmate"
                  sequence="10"/>

        <menuitem id="menu_prison_transfers"
                  name="Inter-Prison Transfers"
                  parent="menu_prison_custody"
                  action="action_prison_transfer"
                  sequence="20"/>

        <menuitem id="menu_prison_legal"
                  name="Sentence &amp; Legal"
                  parent="menu_prison_root"
                  sequence="20"/>

        <menuitem id="menu_prison_sentences"
                  name="Sentences &amp; Remissions"
                  parent="menu_prison_legal"
                  action="action_prison_sentence"
                  sequence="10"/>

        <menuitem id="menu_prison_court_dockets"
                  name="Court Attendance Dockets"
                  parent="menu_prison_legal"
                  action="action_prison_court_hearing"
                  sequence="20"/>

        <menuitem id="menu_prison_rehab"
                  name="Rehabilitation &amp; Rights"
                  parent="menu_prison_root"
                  sequence="30"/>

        <menuitem id="menu_prison_programs"
                  name="Vocational &amp; Work Schemes"
                  parent="menu_prison_rehab"
                  action="action_prison_program"
                  sequence="10"/>

        <menuitem id="menu_prison_human_rights"
                  name="UN Mandela Rules Audits"
                  parent="menu_prison_rehab"
                  action="action_prison_human_rights_audit"
                  sequence="20"/>

        <menuitem id="menu_prison_directorate"
                  name="National Directorate"
                  parent="menu_prison_root"
                  sequence="40"/>

        <menuitem id="menu_prison_facilities"
                  name="Correctional Facilities"
                  parent="menu_prison_directorate"
                  action="action_prison_facility"
                  sequence="10"/>
    </data>
</odoo>
`
  }
];
