// podenao.js - Proteção Ultra Agressiva (Versão 2.0)
(function() {
    'use strict';
    
    // Configurações
    const config = {
        maxAttempts: 2,
        redirectUrl: 'https://www.google.com',
        aggressiveMode: true,
        debugMode: false
    };
    
    let attempts = 0;
    let devToolsOpen = false;
    let protectionActive = true;
    
    // Função de redirecionamento imediato
    function forceRedirect(reason) {
        if (!protectionActive) return;
        
        attempts++;
        
        if (config.debugMode) {
            console.warn(`PROTEÇÃO ATIVADA: ${reason} (${attempts}/${config.maxAttempts})`);
        }
        
        if (attempts >= config.maxAttempts) {
            // Múltiplas tentativas de redirecionamento para garantir
            window.location.href = config.redirectUrl;
            window.location.replace(config.redirectUrl);
            window.open(config.redirectUrl, '_self');
            
            // Backup: limpa a página se redirecionamento falhar
            setTimeout(() => {
                document.head.innerHTML = '';
                document.body.innerHTML = '<h1 style="color:red;text-align:center;margin-top:50vh;">ACESSO NEGADO</h1>';
            }, 100);
            
            // Para toda execução de JavaScript
            throw new Error('Access Denied');
        }
    }
    
    // === PROTEÇÃO CONTRA F12 E ATALHOS ===
    document.addEventListener('keydown', function(e) {
        const forbidden = [
            e.key === 'F12',
            e.keyCode === 123,
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.keyCode === 73)),
            (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.keyCode === 74)),
            (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.keyCode === 67)),
            (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.keyCode === 85)),
            (e.ctrlKey && (e.key === 's' || e.key === 'S' || e.keyCode === 83)),
            (e.ctrlKey && e.shiftKey && (e.key === 'K' || e.keyCode === 75))
        ];
        
        if (forbidden.some(condition => condition)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            e.stopPropagation();
            forceRedirect(`Tecla proibida: ${e.key || e.keyCode}`);
            return false;
        }
    }, true);
    
    // === PROTEÇÃO CONTRA CLIQUE DIREITO ===
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        forceRedirect('Menu de contexto');
        return false;
    }, true);
    
    // === DETECÇÃO ULTRA AGRESSIVA DE DEVTOOLS ===
    
    // Método 1: Monitoramento de dimensões em tempo real
    let lastInnerWidth = window.innerWidth;
    let lastInnerHeight = window.innerHeight;
    
    setInterval(() => {
        const widthDiff = window.outerWidth - window.innerWidth;
        const heightDiff = window.outerHeight - window.innerHeight;
        
        if (widthDiff > 200 || heightDiff > 200) {
            if (!devToolsOpen) {
                devToolsOpen = true;
                forceRedirect('DevTools - Dimensões');
            }
        } else {
            devToolsOpen = false;
        }
        
        // Detecta mudanças bruscas na janela (indicando dock/undock do DevTools)
        const currentWidth = window.innerWidth;
        const currentHeight = window.innerHeight;
        
        if (Math.abs(currentWidth - lastInnerWidth) > 100 || 
            Math.abs(currentHeight - lastInnerHeight) > 100) {
            forceRedirect('DevTools - Redimensionamento suspeito');
        }
        
        lastInnerWidth = currentWidth;
        lastInnerHeight = currentHeight;
    }, 50); // Verificação muito frequente
    
    // Método 2: Console.log timing attack
    let start = performance.now();
    let element = new Image();
    Object.defineProperty(element, 'id', {
        get: function() {
            let end = performance.now();
            if (end - start > 100) { // Se demorou muito, console está aberto
                forceRedirect('Console timing attack');
            }
            start = performance.now();
            return 'console-detector';
        }
    });
    
    setInterval(() => {
        console.clear();
        console.log(element);
    }, 1000);
    
    // Método 3: Detecção via toString override
    let devtools = /./;
    devtools.toString = function() {
        forceRedirect('Console toString override');
        return 'DevTools detectado!';
    };
    
    console.log('%c ', devtools);
    
    // Método 4: Firebug detection
    setInterval(() => {
        if (typeof console.profile === 'function') {
            console.profile();
            console.profileEnd();
            if (console.clear) {
                console.clear();
            }
            forceRedirect('Profiler detectado');
        }
    }, 2000);
    
    // === PROTEÇÃO CONTRA AUTOMAÇÃO E BOTS ===
    
    // Detecta WebDriver
    if (navigator.webdriver) {
        forceRedirect('WebDriver detectado');
    }
    
    // Detecta Selenium e outras ferramentas
    const suspiciousProps = [
        'webdriver',
        '__webdriver_script_fn',
        '__selenium_unwrapped',
        '__fxdriver_unwrapped',
        '_Selenium_IDE_Recorder',
        'callSelenium',
        '_selenium',
        'calledSelenium',
        '$cdc_asdjflasutopfhvcZLmcfl_',
        '$chrome_asyncScriptInfo',
        '__$webdriverAsyncExecutor'
    ];
    
    suspiciousProps.forEach(prop => {
        if (window[prop] || document[prop]) {
            forceRedirect(`Automação detectada: ${prop}`);
        }
    });
    
    // Detecta headless browsers
    if (!window.outerWidth || !window.outerHeight) {
        forceRedirect('Navegador headless detectado');
    }
    
    // === PROTEÇÕES ADICIONAIS ===
    
    // Bloqueia seleção de texto
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        forceRedirect('Tentativa de seleção');
        return false;
    }, true);
    
    // Bloqueia drag and drop
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        forceRedirect('Tentativa de drag');
        return false;
    }, true);
    
    // Bloqueia impressão
    window.addEventListener('beforeprint', function(e) {
        e.preventDefault();
        forceRedirect('Tentativa de impressão');
        return false;
    }, true);
    
    // Detecta abertura de nova janela/aba (possível view-source)
    let windowCount = 1;
    setInterval(() => {
        if (window.length !== windowCount) {
            forceRedirect('Nova janela detectada');
        }
    }, 500);
    
    // === OFUSCAÇÃO E ANTI-TAMPERING ===
    
    // Detecta modificação do DOM (tentativa de remover proteção)
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.removedNodes.forEach(function(node) {
                    if (node.nodeType === Node.ELEMENT_NODE && 
                        (node.tagName === 'SCRIPT' || node.innerHTML.includes('podenao'))) {
                        forceRedirect('Tentativa de remoção de proteção');
                    }
                });
            }
        });
    });
    
    observer.observe(document, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
    });
    
    // Protege contra desabilitação
    Object.defineProperty(window, 'protectionActive', {
        value: true,
        writable: false,
        configurable: false
    });
    
    // Override de funções perigosas
    const originalConsole = console;
    Object.defineProperty(window, 'console', {
        get: function() {
            forceRedirect('Acesso ao console interceptado');
            return originalConsole;
        },
        set: function() {
            forceRedirect('Tentativa de modificar console');
        }
    });
    
    // Detecta tentativas de debug via breakpoints
    setInterval(() => {
        const before = performance.now();
        debugger;
        const after = performance.now();
        if (after - before > 100) {
            forceRedirect('Debugger detectado');
        }
    }, 3000);
    
    // === LIMPEZA E WARNINGS ===
    
    // Limpa console e mostra warning
    if (typeof console !== 'undefined') {
        try {
            console.clear();
            console.log('%cSTOP! ÁREA RESTRITA!', 'color: red; font-size: 30px; font-weight: bold; text-shadow: 2px 2px 4px #000;');
            console.log('%cEste site está protegido contra inspeção.', 'color: orange; font-size: 16px; font-weight: bold;');
            console.log('%cQualquer tentativa de acesso não autorizado será registrada.', 'color: red; font-size: 14px;');
        } catch(e) {
            // Console pode estar bloqueado
        }
    }
    
    // Disabilita algumas funcionalidades do navegador
    if (config.aggressiveMode) {
        // Disabilita reload
        window.addEventListener('beforeunload', function(e) {
            e.preventDefault();
            return 'Saída não autorizada';
        });
        
        // Bloqueia Ctrl+R e F5
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey && (e.key === 'r' || e.key === 'R')) || 
                e.key === 'F5' || e.keyCode === 116) {
                e.preventDefault();
                forceRedirect('Tentativa de reload');
                return false;
            }
        }, true);
    }
    
    // Log de ativação (apenas se debug ativado)
    if (config.debugMode) {
        console.log('%c[PODENAO] Proteção Ultra Ativada!', 'color: green; font-weight: bold;');
    }
    
    // Auto-execução de verificações
    setInterval(() => {
        // Verifica se ainda está na mesma página
        if (window.location.hostname !== window.location.hostname) {
            forceRedirect('Mudança de hostname detectada');
        }
        
        // Re-aplica proteções caso tenham sido removidas
        if (!protectionActive) {
            forceRedirect('Proteção foi desativada');
        }
    }, 1000);
    
})();
