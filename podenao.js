// podenao.js - Proteção contra inspeção e clonagem (Versão Corrigida)
(function() {
    'use strict';
    
    // Configurações de proteção
    const config = {
        maxInspectAttempts: 3,
        redirectUrl: 'https://www.google.com',
        delayBeforeRedirect: 100,
        allowDevTools: false,
        showWarnings: true
    };
    
    let inspectAttempts = 0;
    let isProtectionActive = true;
    
    // Função para redirecionar
    function redirectToGoogle() {
        if (inspectAttempts >= config.maxInspectAttempts && isProtectionActive) {
            if (config.showWarnings) {
                alert('Acesso negado! Redirecionando...');
            }
            setTimeout(() => {
                window.location.replace(config.redirectUrl);
            }, config.delayBeforeRedirect);
        }
    }
    
    // Função para incrementar tentativas
    function incrementAttempts(reason) {
        inspectAttempts++;
        console.warn(`Tentativa de inspeção detectada: ${reason}. Tentativas: ${inspectAttempts}/${config.maxInspectAttempts}`);
        redirectToGoogle();
    }
    
    // Bloqueia clique direito
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        e.stopPropagation();
        incrementAttempts('Menu de contexto');
        return false;
    }, false);
    
    // Detecta teclas de atalho para inspeção - CORRIGIDO
    document.addEventListener('keydown', function(e) {
        // F12
        if (e.keyCode === 123 || e.key === 'F12') {
            e.preventDefault();
            e.stopPropagation();
            incrementAttempts('F12');
            return false;
        }
        
        // Ctrl+Shift+I (Inspector)
        if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.key === 'I')) {
            e.preventDefault();
            e.stopPropagation();
            incrementAttempts('Ctrl+Shift+I');
            return false;
        }
        
        // Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && (e.keyCode === 74 || e.key === 'J')) {
            e.preventDefault();
            e.stopPropagation();
            incrementAttempts('Ctrl+Shift+J');
            return false;
        }
        
        // Ctrl+Shift+C (Inspect Element)
        if (e.ctrlKey && e.shiftKey && (e.keyCode === 67 || e.key === 'C')) {
            e.preventDefault();
            e.stopPropagation();
            incrementAttempts('Ctrl+Shift+C');
            return false;
        }
        
        // Ctrl+U (View Source)
        if (e.ctrlKey && (e.keyCode === 85 || e.key === 'u' || e.key === 'U')) {
            e.preventDefault();
            e.stopPropagation();
            incrementAttempts('Ctrl+U');
            return false;
        }
        
        // Ctrl+S (Save)
        if (e.ctrlKey && (e.keyCode === 83 || e.key === 's' || e.key === 'S')) {
            e.preventDefault();
            e.stopPropagation();
            incrementAttempts('Ctrl+S');
            return false;
        }
        
        // Ctrl+A (Select All) - limitado
        if (e.ctrlKey && (e.keyCode === 65 || e.key === 'a' || e.key === 'A')) {
            e.preventDefault();
            e.stopPropagation();
            incrementAttempts('Ctrl+A');
            return false;
        }
    }, true);
    
    // Detecta abertura do DevTools - MELHORADO
    if (!config.allowDevTools) {
        // Método 1: Console.log trick
        let devtools = {
            open: false,
            orientation: null
        };
        
        const threshold = 160;
        
        setInterval(() => {
            if (window.outerHeight - window.innerHeight > threshold || 
                window.outerWidth - window.innerWidth > threshold) {
                if (!devtools.open) {
                    devtools.open = true;
                    incrementAttempts('DevTools detectado');
                }
            } else {
                devtools.open = false;
            }
        }, 100);
        
        // Método 2: Console debugging trick
        let element = new Image();
        Object.defineProperty(element, 'id', {
            get: function() {
                incrementAttempts('Console debugging');
                return 'devtools-detector';
            }
        });
        console.log(element);
    }
    
    // Proteção contra clonagem
    const antiClone = {
        detectTools: function() {
            const userAgent = navigator.userAgent.toLowerCase();
            const suspicious = [
                'cyotek', 'httrack', 'wget', 'curl', 'scrapy', 
                'phantomjs', 'selenium', 'webdriver', 'chrome-headless'
            ];
            
            for (let tool of suspicious) {
                if (userAgent.includes(tool)) {
                    return true;
                }
            }
            
            // Detecta headless Chrome
            if (navigator.webdriver) {
                return true;
            }
            
            return false;
        },
        
        blockSuspicious: function() {
            if (this.detectTools()) {
                incrementAttempts('Ferramenta de clonagem detectada');
                document.body.innerHTML = '<h1>Acesso Negado</h1>';
                document.body.style.display = 'none';
                return true;
            }
            return false;
        }
    };
    
    // Executa verificação de clonagem
    if (antiClone.blockSuspicious()) {
        return; // Para a execução se detectar ferramentas suspeitas
    }
    
    // Proteção contra seleção excessiva
    let selectionCount = 0;
    document.addEventListener('selectstart', function(e) {
        selectionCount++;
        if (selectionCount > 5) {
            e.preventDefault();
            e.stopPropagation();
            incrementAttempts('Seleção excessiva');
            return false;
        }
    });
    
    // Bloqueia drag and drop
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        e.stopPropagation();
        incrementAttempts('Tentativa de drag and drop');
        return false;
    });
    
    // Detecta impressão
    window.addEventListener('beforeprint', function(e) {
        e.preventDefault();
        incrementAttempts('Tentativa de impressão');
        return false;
    });
    
    // Bloqueia save as
    window.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.keyCode === 83) { // Ctrl+Shift+S
            e.preventDefault();
            incrementAttempts('Save As');
            return false;
        }
    });
    
    // Reset de contadores
    let lastActivity = Date.now();
    
    function resetAttempts() {
        if (Date.now() - lastActivity > 60000) { // 1 minuto
            inspectAttempts = Math.max(0, inspectAttempts - 1);
        }
        lastActivity = Date.now();
    }
    
    // Atividades que resetam parcialmente o contador
    document.addEventListener('click', resetAttempts);
    document.addEventListener('scroll', resetAttempts);
    
    // Limpa contador de seleção
    setInterval(() => {
        selectionCount = Math.max(0, selectionCount - 1);
    }, 2000);
    
    // Proteção contra desabilitação do JavaScript
    Object.defineProperty(window, 'isProtectionActive', {
        value: true,
        writable: false,
        configurable: false
    });
    
    // Monitor de modificação do DOM para detectar tentativas de remoção
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.removedNodes.forEach(function(node) {
                    if (node.tagName === 'SCRIPT' && node.textContent && 
                        node.textContent.includes('podenao')) {
                        incrementAttempts('Tentativa de remoção do script');
                    }
                });
            }
        });
    });
    
    observer.observe(document, {
        childList: true,
        subtree: true
    });
    
    // Ofusca o console
    if (typeof console !== 'undefined') {
        console.clear();
        console.log('%cSTOP!', 'color: red; font-size: 50px; font-weight: bold;');
        console.log('%cEsta é uma função do navegador destinada a desenvolvedores. Se alguém lhe disse para copiar e colar algo aqui, é provável que seja uma tentativa de comprometer sua segurança.', 'color: red; font-size: 14px;');
    }
    
    // Log de ativação
    console.log('%cProteção podenao.js ATIVADA', 'color: green; font-weight: bold;');
    console.log('Tentativas permitidas:', config.maxInspectAttempts);
    
})();
