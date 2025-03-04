/**
 * Данные о редакциях Deckhouse Kubernetes Platform
 * Сформированы на основе анализа таблицы сравнения редакций с сайта
 */

export type FeatureStatus = 'present' | 'absent' | 'planned' | 'conditionally-available';

export interface Edition {
  id: string;
  name: string;
  description: string;
  features: Record<string, FeatureStatus>;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  category: string;
  importance: number; // 1-10 где 10 - критически важная для принятия решения
}

// Категории функций
export const CATEGORIES = {
  GENERAL: 'Общее',
  SECURITY: 'Безопасность',
  NETWORK: 'Сетевые возможности',
  STORAGE: 'Хранение данных',
  VIRTUALIZATION: 'Виртуализация',
  OBSERVABILITY: 'Наблюдаемость',
  OTHER: 'Прочее'
};

// Определение функций и их важности для принятия решения
export const features: Feature[] = [
  {
    id: 'registry',
    name: 'Наличие в Реестре российского ПО',
    description: 'Продукт включен в Реестр отечественного программного обеспечения',
    category: CATEGORIES.GENERAL,
    importance: 9
  },
  {
    id: 'russian_os',
    name: 'Поддержка российских ОС',
    description: 'Возможность установки на российские операционные системы',
    category: CATEGORIES.GENERAL,
    importance: 8
  },
  {
    id: 'closed_env',
    name: 'Развертывание в закрытом контуре',
    description: 'Возможность установки в изолированном окружении без доступа к внешним сетям',
    category: CATEGORIES.GENERAL,
    importance: 9
  },
  {
    id: 'admin_ui',
    name: 'Интерфейс администратора',
    description: 'Наличие графического интерфейса для управления кластером',
    category: CATEGORIES.GENERAL,
    importance: 7
  },
  {
    id: 'centralized_mgmt',
    name: 'Централизованное управление парком кластеров',
    description: 'Возможность управлять несколькими кластерами из единого интерфейса',
    category: CATEGORIES.GENERAL,
    importance: 6
  },
  {
    id: 'fstek_cert',
    name: 'Сертификация ФСТЭК',
    description: 'Наличие сертификата ФСТЭК',
    category: CATEGORIES.SECURITY,
    importance: 10
  },
  {
    id: 'warranty_support',
    name: 'Гарантийная техническая поддержка',
    description: 'Базовая техническая поддержка, включенная в стоимость продукта',
    category: CATEGORIES.GENERAL,
    importance: 7
  },
  {
    id: 'physical_servers',
    name: 'Установка на физические серверы',
    description: 'Возможность установки непосредственно на физические серверы',
    category: CATEGORIES.GENERAL,
    importance: 6
  },
  {
    id: 'vm_install',
    name: 'Установка на виртуальные машины',
    description: 'Возможность установки на предсозданные виртуальные машины в любой системе виртуализации',
    category: CATEGORIES.GENERAL,
    importance: 6
  },
  {
    id: 'security_policies',
    name: 'Политики безопасности',
    description: 'Поддержка микросегментации и политик сетевой безопасности',
    category: CATEGORIES.SECURITY,
    importance: 8
  },
  {
    id: 'image_sign_verify',
    name: 'Проверка подписи образов контейнеров',
    description: 'Возможность верификации подписей образов контейнеров',
    category: CATEGORIES.SECURITY,
    importance: 7
  },
  {
    id: 'deny_vulnerable',
    name: 'Запрет на запуск контейнеров с уязвимостями',
    description: 'Возможность запретить запуск контейнеров с известными уязвимостями',
    category: CATEGORIES.SECURITY,
    importance: 8
  },
  {
    id: 'threat_detection',
    name: 'Поиск угроз безопасности',
    description: 'Встроенные механизмы для обнаружения потенциальных угроз безопасности',
    category: CATEGORIES.SECURITY,
    importance: 8
  },
  {
    id: 'image_scanning',
    name: 'Сканирование образов в runtime',
    description: 'Проверка образов контейнеров на уязвимости во время выполнения',
    category: CATEGORIES.SECURITY,
    importance: 7
  },
  {
    id: 'storage_local',
    name: 'Встроенное локальное хранилище',
    description: 'Встроенное локальное программно-определяемое хранилище',
    category: CATEGORIES.STORAGE,
    importance: 6
  },
  {
    id: 'service_mesh',
    name: 'Service Mesh возможности',
    description: 'Поддержка Service Mesh для управления коммуникацией между сервисами',
    category: CATEGORIES.NETWORK,
    importance: 6
  },
  {
    id: 'vm_support',
    name: 'Запуск виртуальных машин',
    description: 'Возможность запуска виртуальных машин рядом с контейнерами',
    category: CATEGORIES.VIRTUALIZATION,
    importance: 7
  },
  {
    id: 'monitoring',
    name: 'Расширенный мониторинг',
    description: 'Расширенные возможности мониторинга с готовыми метриками и оповещениями',
    category: CATEGORIES.OBSERVABILITY,
    importance: 7
  }
];

