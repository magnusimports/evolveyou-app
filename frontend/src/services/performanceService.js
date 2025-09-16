// Serviço de Performance - EvolveYou
import React from 'react';

class PerformanceService {
  constructor() {
    this.metrics = {
      pageLoads: [],
      apiCalls: [],
      renderTimes: [],
      memoryUsage: [],
      errors: []
    };
    
    this.observers = {
      performance: null,
      intersection: null,
      mutation: null
    };
    
    this.config = {
      maxMetricsHistory: 100,
      performanceThreshold: 3000, // 3 segundos
      memoryThreshold: 50 * 1024 * 1024, // 50MB
      enableDetailedLogging: false
    };
    
    this.init();
  }

  init() {
    this.setupPerformanceObserver();
    this.setupMemoryMonitoring();
    this.setupErrorTracking();
    this.setupNetworkMonitoring();
  }

  // Configurar observador de performance
  setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      try {
        this.observers.performance = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.processPerformanceEntry(entry);
          }
        });

        this.observers.performance.observe({
          entryTypes: ['navigation', 'resource', 'measure', 'paint']
        });
      } catch (error) {
        console.warn('PerformanceObserver não suportado:', error);
      }
    }
  }

  // Processar entrada de performance
  processPerformanceEntry(entry) {
    const timestamp = Date.now();
    
    switch (entry.entryType) {
      case 'navigation':
        this.metrics.pageLoads.push({
          timestamp,
          loadTime: entry.loadEventEnd - entry.loadEventStart,
          domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
          firstPaint: entry.responseEnd - entry.requestStart,
          url: entry.name
        });
        break;
        
      case 'resource':
        if (entry.name.includes('/api/')) {
          this.metrics.apiCalls.push({
            timestamp,
            url: entry.name,
            duration: entry.responseEnd - entry.requestStart,
            size: entry.transferSize || 0,
            cached: entry.transferSize === 0 && entry.decodedBodySize > 0
          });
        }
        break;
        
      case 'measure':
        this.metrics.renderTimes.push({
          timestamp,
          name: entry.name,
          duration: entry.duration,
          startTime: entry.startTime
        });
        break;
        
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          this.logMetric('FCP', entry.startTime);
        }
        break;
    }
    
    // Manter histórico limitado
    this.trimMetricsHistory();
  }

  // Configurar monitoramento de memória
  setupMemoryMonitoring() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        this.metrics.memoryUsage.push({
          timestamp: Date.now(),
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        });
        
        // Verificar se está próximo do limite
        if (memory.usedJSHeapSize > this.config.memoryThreshold) {
          this.logWarning('Alto uso de memória detectado', {
            used: this.formatBytes(memory.usedJSHeapSize),
            total: this.formatBytes(memory.totalJSHeapSize)
          });
        }
        
        this.trimMetricsHistory();
      }, 30000); // A cada 30 segundos
    }
  }

  // Configurar rastreamento de erros
  setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this.metrics.errors.push({
        timestamp: Date.now(),
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack
      });
      this.trimMetricsHistory();
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.metrics.errors.push({
        timestamp: Date.now(),
        type: 'promise',
        message: event.reason?.message || 'Promise rejeitada',
        stack: event.reason?.stack
      });
      this.trimMetricsHistory();
    });
  }

  // Configurar monitoramento de rede
  setupNetworkMonitoring() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      const logConnection = () => {
        this.logMetric('Network', {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        });
      };
      
      connection.addEventListener('change', logConnection);
      logConnection(); // Log inicial
    }
  }

  // Medir performance de função
  measureFunction(name, fn) {
    return async (...args) => {
      const startTime = performance.now();
      
      try {
        const result = await fn(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.logMetric(`Function: ${name}`, duration);
        
        if (duration > this.config.performanceThreshold) {
          this.logWarning(`Função lenta detectada: ${name}`, { duration });
        }
        
        return result;
      } catch (error) {
        this.logError(`Erro na função: ${name}`, error);
        throw error;
      }
    };
  }

  // Medir performance de componente React
  measureComponent(componentName) {
    return {
      onRenderStart: () => {
        performance.mark(`${componentName}-render-start`);
      },
      
      onRenderEnd: () => {
        performance.mark(`${componentName}-render-end`);
        performance.measure(
          `${componentName}-render`,
          `${componentName}-render-start`,
          `${componentName}-render-end`
        );
      }
    };
  }

  // Medir carregamento de dados
  async measureDataLoad(name, loadFunction) {
    const startTime = performance.now();
    performance.mark(`${name}-start`);
    
    try {
      const result = await loadFunction();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      this.logMetric(`Data Load: ${name}`, duration);
      
      return result;
    } catch (error) {
      this.logError(`Erro no carregamento: ${name}`, error);
      throw error;
    }
  }

  // Otimizar imagens lazy loading
  setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      this.observers.intersection = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              this.observers.intersection.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: '50px'
      });
    }
  }

  // Registrar imagem para lazy loading
  registerLazyImage(img) {
    if (this.observers.intersection) {
      this.observers.intersection.observe(img);
    }
  }

  // Debounce para otimizar eventos
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Throttle para otimizar eventos
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Pré-carregar recursos críticos
  preloadCriticalResources(resources) {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.url;
      link.as = resource.type || 'fetch';
      if (resource.crossorigin) {
        link.crossOrigin = resource.crossorigin;
      }
      document.head.appendChild(link);
    });
  }

  // Otimizar bundle splitting
  async loadComponentDynamically(componentPath) {
    const startTime = performance.now();
    
    try {
      const component = await import(componentPath);
      const loadTime = performance.now() - startTime;
      
      this.logMetric(`Dynamic Import: ${componentPath}`, loadTime);
      
      return component;
    } catch (error) {
      this.logError(`Erro no carregamento dinâmico: ${componentPath}`, error);
      throw error;
    }
  }

  // Limitar histórico de métricas
  trimMetricsHistory() {
    Object.keys(this.metrics).forEach(key => {
      if (this.metrics[key].length > this.config.maxMetricsHistory) {
        this.metrics[key] = this.metrics[key].slice(-this.config.maxMetricsHistory);
      }
    });
  }

  // Logging de métricas
  logMetric(name, value) {
    if (this.config.enableDetailedLogging) {
      console.log(`📊 Performance: ${name}`, value);
    }
  }

  logWarning(message, data) {
    console.warn(`⚠️ Performance Warning: ${message}`, data);
  }

  logError(message, error) {
    console.error(`❌ Performance Error: ${message}`, error);
  }

  // Formatar bytes
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Obter relatório de performance
  getPerformanceReport() {
    const now = Date.now();
    const last5Minutes = now - (5 * 60 * 1000);
    
    const recentMetrics = {
      pageLoads: this.metrics.pageLoads.filter(m => m.timestamp > last5Minutes),
      apiCalls: this.metrics.apiCalls.filter(m => m.timestamp > last5Minutes),
      renderTimes: this.metrics.renderTimes.filter(m => m.timestamp > last5Minutes),
      memoryUsage: this.metrics.memoryUsage.filter(m => m.timestamp > last5Minutes),
      errors: this.metrics.errors.filter(m => m.timestamp > last5Minutes)
    };

    const report = {
      timestamp: now,
      summary: {
        totalPageLoads: recentMetrics.pageLoads.length,
        totalApiCalls: recentMetrics.apiCalls.length,
        totalRenders: recentMetrics.renderTimes.length,
        totalErrors: recentMetrics.errors.length,
        avgLoadTime: this.calculateAverage(recentMetrics.pageLoads, 'loadTime'),
        avgApiTime: this.calculateAverage(recentMetrics.apiCalls, 'duration'),
        avgRenderTime: this.calculateAverage(recentMetrics.renderTimes, 'duration'),
        currentMemory: this.getCurrentMemoryUsage()
      },
      details: recentMetrics,
      recommendations: this.generateRecommendations(recentMetrics)
    };

    return report;
  }

  // Calcular média
  calculateAverage(array, property) {
    if (array.length === 0) return 0;
    const sum = array.reduce((acc, item) => acc + (item[property] || 0), 0);
    return Math.round(sum / array.length);
  }

  // Obter uso atual de memória
  getCurrentMemoryUsage() {
    if ('memory' in performance) {
      const memory = performance.memory;
      return {
        used: this.formatBytes(memory.usedJSHeapSize),
        total: this.formatBytes(memory.totalJSHeapSize),
        percentage: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100)
      };
    }
    return null;
  }

  // Gerar recomendações
  generateRecommendations(metrics) {
    const recommendations = [];
    
    // Verificar tempo de carregamento
    const avgLoadTime = this.calculateAverage(metrics.pageLoads, 'loadTime');
    if (avgLoadTime > 3000) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: 'Tempo de carregamento alto detectado',
        suggestion: 'Considere otimizar recursos críticos e implementar code splitting'
      });
    }
    
    // Verificar chamadas de API
    const slowApiCalls = metrics.apiCalls.filter(call => call.duration > 2000);
    if (slowApiCalls.length > 0) {
      recommendations.push({
        type: 'api',
        priority: 'medium',
        message: `${slowApiCalls.length} chamadas de API lentas detectadas`,
        suggestion: 'Implemente cache mais agressivo ou otimize consultas no backend'
      });
    }
    
    // Verificar erros
    if (metrics.errors.length > 0) {
      recommendations.push({
        type: 'error',
        priority: 'high',
        message: `${metrics.errors.length} erros detectados`,
        suggestion: 'Revise e corrija os erros para melhorar a estabilidade'
      });
    }
    
    // Verificar uso de memória
    const currentMemory = this.getCurrentMemoryUsage();
    if (currentMemory && currentMemory.percentage > 80) {
      recommendations.push({
        type: 'memory',
        priority: 'medium',
        message: 'Alto uso de memória detectado',
        suggestion: 'Implemente limpeza de cache e otimize componentes'
      });
    }
    
    return recommendations;
  }

  // Limpar métricas
  clearMetrics() {
    Object.keys(this.metrics).forEach(key => {
      this.metrics[key] = [];
    });
  }

  // Configurar modo de desenvolvimento
  setDevelopmentMode(enabled) {
    this.config.enableDetailedLogging = enabled;
    if (enabled) {
      console.log('🔧 Modo de desenvolvimento ativado - logging detalhado habilitado');
    }
  }
}

// Instância singleton
export const performanceService = new PerformanceService();

// Hook React para usar o serviço de performance
export const usePerformanceService = () => {
  const [performanceReport, setPerformanceReport] = React.useState(null);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setPerformanceReport(performanceService.getPerformanceReport());
    }, 30000); // Atualizar relatório a cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  return {
    performanceReport,
    measureFunction: performanceService.measureFunction.bind(performanceService),
    measureComponent: performanceService.measureComponent.bind(performanceService),
    measureDataLoad: performanceService.measureDataLoad.bind(performanceService),
    debounce: performanceService.debounce.bind(performanceService),
    throttle: performanceService.throttle.bind(performanceService),
    preloadCriticalResources: performanceService.preloadCriticalResources.bind(performanceService),
    getPerformanceReport: performanceService.getPerformanceReport.bind(performanceService),
    setDevelopmentMode: performanceService.setDevelopmentMode.bind(performanceService)
  };
};

