import React, { useState } from 'react';
import { Language, MealDistribution, MealMenu } from '../../types';
import { TRANSLATIONS } from '../../data/translations';
import { 
  Utensils, Flame, CheckCircle, Clock, ShieldCheck, 
  AlertCircle, Plus, Thermometer, UserCheck, HeartPulse
} from 'lucide-react';
import { INITIAL_MEAL_MENUS, INITIAL_MEAL_DISTRIBUTIONS } from '../../data/newModuleData';

interface PrisonMealHubProps {
  language: Language;
}

export const PrisonMealHub: React.FC<PrisonMealHubProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'distributions' | 'menus'>('distributions');
  const [distributions, setDistributions] = useState<MealDistribution[]>(INITIAL_MEAL_DISTRIBUTIONS);
  const [menus] = useState<MealMenu[]>(INITIAL_MEAL_MENUS);

  const handleDispatchMeal = (id: string) => {
    setDistributions(prev => prev.map(d => d.id === id ? { ...d, status: 'dispatched' } : d));
  };

  const handleServeMeal = (id: string) => {
    setDistributions(prev => prev.map(d => d.id === id ? { ...d, status: 'served' } : d));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
              Odoo 19 Catering Engine
            </span>
            <span className="text-xs text-slate-500 font-mono">model: prison.meal.distribution</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            {language === 'fr' ? 'Intendance Alimentaire & Restauration des Détenus' : 'Inmate Lunch, Catering & Nutritional Management'}
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'fr'
              ? 'Conformité stricte à la Règle 22 de l\'ONU (valeur nutritionnelle, hygiène et régimes Halal, Cachère, Diabétique).'
              : 'Strict compliance with UN Mandela Rules Rule 22 (adequate nutritional value, hygiene certifications & segregated diets).'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('distributions')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'distributions' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'fr' ? 'Distributions Journalières' : 'Daily Meal Batches'}
          </button>
          <button
            onClick={() => setActiveTab('menus')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'menus' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'fr' ? 'Menus & Valeurs Nutritionnelles' : 'Menus & Recipes'}
          </button>
        </div>
      </div>

      {activeTab === 'distributions' ? (
        <div className="space-y-4">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">{language === 'fr' ? 'Rations Totales (Midi)' : 'Total Lunch Rations'}</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">114</div>
              <span className="text-xs text-emerald-600 font-medium">100% {language === 'fr' ? 'préparé en cuisine centrale' : 'prepared on schedule'}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">{language === 'fr' ? 'Régimes Halal Déclarés' : 'Halal Certified Rations'}</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">18</div>
              <span className="text-xs text-slate-500">{language === 'fr' ? 'Ustensiles séparés certifiés' : 'Segregated utensils'}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">{language === 'fr' ? 'Régimes Médicaux / Diabétiques' : 'Medical Diets'}</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">8</div>
              <span className="text-xs text-blue-600 font-medium">{language === 'fr' ? 'Contrôle infirmier validé' : 'Infirmary approved'}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">{language === 'fr' ? 'Température Moyenne d\'Expédition' : 'Avg Core Temp'}</span>
              <div className="text-2xl font-bold text-emerald-700 mt-1">69.5 °C</div>
              <span className="text-xs text-emerald-600 font-medium">≥ 65°C {language === 'fr' ? 'norme sanitaire respectée' : 'sanitary norm met'}</span>
            </div>
          </div>

          {/* Distribution Batches List */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                {language === 'fr' ? 'Bons de Distribution aux Quartiers de Détention' : 'Cell Block Catering Manifests'}
              </h3>
              <span className="text-xs text-slate-500">Service: Midday Lunch (11:30 - 13:00)</span>
            </div>

            <div className="divide-y divide-slate-100">
              {distributions.map(dist => (
                <div key={dist.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">{dist.manifestNumber}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700">
                          {dist.blockName}
                        </span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                          dist.status === 'served'
                            ? 'bg-emerald-100 text-emerald-800'
                            : dist.status === 'dispatched'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}>
                          {dist.status.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 mt-1 font-medium">
                        {dist.menuName}
                      </p>

                      <p className="text-xs text-slate-500 mt-0.5">
                        {dist.facilityName} • {language === 'fr' ? 'Officier de cuisine :' : 'Duty Officer:'} {dist.officerSignoff}
                      </p>

                      {/* Dietary Portions Pills */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          Std: {dist.standardPortions}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                          Halal: {dist.halalPortions}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                          Diab: {dist.diabeticPortions}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                          Veg: {dist.vegetarianPortions}
                        </span>
                        <span className="px-2.5 py-0.5 rounded bg-slate-800 text-white font-bold">
                          {language === 'fr' ? 'Total :' : 'Total:'} {dist.totalRations}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right text-xs">
                        <div className="flex items-center gap-1 text-slate-700 font-medium">
                          <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                          <span>{dist.foodTempCelsius} °C</span>
                        </div>
                        <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 justify-end">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {language === 'fr' ? 'Hygiène Certifiée' : 'Hygiene Certified'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {dist.status === 'prep' && (
                          <button
                            onClick={() => handleDispatchMeal(dist.id)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
                          >
                            {language === 'fr' ? 'Expédier au Quartier' : 'Dispatch to Block'}
                          </button>
                        )}
                        {dist.status === 'dispatched' && (
                          <button
                            onClick={() => handleServeMeal(dist.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
                          >
                            {language === 'fr' ? 'Clôturer Service Servi' : 'Mark Served'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Menus Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menus.map(menu => (
            <div key={menu.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono text-slate-500">{menu.code}</span>
                  <h4 className="text-base font-bold text-slate-900 mt-0.5">{menu.name}</h4>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                  {menu.dietCategory}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {menu.description}
              </p>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded bg-slate-50 text-center">
                  <span className="text-slate-500 text-[11px] block">{language === 'fr' ? 'Énergie' : 'Calories'}</span>
                  <span className="font-bold text-slate-900 text-sm">{menu.caloriesKcal} kcal</span>
                </div>
                <div className="p-2 rounded bg-slate-50 text-center">
                  <span className="text-slate-500 text-[11px] block">{language === 'fr' ? 'Protéines' : 'Protein'}</span>
                  <span className="font-bold text-slate-900 text-sm">{menu.proteinGrams} g</span>
                </div>
                <div className="p-2 rounded bg-slate-50 text-center">
                  <span className="text-slate-500 text-[11px] block">{language === 'fr' ? 'Allergènes' : 'Allergens'}</span>
                  <span className="font-medium text-slate-800 text-xs truncate block">{menu.allergens}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-emerald-700 font-medium pt-1">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  {language === 'fr' ? 'Certifié par nutritionniste agréé' : 'Certified Directorate Nutritionist'}
                </span>
                <span className="text-slate-400">Nelson Mandela Rule 22</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
