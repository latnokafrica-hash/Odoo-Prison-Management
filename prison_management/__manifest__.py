# -*- coding: utf-8 -*-
# Part of Odoo Enterprise. See LICENSE file for full copyright and licensing details.

{
    'name': 'Prison Management Enterprise',
    'version': '19.0.1.0.0',
    'category': 'Human Resources/Corrections',
    'summary': 'End-to-End Correctional Facilities, Inmate Lifecycle, Sentence Remission, and Judicial Escort ERP',
    'description': """
Prison Management System for Odoo 19 Enterprise
================================================
This official enterprise-grade module delivers a comprehensive national management
system for correctional directorates, maximum/medium security penitentiaries, and remand centers.

Key Enterprise Capabilities:
-----------------------------
* **Multi-Prison Facility Directorate**:
  - Live occupancy and overcrowding capacity tracking
  - Multi-facility bed balance & transfer requisition workflows
  - Security categorization: CAT A, CAT B, CAT C, CAT D

* **Inmate Admissions & Movements**:
  - Intake booking with biometric record links, biometric 10-prints, iris scans
  - Sealed property vault tracking with tamper-proof bag seals
  - Inter-prison armed convoy transfer requests with dispatch/arrival protocols
  - Bail surrender and re-admission handling
  - Red alert escape incident broadcasting and recapture processing with statutory penalty

* **Sentence Administration & Remission Engine**:
  - Automatic computation of statutory 1/3 remission under the Prisons Act
  - Aggregation of consecutive vs. concurrent sentences
  - Computation of Earliest Date of Release (EDR), Latest Date of Release (LDR), and Parole Eligibility Dates (PED)
  - Disciplinary tribunal forfeiture of remission days ledger
  - UN Nelson Mandela Rules (Standard Minimum Rules) and human rights compliance tracking (solitary confinement 15-day strict ceiling, outdoor exercise)

* **Rehabilitation, Classification & Gratuity Schemes**:
  - 4-Stage progressive classification system (Induction, Standard, Advanced, Pre-Release Trust)
  - Vocational training and industrial workshop enrollment (Joinery, Garments, Masonry, IT)
  - Inmate labor gratuity ledger with daily earnings accrual, commissary debits, and exit disbursement

* **Court Attendance & Production Warrants**:
  - Judicial hearing docket calendars
  - Virtual video link vs. armed convoy vehicle escort dispatch
  - Workflow stage tracking from committal to judgment and sentencing

* **Discharge & Exit Management**:
  - Mandatory 7-point biometric, warrant, and property clearance checklist
  - Official Prisons Act Gate Pass and Release Certificate generation with unique barcodes

Odoo 19 Enterprise Architecture:
---------------------------------
* Compatible with Odoo 19 web views, native chatter (`<chatter/>`), OWL frontend widgets
* Multi-company / multi-facility record security rules
* Fully defined access control lists (`ir.model.access.csv`)
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

        # Menus (Loaded last to bind all actions)
        'views/prison_menus.xml',
    ],
    'demo': [
        'demo/prison_demo_data.xml',
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
}
