# -*- coding: utf-8 -*-
# Part of Odoo Enterprise. See LICENSE file for full copyright and licensing details.

{
    'name': 'Prison Management Enterprise',
    'version': '19.0.1.1.0',
    'category': 'Human Resources/Corrections',
    'summary': 'End-to-End Correctional Facilities, Multi-Prison Directory, Court Calendar, Meal Management, Fleet Convoy & Visitors ERP',
    'description': """
Prison Management System for Odoo 19 Enterprise
================================================
This official enterprise-grade module delivers a comprehensive national management
system for correctional directorates, maximum/medium security penitentiaries, and remand centers.

Key Enterprise Capabilities:
-----------------------------
* **Multi-Prison Facility Directorate & Dashboard**:
  - Live occupancy and overcrowding capacity tracking across national facilities
  - High-performance operational KPI dashboard
  - Security categorization: CAT A, CAT B, CAT C, CAT D

* **Cell & Room Facilities Management**:
  - Wings, cell blocks, individual detention cells, and group dormitories
  - Certified bed capacities, real-time occupancy counts, and fixture checklists
  - Cell hardware maintenance work orders (locks, bars, plumbing, duress buttons)

* **Court Attendance Calendar & Escort Convoy Fleet**:
  - Dynamic Odoo 19 Calendar view for judicial hearings, plea mentions, and trial dockets
  - Armored cellular prisoner transport fleet vehicles with ballistic protection ratings
  - Armed judicial escort convoys with routing, manifest tracking, and radio telemetry

* **Prisoners Lunch & Catering Management**:
  - Nutritional menu planning with calorie counts and dietary classifications (Halal, Kosher, Diabetic, Vegetarian)
  - Daily meal batch distribution to cell blocks with temperature verification and hygiene certification

* **Inmate Visitors & Parloir Management**:
  - Visitor registry with biometric photo, national ID, and background security vetting
  - Parloir visiting session bookings with 4-step security screening (metal detector, K9, contraband search)

* **Inmate Admissions & Movements**:
  - Intake booking with biometric records, 10-prints, iris scans
  - Sealed property vault tracking with tamper-proof bag seals
  - Inter-prison armed convoy transfer requests with dispatch/arrival protocols
  - Red alert escape incident broadcasting and recapture processing

* **Sentence Administration & Remission Engine**:
  - Automatic computation of statutory 1/3 remission under the Prisons Act
  - Aggregation of consecutive vs. concurrent sentences
  - Computation of Earliest Date of Release (EDR), Latest Date of Release (LDR), and Parole Eligibility Dates (PED)
  - UN Nelson Mandela Rules compliance tracking (solitary confinement 15-day strict ceiling)

* **Discharge & Exit Management**:
  - Mandatory 7-point biometric, warrant, and property clearance checklist
  - Official Prisons Act Gate Pass and Release Certificate generation with unique barcodes

* **Internationalization (i18n)**:
  - Full French translation (fr.po) for all models, views, wizards, and menus.
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
        'views/prison_dashboard_views.xml',
        'views/prison_facility_views.xml',
        'views/prison_cell_views.xml',
        'views/prison_inmate_views.xml',
        'views/prison_sentence_views.xml',
        'views/prison_court_views.xml',
        'views/prison_court_calendar_views.xml',
        'views/prison_fleet_views.xml',
        'views/prison_meal_views.xml',
        'views/prison_visitor_views.xml',
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