// Определение редакций и их функций
export const editions: Edition[] = [
  {
    id: 'community',
    name: 'Community Edition',
    description: 'Бесплатная базовая редакция для ознакомления или небольших проектов',
    features: {
      'registry': 'absent',
      'russian_os': 'absent',
      'closed_env': 'absent',
      'admin_ui': 'absent',
      'centralized_mgmt': 'conditionally-available',
      'fstek_cert': 'absent',
      'warranty_support': 'absent',
      'physical_servers': 'present',
      'vm_install': 'present',
      'security_policies': 'present',
      'image_sign_verify': 'absent',
      'deny_vulnerable': 'absent',
      'threat_detection': 'absent',
      'image_scanning': 'absent',
      'storage_local': 'present',
      'service_mesh': 'present',
      'vm_support': 'present',
      'monitoring': 'present'
    }
  },
  {
    id: 'basic',
    name: 'Basic Edition',
    description: 'Коммерческая редакция для простых сценариев использования в российских компаниях',
    features: {
      'registry': 'present',
      'russian_os': 'present',
      'closed_env': 'absent',
      'admin_ui': 'absent',
      'centralized_mgmt': 'conditionally-available',
      'fstek_cert': 'absent',
      'warranty_support': 'present',
      'physical_servers': 'present',
      'vm_install': 'present',
      'security_policies': 'present',
      'image_sign_verify': 'absent',
      'deny_vulnerable': 'absent',
      'threat_detection': 'absent',
      'image_scanning': 'absent',
      'storage_local': 'absent',
      'service_mesh': 'present',
      'vm_support': 'absent',
      'monitoring': 'present'
    }
  },
  {
    id: 'standard',
    name: 'Standard Edition',
    description: 'Классическая коммерческая редакция с базовыми возможностями для большинства задач',
    features: {
      'registry': 'present',
      'russian_os': 'present',
      'closed_env': 'present',
      'admin_ui': 'present',
      'centralized_mgmt': 'conditionally-available',
      'fstek_cert': 'absent',
      'warranty_support': 'present',
      'physical_servers': 'present',
      'vm_install': 'present',
      'security_policies': 'present',
      'image_sign_verify': 'absent',
      'deny_vulnerable': 'absent',
      'threat_detection': 'absent',
      'image_scanning': 'absent',
      'storage_local': 'present',
      'service_mesh': 'present',
      'vm_support': 'absent',
      'monitoring': 'present'
    }
  },
  {
    id: 'standard_plus',
    name: 'Standard Edition+',
    description: 'Расширенная коммерческая редакция с дополнительными возможностями',
    features: {
      'registry': 'present',
      'russian_os': 'present',
      'closed_env': 'present',
      'admin_ui': 'present',
      'centralized_mgmt': 'present',
      'fstek_cert': 'absent',
      'warranty_support': 'present',
      'physical_servers': 'present',
      'vm_install': 'present',
      'security_policies': 'present',
      'image_sign_verify': 'planned',
      'deny_vulnerable': 'absent',
      'threat_detection': 'absent',
      'image_scanning': 'absent',
      'storage_local': 'present',
      'service_mesh': 'present',
      'vm_support': 'present',
      'monitoring': 'present'
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise Edition',
    description: 'Полнофункциональная редакция для крупных проектов и предприятий',
    features: {
      'registry': 'present',
      'russian_os': 'present',
      'closed_env': 'present',
      'admin_ui': 'present',
      'centralized_mgmt': 'present',
      'fstek_cert': 'absent',
      'warranty_support': 'present',
      'physical_servers': 'present',
      'vm_install': 'present',
      'security_policies': 'present',
      'image_sign_verify': 'present',
      'deny_vulnerable': 'present',
      'threat_detection': 'present',
      'image_scanning': 'present',
      'storage_local': 'present',
      'service_mesh': 'present',
      'vm_support': 'present',
      'monitoring': 'present'
    }
  },
  {
    id: 'cert_security_lite',
    name: 'Certified Security Edition Lite',
    description: 'Редакция с сертификацией ФСТЭК с облегченным набором функций',
    features: {
      'registry': 'present',
      'russian_os': 'present',
      'closed_env': 'present',
      'admin_ui': 'absent',
      'centralized_mgmt': 'planned',
      'fstek_cert': 'present',
      'warranty_support': 'present',
      'physical_servers': 'present',
      'vm_install': 'present',
      'security_policies': 'present',
      'image_sign_verify': 'planned',
      'deny_vulnerable': 'present',
      'threat_detection': 'present',
      'image_scanning': 'present',
      'storage_local': 'absent',
      'service_mesh': 'absent',
      'vm_support': 'absent',
      'monitoring': 'absent'
    }
  },
  {
    id: 'cert_security_pro',
    name: 'Certified Security Edition Pro',
    description: 'Полная редакция с сертификацией ФСТЭК и расширенными функциями',
    features: {
      'registry': 'present',
      'russian_os': 'present',
      'closed_env': 'present',
      'admin_ui': 'planned',
      'centralized_mgmt': 'planned',
      'fstek_cert': 'present',
      'warranty_support': 'present',
      'physical_servers': 'present',
      'vm_install': 'present',
      'security_policies': 'present',
      'image_sign_verify': 'planned',
      'deny_vulnerable': 'present',
      'threat_detection': 'present',
      'image_scanning': 'present',
      'storage_local': 'planned',
      'service_mesh': 'absent',
      'vm_support': 'planned',
      'monitoring': 'planned'
    }
  }
];

// Дерево решений для выбора оптимальной редакции
export interface DecisionNode {
  id: string;
  question: string;
  featureId?: string;
  yes?: string;
  no?: string;
  result?: string;
}

export const decisionTree: Record<string, DecisionNode> = {
  'root': {
    id: 'root',
    question: 'Требуется ли сертификация ФСТЭК?',
    featureId: 'fstek_cert',
    yes: 'fstek_cert_node',
    no: 'registry_node'
  },
  'fstek_cert_node': {
    id: 'fstek_cert_node',
    question: 'Нужны ли продвинутые функции (интерфейс администратора, виртуализация)?',
    yes: 'cert_security_pro_result',
    no: 'cert_security_lite_result'
  },
  'registry_node': {
    id: 'registry_node',
    question: 'Требуется ли наличие в реестре российского ПО?',
    featureId: 'registry',
    yes: 'closed_env_node',
    no: 'community_result'
  },
  'closed_env_node': {
    id: 'closed_env_node',
    question: 'Нужно ли развертывание в закрытом контуре?',
    featureId: 'closed_env',
    yes: 'admin_ui_node',
    no: 'basic_result'
  },
  'admin_ui_node': {
    id: 'admin_ui_node',
    question: 'Нужен ли интерфейс администратора?',
    featureId: 'admin_ui',
    yes: 'central_mgmt_node',
    no: 'basic_result'
  },
  'central_mgmt_node': {
    id: 'central_mgmt_node',
    question: 'Требуется ли централизованное управление несколькими кластерами?',
    featureId: 'centralized_mgmt',
    yes: 'security_node',
    no: 'standard_result'
  },
  'security_node': {
    id: 'security_node',
    question: 'Нужны ли расширенные функции безопасности (проверка уязвимостей, подписи образов)?',
    yes: 'enterprise_result',
    no: 'vm_node'
  },
  'vm_node': {
    id: 'vm_node',
    question: 'Нужно ли запускать виртуальные машины рядом с контейнерами?',
    featureId: 'vm_support',
    yes: 'standard_plus_result',
    no: 'standard_result'
  },
  // Результаты
  'community_result': {
    id: 'community_result',
    question: 'Рекомендуемая редакция: Community Edition',
    result: 'community'
  },
  'basic_result': {
    id: 'basic_result',
    question: 'Рекомендуемая редакция: Basic Edition',
    result: 'basic'
  },
  'standard_result': {
    id: 'standard_result',
    question: 'Рекомендуемая редакция: Standard Edition',
    result: 'standard'
  },
  'standard_plus_result': {
    id: 'standard_plus_result',
    question: 'Рекомендуемая редакция: Standard Edition+',
    result: 'standard_plus'
  },
  'enterprise_result': {
    id: 'enterprise_result',
    question: 'Рекомендуемая редакция: Enterprise Edition',
    result: 'enterprise'
  },
  'cert_security_lite_result': {
    id: 'cert_security_lite_result',
    question: 'Рекомендуемая редакция: Certified Security Edition Lite',
    result: 'cert_security_lite'
  },
  'cert_security_pro_result': {
    id: 'cert_security_pro_result',
    question: 'Рекомендуемая редакция: Certified Security Edition Pro',
    result: 'cert_security_pro'
  }
};
