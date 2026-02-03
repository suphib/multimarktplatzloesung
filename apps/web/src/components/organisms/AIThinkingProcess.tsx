import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Search, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ThinkingStep {
  id: string;
  labelKey: string;
  value: string | null;
  status: 'pending' | 'active' | 'complete';
  duration: number;
}

interface AIThinkingResult {
  query: string;
  category: string;
  eclassCode: string;
  frameworkContracts: number;
  recommendation: string;
  isHazardous: boolean;
}

interface AIThinkingProcessProps {
  query: string;
  onComplete: (result: AIThinkingResult) => void;
  isVisible: boolean;
}

export function AIThinkingProcess({ query, onComplete, isVisible }: AIThinkingProcessProps) {
  const { t } = useTranslation();
  const [steps, setSteps] = useState<ThinkingStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [isHazardous, setIsHazardous] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const initialSteps: ThinkingStep[] = [
      { id: 'category', labelKey: 'ai.thinking.category', value: null, status: 'pending', duration: 600 },
      { id: 'eclass', labelKey: 'ai.thinking.eclass', value: null, status: 'pending', duration: 500 },
      { id: 'framework', labelKey: 'ai.thinking.framework', value: null, status: 'pending', duration: 800 },
      { id: 'recommendation', labelKey: 'ai.thinking.recommendation', value: null, status: 'pending', duration: 600 },
    ];

    setSteps(initialSteps);
    setCurrentStep(0);
    setRecommendation(null);
    setIsHazardous(false);

    let stepIndex = 0;
    const processStep = () => {
      if (stepIndex >= initialSteps.length) {
        const rec = getRecommendation(query);
        const hazardous = isHazardousQuery(query);
        setRecommendation(rec);
        setIsHazardous(hazardous);

        setTimeout(() => {
          onComplete({
            query,
            category: getStepValue('category', query),
            eclassCode: getStepValue('eclass', query),
            frameworkContracts: getFrameworkCount(query),
            recommendation: rec,
            isHazardous: hazardous,
          });
        }, 500);
        return;
      }

      setSteps(prev => prev.map((s, i) => ({
        ...s,
        status: i === stepIndex ? 'active' : i < stepIndex ? 'complete' : 'pending',
        value: i === stepIndex ? getStepValue(s.id, query) : s.value
      })));

      setCurrentStep(stepIndex);

      setTimeout(() => {
        setSteps(prev => prev.map((s, i) => ({
          ...s,
          status: i <= stepIndex ? 'complete' : 'pending'
        })));
        stepIndex++;
        processStep();
      }, initialSteps[stepIndex].duration);
    };

    const timeout = setTimeout(processStep, 100);
    return () => clearTimeout(timeout);
  }, [isVisible, query, onComplete]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-xl mx-auto"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="relative">
          <Sparkles className="w-5 h-5 text-primary-600" />
          <motion.div
            className="absolute inset-0 bg-primary-400 rounded-full opacity-30"
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
        <span className="font-medium text-gray-700">
          {t('ai.thinking.analyzing')}: "<span className="text-primary-600">{query}</span>"
        </span>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <ThinkingStepRow
            key={step.id}
            step={step}
            isActive={index === currentStep}
          />
        ))}
      </div>

      <AnimatePresence>
        {recommendation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 pt-4 border-t border-gray-100"
          >
            <div className={`flex items-start gap-3 p-4 rounded-lg ${
              isHazardous
                ? 'bg-red-50 border border-red-200'
                : 'bg-green-50 border border-green-200'
            }`}>
              {isHazardous ? (
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              ) : (
                <Sparkles className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <div className={`font-medium ${isHazardous ? 'text-red-800' : 'text-green-800'}`}>
                  {t('ai.thinking.recommendationLabel')}
                </div>
                <div className={`text-sm mt-1 ${isHazardous ? 'text-red-700' : 'text-green-700'}`}>
                  {recommendation}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface ThinkingStepRowProps {
  step: ThinkingStep;
  isActive: boolean;
}

function ThinkingStepRow({ step, isActive }: ThinkingStepRowProps) {
  const { t } = useTranslation();
  const Icon = step.status === 'complete' ? CheckCircle :
               step.status === 'active' ? Loader2 :
               Search;

  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Icon
        className={`w-5 h-5 flex-shrink-0 ${
          step.status === 'complete' ? 'text-green-500' :
          step.status === 'active' ? 'text-primary-500 animate-spin' :
          'text-gray-300'
        }`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center text-sm gap-2">
          <span className={`${
            step.status === 'pending' ? 'text-gray-400' : 'text-gray-700'
          }`}>
            {t(step.labelKey as never)}
          </span>
          {step.value && step.status !== 'pending' && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-medium text-gray-900 truncate text-right"
            >
              {step.value}
            </motion.span>
          )}
        </div>
        {isActive && (
          <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: step.duration / 1000, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-primary-500 to-purple-500"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

function getStepValue(stepId: string, query: string): string {
  const queryLower = query.toLowerCase();

  const mappings: Record<string, Record<string, string>> = {
    category: {
      laptop: 'IT-Hardware / Notebooks',
      notebook: 'IT-Hardware / Notebooks',
      thinkpad: 'IT-Hardware / Notebooks',
      elitebook: 'IT-Hardware / Notebooks',
      macbook: 'IT-Hardware / Notebooks',
      monitor: 'IT-Hardware / Displays',
      bildschirm: 'IT-Hardware / Displays',
      bürostuhl: 'Büromöbel / Sitzmöbel',
      stuhl: 'Büromöbel / Sitzmöbel',
      schreibtisch: 'Büromöbel / Tische',
      salzsäure: 'Chemikalien / Säuren',
      säure: 'Chemikalien / Säuren',
      isopropanol: 'Chemikalien / Lösungsmittel',
      labor: 'Laborbedarf / Allgemein',
      pipette: 'Laborbedarf / Messinstrumente',
      drucker: 'IT-Hardware / Drucker',
      maus: 'IT-Hardware / Peripherie',
      tastatur: 'IT-Hardware / Peripherie',
    },
    eclass: {
      laptop: '43-21-10-01',
      notebook: '43-21-10-01',
      thinkpad: '43-21-10-01',
      elitebook: '43-21-10-01',
      macbook: '43-21-10-01',
      monitor: '43-21-11-01',
      bildschirm: '43-21-11-01',
      bürostuhl: '24-11-01-01',
      stuhl: '24-11-01-01',
      schreibtisch: '24-11-02-01',
      salzsäure: '36-01-08-01',
      säure: '36-01-08-01',
      isopropanol: '36-01-09-01',
      labor: '36-01-00-00',
      pipette: '36-02-01-01',
      drucker: '43-21-14-01',
      maus: '43-21-15-01',
      tastatur: '43-21-15-02',
    },
    framework: {
      laptop: '2 Treffer (Dell, Lenovo)',
      notebook: '2 Treffer (Dell, Lenovo)',
      thinkpad: '1 Treffer (Lenovo)',
      elitebook: '1 Treffer (HP)',
      macbook: 'Kein Rahmenvertrag',
      monitor: '1 Treffer (Dell)',
      bildschirm: '1 Treffer (Dell)',
      bürostuhl: '1 Treffer (Sedus)',
      stuhl: '1 Treffer (Sedus)',
      schreibtisch: '1 Treffer (Sedus)',
      salzsäure: 'Kein Rahmenvertrag',
      säure: 'Kein Rahmenvertrag',
      isopropanol: 'Kein Rahmenvertrag',
      labor: 'Kein Rahmenvertrag',
      pipette: '1 Treffer (Eppendorf)',
      drucker: '1 Treffer (HP)',
      maus: '1 Treffer (Logitech)',
      tastatur: '1 Treffer (Logitech)',
    },
  };

  for (const [key, value] of Object.entries(mappings[stepId] || {})) {
    if (queryLower.includes(key)) {
      return value;
    }
  }

  // Default values
  const defaults: Record<string, string> = {
    category: 'Allgemein',
    eclass: '00-00-00-00',
    framework: 'Wird geprüft...',
  };

  return defaults[stepId] || '';
}

function getRecommendation(query: string): string {
  const queryLower = query.toLowerCase();

  if (queryLower.includes('salzsäure') || (queryLower.includes('säure') && !queryLower.includes('pipette'))) {
    return 'Sonderbeschaffung erforderlich (Gefahrstoff)';
  }
  if (queryLower.includes('isopropanol')) {
    return 'Sonderbeschaffung erforderlich (Gefahrstoff)';
  }
  if (queryLower.includes('laptop') || queryLower.includes('notebook') || queryLower.includes('thinkpad')) {
    return 'Rahmenvertrag Dell priorisieren (12% günstiger als Marktplatz)';
  }
  if (queryLower.includes('bürostuhl') || queryLower.includes('stuhl') || queryLower.includes('schreibtisch')) {
    return 'Rahmenvertrag Sedus nutzen';
  }
  if (queryLower.includes('monitor') || queryLower.includes('bildschirm')) {
    return 'Rahmenvertrag Dell priorisieren';
  }
  if (queryLower.includes('macbook') || queryLower.includes('apple')) {
    return 'Kein Rahmenvertrag verfügbar – Marktplatzvergleich empfohlen';
  }

  return 'Marktplatzvergleich empfohlen';
}

function getFrameworkCount(query: string): number {
  const queryLower = query.toLowerCase();
  if (queryLower.includes('laptop') || queryLower.includes('notebook')) return 2;
  if (queryLower.includes('salzsäure') || queryLower.includes('isopropanol') || queryLower.includes('macbook')) return 0;
  return 1;
}

function isHazardousQuery(query: string): boolean {
  const queryLower = query.toLowerCase();
  return queryLower.includes('salzsäure') ||
         queryLower.includes('säure') ||
         queryLower.includes('isopropanol') ||
         queryLower.includes('gefahrstoff');
}
