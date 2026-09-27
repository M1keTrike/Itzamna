import { DynamicTemplate } from '@/types';
import { AlertTriangle, RadioReceiver, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

interface Props {
  template: DynamicTemplate;
  onChange: (newTemplate: DynamicTemplate) => void;
  disabled?: boolean;
}

const EXTERNAL_ALERTS = [
  {
    id: 'heat_wave',
    title: 'Ola de Calor Extrema',
    source: 'Sensores Meteorológicos Externos',
    description: 'Temperatura exterior > 45°C. Se requiere priorizar el aislamiento térmico.',
    impact: (template: DynamicTemplate) => {
      const newT = JSON.parse(JSON.stringify(template)) as DynamicTemplate;
      try {
        if (newT.consumers['DOMO_BIOAGRICOLA']?.subconsumers?.['AISLAMIENTO_TERMICO_PASIVO']) {
          newT.consumers['DOMO_BIOAGRICOLA'].subconsumers['AISLAMIENTO_TERMICO_PASIVO'].priority_weight = 1.0;
        }
        if (newT.consumers['DOMO_BIOAGRICOLA']?.subconsumers?.['SISTEMA_INVERNADEROS']) {
          newT.consumers['DOMO_BIOAGRICOLA'].subconsumers['SISTEMA_INVERNADEROS'].priority_weight = 0.4;
        }
      } catch { }
      return newT;
    },
    revert: (template: DynamicTemplate) => {
      const newT = JSON.parse(JSON.stringify(template)) as DynamicTemplate;
      try {
        if (newT.consumers['DOMO_BIOAGRICOLA']?.subconsumers?.['AISLAMIENTO_TERMICO_PASIVO']) {
          newT.consumers['DOMO_BIOAGRICOLA'].subconsumers['AISLAMIENTO_TERMICO_PASIVO'].priority_weight = 0.9;
        }
        if (newT.consumers['DOMO_BIOAGRICOLA']?.subconsumers?.['SISTEMA_INVERNADEROS']) {
          newT.consumers['DOMO_BIOAGRICOLA'].subconsumers['SISTEMA_INVERNADEROS'].priority_weight = 0.95;
        }
      } catch { }
      return newT;
    }
  },
  {
    id: 'soil_toxins',
    title: 'Filtración Tóxica en Suelo',
    source: 'Sondas de Subsuelo',
    description: 'Detección de metales pesados en la capa freática. Priorizar biorremediación.',
    impact: (template: DynamicTemplate) => {
      const newT = JSON.parse(JSON.stringify(template)) as DynamicTemplate;
      try {
        if (newT.consumers['DOMO_BIOAGRICOLA']?.subconsumers?.['BIORREMEDIACION_SUELO']) {
          newT.consumers['DOMO_BIOAGRICOLA'].subconsumers['BIORREMEDIACION_SUELO'].priority_weight = 1.0;
        }
      } catch { }
      return newT;
    },
    revert: (template: DynamicTemplate) => {
      const newT = JSON.parse(JSON.stringify(template)) as DynamicTemplate;
      try {
        if (newT.consumers['DOMO_BIOAGRICOLA']?.subconsumers?.['BIORREMEDIACION_SUELO']) {
          newT.consumers['DOMO_BIOAGRICOLA'].subconsumers['BIORREMEDIACION_SUELO'].priority_weight = 0.85;
        }
      } catch { }
      return newT;
    }
  },
  {
    id: 'energy_drop',
    title: 'Tormenta de Arena (Caída Solar)',
    source: 'Satélite de Observación',
    description: 'Bloqueo de luz solar. Se requiere reducir consumos secundarios.',
    impact: (template: DynamicTemplate) => {
      const newT = JSON.parse(JSON.stringify(template)) as DynamicTemplate;
      try {
        newT.resources['ENERGIA_KWH'].value *= 0.5; // Reducir energía a la mitad
      } catch { }
      return newT;
    },
    revert: (template: DynamicTemplate) => {
      const newT = JSON.parse(JSON.stringify(template)) as DynamicTemplate;
      try {
        newT.resources['ENERGIA_KWH'].value *= 2; // Restaurar energía a la normalidad
      } catch { }
      return newT;
    }
  },
  {
    id: 'fungal_plague',
    title: 'Brote Fúngico en Suelo',
    source: 'Sensores de Humedad y Micelio',
    description: 'Esporas dañinas en Jardinera Sur. Priorizar remediación y bajar cultivo en tierra.',
    impact: (template: DynamicTemplate) => {
      const newT = JSON.parse(JSON.stringify(template)) as DynamicTemplate;
      try {
        if (newT.consumers['DOMO_BIOAGRICOLA']?.subconsumers?.['BIORREMEDIACION_SUELO']) {
          newT.consumers['DOMO_BIOAGRICOLA'].subconsumers['BIORREMEDIACION_SUELO'].priority_weight = 1.0;
        }
        if (newT.consumers['DOMO_BIOAGRICOLA']?.subconsumers?.['SISTEMA_INVERNADEROS']?.subconsumers?.['JARDINERA_SUR_SUELO']) {
          newT.consumers['DOMO_BIOAGRICOLA'].subconsumers['SISTEMA_INVERNADEROS'].subconsumers['JARDINERA_SUR_SUELO'].priority_weight = 0.2;
        }
      } catch { }
      return newT;
    },
    revert: (template: DynamicTemplate) => {
      const newT = JSON.parse(JSON.stringify(template)) as DynamicTemplate;
      try {
        if (newT.consumers['DOMO_BIOAGRICOLA']?.subconsumers?.['BIORREMEDIACION_SUELO']) {
          newT.consumers['DOMO_BIOAGRICOLA'].subconsumers['BIORREMEDIACION_SUELO'].priority_weight = 0.85;
        }
        if (newT.consumers['DOMO_BIOAGRICOLA']?.subconsumers?.['SISTEMA_INVERNADEROS']?.subconsumers?.['JARDINERA_SUR_SUELO']) {
          newT.consumers['DOMO_BIOAGRICOLA'].subconsumers['SISTEMA_INVERNADEROS'].subconsumers['JARDINERA_SUR_SUELO'].priority_weight = 0.85;
        }
      } catch { }
      return newT;
    }
  },
  {
    id: 'hydro_pump_fail',
    title: 'Falla Bomba Hidropónica',
    source: 'Telemetría de Tuberías',
    description: 'Caída de presión de agua. Se debe sacrificar hidroponía para salvar recursos.',
    impact: (template: DynamicTemplate) => {
      const newT = JSON.parse(JSON.stringify(template)) as DynamicTemplate;
      try {
        if (newT.consumers['DOMO_BIOAGRICOLA']?.subconsumers?.['SISTEMA_INVERNADEROS']?.subconsumers?.['JARDINERA_NORTE_HIDROPONIA']) {
          newT.consumers['DOMO_BIOAGRICOLA'].subconsumers['SISTEMA_INVERNADEROS'].subconsumers['JARDINERA_NORTE_HIDROPONIA'].priority_weight = 0.1;
        }
        newT.resources['AGUA_L'].value *= 0.6; 
      } catch { }
      return newT;
    },
    revert: (template: DynamicTemplate) => {
      const newT = JSON.parse(JSON.stringify(template)) as DynamicTemplate;
      try {
        if (newT.consumers['DOMO_BIOAGRICOLA']?.subconsumers?.['SISTEMA_INVERNADEROS']?.subconsumers?.['JARDINERA_NORTE_HIDROPONIA']) {
          newT.consumers['DOMO_BIOAGRICOLA'].subconsumers['SISTEMA_INVERNADEROS'].subconsumers['JARDINERA_NORTE_HIDROPONIA'].priority_weight = 0.9;
        }
        newT.resources['AGUA_L'].value /= 0.6; 
      } catch { }
      return newT;
    }
  },
  {
    id: 'cyber_noise',
    title: 'Interferencia Electromagnética',
    source: 'Gobernanza IA Core',
    description: 'Pérdida de capacidad de cómputo. Prioridad total a la IA para estabilización.',
    impact: (template: DynamicTemplate) => {
      const newT = JSON.parse(JSON.stringify(template)) as DynamicTemplate;
      try {
        newT.resources['COMPUTO_TFLOPS'].value *= 0.3; 
        if (newT.consumers['DOMO_BIOAGRICOLA']) {
           newT.consumers['DOMO_BIOAGRICOLA'].priority_weight = 0.5; // Baja el domo
        }
      } catch { }
      return newT;
    },
    revert: (template: DynamicTemplate) => {
      const newT = JSON.parse(JSON.stringify(template)) as DynamicTemplate;
      try {
        newT.resources['COMPUTO_TFLOPS'].value /= 0.3; 
        if (newT.consumers['DOMO_BIOAGRICOLA']) {
           newT.consumers['DOMO_BIOAGRICOLA'].priority_weight = 0.9; 
        }
      } catch { }
      return newT;
    }
  },
  {
    id: 'nutrient_leak',
    title: 'Déficit de Bio-Fertilizantes',
    source: 'Sensores de Biomasa',
    description: 'Agotamiento agudo de nitrógeno. Afecta severamente a los tubérculos en suelo.',
    impact: (template: DynamicTemplate) => {
      const newT = JSON.parse(JSON.stringify(template)) as DynamicTemplate;
      try {
        newT.resources['NUTRIENTES_KG'].value *= 0.4; 
        if (newT.consumers['DOMO_BIOAGRICOLA']?.subconsumers?.['SISTEMA_INVERNADEROS']?.subconsumers?.['JARDINERA_SUR_SUELO']?.subconsumers?.['ZANAHORIAS']) {
          newT.consumers['DOMO_BIOAGRICOLA'].subconsumers['SISTEMA_INVERNADEROS'].subconsumers['JARDINERA_SUR_SUELO'].subconsumers['ZANAHORIAS'].priority_weight = 0.3;
        }
      } catch { }
      return newT;
    },
    revert: (template: DynamicTemplate) => {
      const newT = JSON.parse(JSON.stringify(template)) as DynamicTemplate;
      try {
        newT.resources['NUTRIENTES_KG'].value /= 0.4; 
        if (newT.consumers['DOMO_BIOAGRICOLA']?.subconsumers?.['SISTEMA_INVERNADEROS']?.subconsumers?.['JARDINERA_SUR_SUELO']?.subconsumers?.['ZANAHORIAS']) {
          newT.consumers['DOMO_BIOAGRICOLA'].subconsumers['SISTEMA_INVERNADEROS'].subconsumers['JARDINERA_SUR_SUELO'].subconsumers['ZANAHORIAS'].priority_weight = 0.8;
        }
      } catch { }
      return newT;
    }
  },
  {
    id: 'ia_overheat',
    title: 'Sobrecalentamiento IA',
    source: 'Servidores Centrales',
    description: 'Falla térmica del núcleo. El costo energético de la IA se triplica temporalmente.',
    impact: (template: DynamicTemplate) => {
      const newT = JSON.parse(JSON.stringify(template)) as DynamicTemplate;
      try {
        if (newT.consumers['GOBERNANZA_IA']?.requirements?.['ENERGIA_KWH']) {
           newT.consumers['GOBERNANZA_IA'].requirements['ENERGIA_KWH'].value *= 3;
        }
      } catch { }
      return newT;
    },
    revert: (template: DynamicTemplate) => {
      const newT = JSON.parse(JSON.stringify(template)) as DynamicTemplate;
      try {
        if (newT.consumers['GOBERNANZA_IA']?.requirements?.['ENERGIA_KWH']) {
           newT.consumers['GOBERNANZA_IA'].requirements['ENERGIA_KWH'].value /= 3;
        }
      } catch { }
      return newT;
    }
  },
  {
    id: 'dome_fracture',
    title: 'Microrrotura Estructural',
    source: 'Escáner Láser de Polímeros',
    description: 'Brecha en el Domo. Exige el doble de energía para aislamiento térmico.',
    impact: (template: DynamicTemplate) => {
      const newT = JSON.parse(JSON.stringify(template)) as DynamicTemplate;
      try {
        if (newT.consumers['DOMO_BIOAGRICOLA']?.subconsumers?.['AISLAMIENTO_TERMICO_PASIVO']?.requirements?.['ENERGIA_KWH']) {
          newT.consumers['DOMO_BIOAGRICOLA'].subconsumers['AISLAMIENTO_TERMICO_PASIVO'].requirements['ENERGIA_KWH'].value *= 2;
          newT.consumers['DOMO_BIOAGRICOLA'].subconsumers['AISLAMIENTO_TERMICO_PASIVO'].priority_weight = 1.0;
        }
      } catch { }
      return newT;
    },
    revert: (template: DynamicTemplate) => {
      const newT = JSON.parse(JSON.stringify(template)) as DynamicTemplate;
      try {
        if (newT.consumers['DOMO_BIOAGRICOLA']?.subconsumers?.['AISLAMIENTO_TERMICO_PASIVO']?.requirements?.['ENERGIA_KWH']) {
          newT.consumers['DOMO_BIOAGRICOLA'].subconsumers['AISLAMIENTO_TERMICO_PASIVO'].requirements['ENERGIA_KWH'].value /= 2;
          newT.consumers['DOMO_BIOAGRICOLA'].subconsumers['AISLAMIENTO_TERMICO_PASIVO'].priority_weight = 0.9;
        }
      } catch { }
      return newT;
    }
  }
];

export function ExternalCrisisObserver({ template, onChange, disabled }: Props) {
  const [activeAlerts, setActiveAlerts] = useState<string[]>([]);

  const handleTriggerAlert = (alertId: string) => {
    const alertDef = EXTERNAL_ALERTS.find(a => a.id === alertId);
    if (!alertDef) return;

    // Apply impact
    const newTemplate = alertDef.impact(template);
    onChange(newTemplate);
    
    if (!activeAlerts.includes(alertId)) {
      setActiveAlerts([...activeAlerts, alertId]);
    }
  };

  const handleResolveAlert = (alertId: string) => {
    const alertDef = EXTERNAL_ALERTS.find(a => a.id === alertId);
    if (alertDef) {
      const newTemplate = alertDef.revert(template);
      onChange(newTemplate);
    }
    setActiveAlerts(activeAlerts.filter(id => id !== alertId));
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-red-200 shadow-sm mt-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <RadioReceiver size={100} />
      </div>
      
      <div className="flex items-center space-x-3 mb-4 border-b border-red-100 pb-3">
        <div className="bg-red-100 p-2 rounded-lg text-red-600 animate-pulse">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Módulo Observador de Crisis</h3>
          <p className="text-xs text-slate-500">Recibe telemetría externa y reconfigura prioridades dinámicamente.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 relative z-10">
        {EXTERNAL_ALERTS.map(alert => {
          const isActive = activeAlerts.includes(alert.id);
          return (
            <div 
              key={alert.id} 
              className={`p-4 rounded-lg border transition-all ${
                isActive 
                  ? 'bg-red-50 border-red-300 ring-2 ring-red-200 ring-offset-1' 
                  : 'bg-slate-50 border-slate-200 hover:border-red-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 flex items-center">
                  <AlertTriangle size={10} className="mr-1" /> {alert.source}
                </span>
                {isActive && (
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </div>
              <h4 className="font-semibold text-sm text-slate-800 mb-1">{alert.title}</h4>
              <p className="text-xs text-slate-600 mb-4 h-10">{alert.description}</p>
              
              {isActive ? (
                <button 
                  onClick={() => handleResolveAlert(alert.id)}
                  disabled={disabled}
                  className="w-full py-1.5 text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                >
                  Resolver Alerta
                </button>
              ) : (
                <button 
                  onClick={() => handleTriggerAlert(alert.id)}
                  disabled={disabled}
                  className="w-full py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-red-50 hover:text-red-700 hover:border-red-200 rounded-md transition-colors shadow-sm"
                >
                  Simular Recepción
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
